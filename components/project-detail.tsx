"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft, ExternalLink, Users, TrendingUp, Clock, Calendar,
  Globe, MessageCircle, Check, Flame, BarChart3, Wallet, Zap,
  ChevronDown, ChevronUp, Layers, Star,
  Loader2, AlertCircle, CheckCircle2, XCircle, Lock, Unlock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { getCollectionTheme, CollectionTheme } from "@/lib/collection-theme"
import {
  fetchProject,
  checkAllowlist,
  type Project,
  type AllowlistResult,
} from "@/lib/api"
import { TAO_NFT_ABI, getContractAddress, getDeployedChainId, getPhaseAllowlist, type OnChainPhase } from "@/lib/contracts"
import { getMerkleProof, isInAllowlist } from "@/lib/merkle"
import {
  useAccount,
  useChainId,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
} from "wagmi"
import { useAppKit } from "@reown/appkit/react"
import { formatUnits, parseUnits, zeroHash } from "viem"
import { recordOnChainMint } from "@/lib/api"

// ─── Rarity Badge Colors ───────────────────────────────────────────
function getRarityColor(rarity: string) {
  switch (rarity.toLowerCase()) {
    case "legendary":
    case "one of one":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case "mythic":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    case "ultra rare":
    case "epic":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30"
    case "rare":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }
}

function phaseStatusFromTimestamps(startTime: bigint, endTime: bigint, nowSecs?: number): "completed" | "active" | "upcoming" {
  const now = BigInt(nowSecs ?? Math.floor(Date.now() / 1000))
  if (now < startTime) return "upcoming"
  if (endTime !== 0n && now > endTime) return "completed"
  return "active"
}

function formatCountdown(secs: number): string {
  if (secs <= 0) return "00:00:00"
  const d = Math.floor(secs / 86400)
  const h = Math.floor((secs % 86400) / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (d > 0) return `${d}d ${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m`
  return [h, m, s].map(n => n.toString().padStart(2, "0")).join(":")
}

// ─── Main Component ────────────────────────────────────────────────
export function ProjectDetail() {
  const params = useParams()
  const slug = params.slug as string
  const theme = getCollectionTheme(slug)

  // ── Off-chain project data (API) ───────────────────────────────────────────
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllNFTs, setShowAllNFTs] = useState(false)

  // ── Allowlist checker (API-based for projects without contract) ────────────
  const [alWallet, setAlWallet] = useState("")
  const [alChecking, setAlChecking] = useState(false)
  const [alResult, setAlResult] = useState<AllowlistResult | null>(null)

  // ── On-chain minting state ─────────────────────────────────────────────────
  const [mintQuantity, setMintQuantity] = useState(1)
  const [mintSuccess, setMintSuccess] = useState<{ txHash: string; quantity: number } | null>(null)
  const [mintError, setMintError] = useState<string | null>(null)

  // Wallet context
  const { address: connectedWallet, isConnected } = useAccount()
  const chainId = useChainId()
  const { open: openWalletModal } = useAppKit()

  // Bittensor chains (mainnet 964, testnet 945) use 9 decimals (rao); all others use 18
  const nativeDecimals = (chainId === 964 || chainId === 945) ? 9 : 18
  const fmt = (wei: bigint) => formatUnits(wei, nativeDecimals)

  // Contract address for this slug — only valid if deployed on the connected chain
  const contractAddress = useMemo(() => getContractAddress(slug), [slug])
  const deployedChainId = useMemo(() => getDeployedChainId(slug), [slug])
  const hasContract = !!contractAddress && deployedChainId === chainId

  // ── Fetch off-chain project ────────────────────────────────────────────────
  const loadProject = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchProject(slug)
      if (!data) { setError("not_found"); return }
      setProject(data)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { loadProject() }, [loadProject])

  useEffect(() => {
    if (!project || project.status !== "live" || hasContract) return
    const id = setInterval(loadProject, 10_000)
    return () => clearInterval(id)
  }, [project?.status, loadProject, hasContract])

  // ── Countdown ticker ───────────────────────────────────────────────────────
  const [nowSecs, setNowSecs] = useState(() => Math.floor(Date.now() / 1000))
  useEffect(() => {
    const id = setInterval(() => setNowSecs(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  // ── On-chain reads ─────────────────────────────────────────────────────────

  const contractCfg = { address: contractAddress!, abi: TAO_NFT_ABI } as const

  const { data: onChainPhases, refetch: refetchPhases } = useReadContract({
    ...contractCfg,
    functionName: "getAllPhases",
    query: { enabled: hasContract, refetchInterval: 10_000 },
  })

  const { data: onChainTotalMinted, refetch: refetchMinted } = useReadContract({
    ...contractCfg,
    functionName: "totalMinted",
    query: { enabled: hasContract, refetchInterval: 10_000 },
  })

  // ── Selected phase (user-chosen when multiple are active) ──────────────────
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number | null>(null)

  // All phase indices that are currently active (by timestamp)
  const activePhaseIndices: number[] = useMemo(() => {
    if (!onChainPhases) return []
    return (onChainPhases as OnChainPhase[])
      .map((phase, idx) => ({ phase, idx }))
      .filter(({ phase }) => phaseStatusFromTimestamps(phase.startTime, phase.endTime, nowSecs) === "active")
      .map(({ idx }) => idx)
  }, [onChainPhases, nowSecs])

  // Auto-select first active phase; clear selection when no phases are active
  useEffect(() => {
    if (activePhaseIndices.length === 0) {
      setSelectedPhaseIndex(null)
    } else if (selectedPhaseIndex === null || !activePhaseIndices.includes(selectedPhaseIndex)) {
      setSelectedPhaseIndex(activePhaseIndices[0])
    }
  }, [activePhaseIndices.join(",")])

  const activeOnChainPhase: OnChainPhase | null = useMemo(() => {
    if (!onChainPhases || selectedPhaseIndex === null) return null
    return (onChainPhases as OnChainPhase[])[selectedPhaseIndex] ?? null
  }, [onChainPhases, selectedPhaseIndex])

  // How much can this wallet still mint in the selected phase?
  const { data: walletPhaseMinted } = useReadContract({
    ...contractCfg,
    functionName: "walletPhaseMintsOf",
    args: [connectedWallet!, BigInt(selectedPhaseIndex ?? 0)],
    query: { enabled: hasContract && !!connectedWallet && selectedPhaseIndex !== null },
  })

  const { data: walletTotalMinted } = useReadContract({
    ...contractCfg,
    functionName: "totalMints",
    args: [connectedWallet!],
    query: { enabled: hasContract && !!connectedWallet },
  })

  // Native balance of connected wallet
  const { data: walletBalance } = useBalance({
    address: connectedWallet,
    query: { enabled: !!connectedWallet },
  })

  // ── Allowlist / merkle ─────────────────────────────────────────────────────

  const isAllowlistPhase = !!activeOnChainPhase && activeOnChainPhase.merkleRoot !== zeroHash
  const phaseAllowlist = useMemo(
    () => getPhaseAllowlist(slug, selectedPhaseIndex ?? 0),
    [slug, selectedPhaseIndex]
  )

  const walletOnAllowlist = useMemo(() => {
    if (!isAllowlistPhase || !connectedWallet || !activeOnChainPhase) return true
    return isInAllowlist(phaseAllowlist, connectedWallet, activeOnChainPhase.merkleRoot, 0)
  }, [isAllowlistPhase, connectedWallet, activeOnChainPhase, phaseAllowlist])

  const merkleProof = useMemo(() => {
    if (!isAllowlistPhase || !connectedWallet) return [] as `0x${string}`[]
    return getMerkleProof(phaseAllowlist, connectedWallet, 0)
  }, [isAllowlistPhase, connectedWallet, phaseAllowlist])

  // ── Per-wallet mint limit ──────────────────────────────────────────────────

  const effectiveMaxPerWallet: number = useMemo(() => {
    if (!activeOnChainPhase) return project?.maxPerWallet ?? 10
    return activeOnChainPhase.maxPerWallet || 999
  }, [activeOnChainPhase, project])

  const alreadyMintedThisPhase = walletPhaseMinted ? Number(walletPhaseMinted) : 0
  const remainingForWallet = Math.max(0, effectiveMaxPerWallet - alreadyMintedThisPhase)

  // ── Write contract ─────────────────────────────────────────────────────────

  const { writeContract, data: txHash, isPending: isWritePending, error: writeError, reset: resetWrite } = useWriteContract()

  const { isLoading: isTxConfirming, isSuccess: isTxSuccess, data: txReceipt } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash },
  })

  // Update UI + sync DB after confirmed tx
  useEffect(() => {
    if (isTxSuccess && txHash && activeOnChainPhase && selectedPhaseIndex !== null) {
      setMintSuccess({ txHash, quantity: mintQuantity })
      setMintError(null)
      refetchPhases()
      refetchMinted()
      recordOnChainMint({
        slug,
        wallet: connectedWallet ?? "",
        txHash,
        quantity: mintQuantity,
        phaseIndex: selectedPhaseIndex,
        phaseName: activeOnChainPhase.name,
        priceEach: Number(fmt(activeOnChainPhase.price)),
      })
      setMintQuantity(1)
    }
  }, [isTxSuccess, txHash])

  // Surface write errors
  useEffect(() => {
    if (writeError) {
      const msg = (writeError as { shortMessage?: string })?.shortMessage
        ?? writeError.message
        ?? "Transaction failed"
      setMintError(msg)
    }
  }, [writeError])

  // ── Mint handler ───────────────────────────────────────────────────────────

  const handleOnChainMint = () => {
    if (!contractAddress || selectedPhaseIndex === null || !activeOnChainPhase) return
    setMintError(null)
    setMintSuccess(null)
    resetWrite()

    const totalCost = activeOnChainPhase.price * BigInt(mintQuantity)
    writeContract({
      address: contractAddress,
      abi: TAO_NFT_ABI,
      functionName: "mint",
      args: [
        BigInt(selectedPhaseIndex),
        BigInt(mintQuantity),
        merkleProof,
        0n, // maxAllowance: 0 = use phase default
      ],
      value: totalCost,
    })
  }

  // ── Allowlist checker (legacy API) ────────────────────────────────────────
  const handleCheckAllowlist = async () => {
    if (!alWallet.trim()) return
    setAlChecking(true)
    setAlResult(null)
    try {
      const result = await checkAllowlist(slug, alWallet.trim())
      setAlResult(result)
    } catch {
      setAlResult({ wallet: alWallet, allowed: false })
    } finally {
      setAlChecking(false)
    }
  }

  // ── Derived display values ─────────────────────────────────────────────────

  const displayMinted = hasContract && onChainTotalMinted !== undefined
    ? Number(onChainTotalMinted)
    : (project?.minted ?? 0)

  const displaySupply = project?.supply ?? 10_000

  const progress = displaySupply > 0 ? (displayMinted / displaySupply) * 100 : 0


  const displayCurrency = project?.currency ?? "TAO"

  const isMinting = isWritePending || isTxConfirming
  const canMint = hasContract
    ? (isConnected
        && selectedPhaseIndex !== null
        && !activeOnChainPhase?.paused
        && (walletOnAllowlist || !isAllowlistPhase)
        && remainingForWallet > 0
        && mintQuantity >= 1
        && !isMinting)
    : false

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            {error === "not_found" ? "Project Not Found" : "Error Loading Project"}
          </h1>
          <p className="text-gray-400 mb-8">{error === "not_found" ? "This project doesn't exist." : error}</p>
          <Link href="/"><Button className="bg-gradient-to-r from-purple-500 to-purple-600">Back to Launchpad</Button></Link>
        </div>
      </div>
    )
  }

  const visibleNFTs = showAllNFTs ? project.sampleNFTs : project.sampleNFTs.slice(0, 6)

  const statusMap: Record<string, { color: string; text: string }> = {
    live:     { color: "bg-green-500/20 text-green-400 border-green-500/30", text: "Live Now" },
    upcoming: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30",   text: "Upcoming" },
    ended:    { color: "bg-gray-500/20 text-gray-400 border-gray-500/30",   text: "Ended" },
  }
  const { color: statusColor, text: statusText } = statusMap[project.status] ?? statusMap.ended

  // ── Render phases from on-chain data (if available) ────────────────────────
  const renderPhases = () => {
    if (hasContract && onChainPhases && (onChainPhases as OnChainPhase[]).length > 0) {
      return (onChainPhases as OnChainPhase[]).map((phase, idx) => {
        const status    = phaseStatusFromTimestamps(phase.startTime, phase.endTime, nowSecs)
        const isActive  = status === "active"
        const isDone    = status === "completed"
        const isSelected = isActive && selectedPhaseIndex === idx
        const secsLeft  = isActive && phase.endTime > 0n
          ? Math.max(0, Number(phase.endTime) - nowSecs)
          : null
        const secsUntil = status === "upcoming"
          ? Math.max(0, Number(phase.startTime) - nowSecs)
          : null

        return (
          <div
            key={idx}
            onClick={() => isActive && setSelectedPhaseIndex(idx)}
            className={`rounded-lg border p-3 transition-all ${
              isSelected
                ? `border-green-500/50 bg-green-500/10 ring-1 ring-green-500/30 cursor-pointer`
                : isActive
                ? "border-green-500/20 bg-green-500/5 cursor-pointer hover:border-green-500/40 hover:bg-green-500/8"
                : isDone
                ? "border-purple-500/20 bg-purple-500/5"
                : "border-gray-700/30 bg-gray-900/30"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                  isActive ? "bg-green-500/20" : isDone ? "bg-purple-500/20" : "bg-gray-700/20"
                }`}>
                  {isActive ? <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                   : isDone  ? <Check className="w-4 h-4 text-purple-400" />
                   : <Clock className="w-4 h-4 text-gray-400" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-semibold text-white text-sm">{phase.name}</p>
                    {phase.merkleRoot !== zeroHash
                      ? <Lock className="w-3 h-3 text-yellow-400 flex-shrink-0" title="Allowlist required" />
                      : <Unlock className="w-3 h-3 text-gray-500 flex-shrink-0" title="Public phase" />}
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {fmt(phase.price)} {displayCurrency} · {phase.minted.toLocaleString()}/{phase.maxSupply > 0 ? phase.maxSupply.toLocaleString() : "∞"}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 flex flex-col items-end gap-1">
                {isActive && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">LIVE</Badge>
                )}
                {isDone && (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">DONE</Badge>
                )}
                {secsLeft !== null && (
                  <span className="text-[10px] text-gray-500 font-mono tabular-nums">ends {formatCountdown(secsLeft)}</span>
                )}
                {secsUntil !== null && (
                  <span className="text-[10px] text-gray-500 font-mono tabular-nums">in {formatCountdown(secsUntil)}</span>
                )}
              </div>
            </div>
          </div>
        )
      })
    }

    // Fall back to DB phases (no on-chain data)
    return project.phases.map((phase, idx) => {
      const isActive    = phase.status === "active"
      const isCompleted = phase.status === "completed"
      return (
        <div
          key={idx}
          className={`rounded-lg border p-3 ${
            isActive    ? "border-green-500/30 bg-green-500/5"
            : isCompleted ? "border-purple-500/20 bg-purple-500/5"
            : "border-gray-700/30 bg-gray-900/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isActive ? "bg-green-500/20" : isCompleted ? "bg-purple-500/20" : "bg-gray-700/20"
              }`}>
                {isActive    ? <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                : isCompleted ? <Check className="w-4 h-4 text-purple-400" />
                : <Clock className="w-4 h-4 text-gray-400" />}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{phase.name}</p>
                <p className="text-xs text-gray-400">
                  {phase.price} {project.currency} · {phase.minted.toLocaleString()}/{phase.supply || "∞"}
                </p>
              </div>
            </div>
            {isActive    && <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">LIVE</Badge>}
            {isCompleted && <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">DONE</Badge>}
          </div>
        </div>
      )
    })
  }

  // ── Render minting panel ───────────────────────────────────────────────────
  const renderMintPanel = () => {
    if (!hasContract) {
      return (
        <div className="space-y-2 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-yellow-400 text-sm font-medium">Contract not yet deployed to this network</p>
          <p className="text-gray-400 text-xs">Run <code className="bg-white/10 px-1 rounded">pnpm deploy:sepolia</code> in the contracts folder, then connect to Sepolia.</p>
        </div>
      )
    }

    if (project.status !== "live") {
      return (
        <Button
          className={`w-full bg-gradient-to-r ${theme.mintButton} text-white py-3 font-semibold opacity-60`}
          disabled size="lg"
        >
          {project.status === "upcoming"
            ? <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />Coming Soon</span>
            : <span className="flex items-center gap-2"><Clock className="w-4 h-4" />Ended</span>}
        </Button>
      )
    }

    if (!isConnected) {
      return (
        <Button
          className={`w-full bg-gradient-to-r ${theme.mintButton} ${theme.mintButtonHover} text-white py-3 font-semibold`}
          size="lg"
          onClick={() => openWalletModal()}
        >
          <span className="flex items-center gap-2"><Wallet className="w-4 h-4" />Connect Wallet to Mint</span>
        </Button>
      )
    }

    if (selectedPhaseIndex === null || activePhaseIndices.length === 0) {
      // Show upcoming countdown if any phase is coming
      const upcomingPhase = onChainPhases
        ? (onChainPhases as OnChainPhase[]).find(p => phaseStatusFromTimestamps(p.startTime, p.endTime, nowSecs) === "upcoming")
        : null
      const secsUntil = upcomingPhase ? Math.max(0, Number(upcomingPhase.startTime) - nowSecs) : null
      return (
        <div className="text-center py-4 space-y-1">
          <p className="text-gray-400 text-sm">No active mint phase right now</p>
          {secsUntil !== null && (
            <p className="text-white font-mono text-lg font-bold">{formatCountdown(secsUntil)}</p>
          )}
        </div>
      )
    }

    // ── Phase selector (only shown when multiple phases are active) ────────
    const multiPhase = activePhaseIndices.length > 1

    // ── Per-phase guard states ─────────────────────────────────────────────
    if (isAllowlistPhase && !walletOnAllowlist) {
      return (
        <div className="space-y-3">
          {multiPhase && (
            <div className="flex gap-2 flex-wrap">
              {activePhaseIndices.map(i => {
                const ph = (onChainPhases as OnChainPhase[])[i]
                return (
                  <button key={i} onClick={() => setSelectedPhaseIndex(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      selectedPhaseIndex === i
                        ? `bg-white/15 border-white/30 text-white`
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                    }`}>
                    {ph.name}
                  </button>
                )
              })}
            </div>
          )}
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-400 font-medium">Not on Allowlist</p>
            <p className="text-gray-500 text-xs mt-1">This phase requires allowlist access.</p>
          </div>
        </div>
      )
    }

    if (remainingForWallet === 0) {
      return (
        <div className="space-y-3">
          {multiPhase && (
            <div className="flex gap-2 flex-wrap">
              {activePhaseIndices.map(i => {
                const ph = (onChainPhases as OnChainPhase[])[i]
                return (
                  <button key={i} onClick={() => setSelectedPhaseIndex(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      selectedPhaseIndex === i
                        ? "bg-white/15 border-white/30 text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                    }`}>
                    {ph.name}
                  </button>
                )
              })}
            </div>
          )}
          <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
            <CheckCircle2 className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-orange-400 font-medium">Phase limit reached</p>
            <p className="text-gray-500 text-xs mt-1">
              {alreadyMintedThisPhase} / {effectiveMaxPerWallet} minted in this phase
            </p>
          </div>
        </div>
      )
    }

    const totalCostWei = activeOnChainPhase ? activeOnChainPhase.price * BigInt(mintQuantity) : 0n
    const hasEnoughBalance = walletBalance ? walletBalance.value >= totalCostWei : true
    const secsLeft = activeOnChainPhase && activeOnChainPhase.endTime > 0n
      ? Math.max(0, Number(activeOnChainPhase.endTime) - nowSecs)
      : null

    return (
      <div className="space-y-4">
        {/* Phase selector tabs (only when multiple active) */}
        {multiPhase && (
          <div className="flex gap-2 flex-wrap">
            {activePhaseIndices.map(i => {
              const ph = (onChainPhases as OnChainPhase[])[i]
              return (
                <button key={i} onClick={() => { setSelectedPhaseIndex(i); setMintQuantity(1) }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedPhaseIndex === i
                      ? "bg-white/15 border-white/30 text-white"
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  }`}>
                  {ph.name}
                </button>
              )
            })}
          </div>
        )}

        {/* Phase info row */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            {isAllowlistPhase
              ? <><Lock className="w-3 h-3 text-yellow-400" /><span className="text-yellow-400">Allowlist</span></>
              : <><Unlock className="w-3 h-3 text-gray-500" /><span>Public</span></>}
            {isAllowlistPhase && walletOnAllowlist && (
              <span className="flex items-center gap-1 text-green-400">
                <CheckCircle2 className="w-3 h-3" />verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-gray-500">
              {alreadyMintedThisPhase}/{effectiveMaxPerWallet === 999 ? "∞" : effectiveMaxPerWallet} used
            </span>
            {secsLeft !== null && (
              <span className="font-mono text-orange-400 tabular-nums">⏱ {formatCountdown(secsLeft)}</span>
            )}
          </div>
        </div>

        {/* Quantity + cost */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"
              onClick={() => setMintQuantity(Math.max(1, mintQuantity - 1))}
              disabled={mintQuantity <= 1}
              className="h-9 w-9 p-0 text-lg">−</Button>
            <span className="text-white font-bold text-lg w-8 text-center tabular-nums">{mintQuantity}</span>
            <Button variant="outline" size="sm"
              onClick={() => setMintQuantity(Math.min(remainingForWallet, mintQuantity + 1))}
              disabled={mintQuantity >= remainingForWallet}
              className="h-9 w-9 p-0 text-lg">+</Button>
          </div>
          <div className="flex-1 p-2.5 rounded-lg bg-white/5 border border-white/10 text-center">
            <p className="text-[10px] text-gray-500">Total</p>
            <p className={`text-sm font-bold ${hasEnoughBalance ? "text-white" : "text-red-400"}`}>
              {fmt(totalCostWei)} {displayCurrency}
            </p>
          </div>
        </div>

        {!hasEnoughBalance && (
          <p className="text-xs text-red-400 text-center">Insufficient balance</p>
        )}

        <Button
          className={`w-full bg-gradient-to-r ${theme.mintButton} ${theme.mintButtonHover} text-white py-3 font-semibold`}
          disabled={!canMint || !hasEnoughBalance}
          size="lg"
          onClick={handleOnChainMint}
        >
          {isMinting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {isWritePending ? "Confirm in wallet…" : "Confirming tx…"}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Mint {mintQuantity} NFT{mintQuantity > 1 ? "s" : ""}
            </span>
          )}
        </Button>

        {txHash && !isTxSuccess && (
          <p className="text-[10px] text-gray-500 text-center truncate">
            TX: {txHash.slice(0, 10)}…{txHash.slice(-8)}
          </p>
        )}
      </div>
    )
  }

  // ── Full render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Banner */}
      <div className="relative w-full h-52 sm:h-72 overflow-hidden">
        <Image src={project.logoWide} alt={project.name} fill
          className="object-cover" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
        <div className="absolute top-4 left-4 sm:left-8 z-10">
          <Link href="/"
            className={`inline-flex items-center gap-1.5 text-sm ${theme.textAccent} ${theme.textAccentHover} backdrop-blur-sm bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg transition-colors`}>
            <ArrowLeft className="w-4 h-4" />Back to Launchpad
          </Link>
        </div>
      </div>

      {/* Profile strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end gap-5 -mt-14 mb-8 relative z-10">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden ring-4 ring-black flex-shrink-0 shadow-2xl">
            <Image src={project.logoSquare} alt={project.name} fill className="object-cover" sizes="128px" />
          </div>
          <div className="pb-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <Badge className={`${statusColor} text-xs px-3 py-1`}>
                {project.status === "live" && <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse inline-block" />}
                {statusText}
              </Badge>
              {hasContract && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs px-3 py-1">On-Chain</Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{project.name}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{project.tagline}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid lg:grid-cols-2 gap-8">

          {/* ─── Left Column ─── */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">About this collection</h2>
              <p className="text-gray-300 leading-relaxed">{project.description}</p>
            </div>

            {/* Contract info */}
            {hasContract && contractAddress && (
              <div className={`rounded-2xl border ${theme.cardBorder} bg-black/40 p-4`}>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Layers className={`w-4 h-4 ${theme.textAccent}`} />
                  On-Chain Contract
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Address</span>
                    <span className="text-white font-mono">{contractAddress.slice(0, 10)}…{contractAddress.slice(-8)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Minted</span>
                    <span className="text-white">{Number(onChainTotalMinted ?? 0).toLocaleString()} / {project.supply.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Standard</span>
                    <span className="text-white">ERC-721A + ERC-2981</span>
                  </div>
                </div>
              </div>
            )}

            {/* Social links */}
            <div className={`rounded-2xl border ${theme.cardBorder} bg-black/40 p-6`}>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Globe className={`w-5 h-5 ${theme.textAccent}`} />
                Community
              </h3>
              <div className="flex flex-wrap gap-3">
                {project.twitter ? (
                  <a href={project.twitter} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">
                    <MessageCircle className="w-4 h-4" />Twitter
                  </a>
                ) : null}
                {project.discord ? (
                  <a href={project.discord} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">
                    <Users className="w-4 h-4" />Discord
                  </a>
                ) : null}
                {project.website ? (
                  <a href={project.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">
                    <Globe className="w-4 h-4" />Website
                  </a>
                ) : null}
                {!project.twitter && !project.discord && !project.website && (
                  <p className="text-sm text-gray-500">No social links added yet.</p>
                )}
              </div>
            </div>

            {/* NFT Gallery */}
            {project.sampleNFTs.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Recently Minted</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {visibleNFTs.map((nft) => (
                    <div key={nft._id} className="rounded-xl border border-white/10 bg-black/40 overflow-hidden">
                      <div className="relative aspect-square">
                        <Image src={nft.image} alt={nft.name} fill className="object-cover" />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-white truncate mb-2">{nft.name}</p>
                        <div className="flex items-center justify-between">
                          <Badge className={`${getRarityColor(nft.rarity)} text-[10px] px-2 py-1`}>{nft.rarity}</Badge>
                          <span className="text-[10px] text-gray-500 font-mono">{nft.mintedBy}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {project.sampleNFTs.length > 6 && (
                  <Button variant="outline" onClick={() => setShowAllNFTs(!showAllNFTs)}
                    className={`w-full ${theme.textAccent} border-white/20 hover:bg-white/10`}>
                    {showAllNFTs ? "Show Less" : `Show All (${project.sampleNFTs.length})`}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* ─── Right Column ─── */}
          <div className="space-y-6">
            <div className={`rounded-2xl border ${theme.cardBorder} bg-black/40 p-6`}>
              {/* Phases */}
              <div className="space-y-2 mb-5">{renderPhases()}</div>

              {/* Overall progress */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>{displayMinted.toLocaleString()} / {displaySupply.toLocaleString()} minted</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <Progress value={progress} className={`h-2 ${theme.separator}`} />
              </div>

              {/* Mint panel */}
              {renderMintPanel()}

              {/* Success toast */}
              {mintSuccess && (
                <div className="mt-3 flex items-center gap-2 text-green-400 text-sm p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Minted {mintSuccess.quantity} NFT{mintSuccess.quantity > 1 ? "s" : ""}!{" "}
                    <span className="font-mono text-xs opacity-70">{mintSuccess.txHash.slice(0, 10)}…</span>
                  </span>
                </div>
              )}

              {/* Error toast */}
              {mintError && (
                <div className="mt-3 flex items-center gap-2 text-red-400 text-sm p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {mintError}
                </div>
              )}

              <p className="text-[10px] text-gray-600 text-center mt-2">
                {project.participants.toLocaleString()} holders
              </p>
            </div>

            {/* Allowlist Checker */}
            <div className={`rounded-2xl border ${theme.cardBorder} bg-black/40 p-6`}>
              <h2 className="text-lg font-bold text-white mb-4">Allowlist Checker</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  value={alWallet}
                  onChange={(e) => { setAlWallet(e.target.value); setAlResult(null) }}
                  placeholder="Paste wallet address (0x...)"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                />
                <Button
                  className={`w-full bg-gradient-to-r ${theme.mintButton} ${theme.mintButtonHover} text-white font-medium`}
                  onClick={handleCheckAllowlist}
                  disabled={alChecking || !alWallet.trim()}
                >
                  {alChecking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Check
                </Button>
                {alResult && (
                  <div className={`flex items-center gap-2 text-sm p-3 rounded-lg border ${
                    alResult.allowed
                      ? "text-green-400 bg-green-500/10 border-green-500/20"
                      : "text-red-400 bg-red-500/10 border-red-500/20"
                  }`}>
                    {alResult.allowed
                      ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      : <XCircle className="w-4 h-4 flex-shrink-0" />}
                    {alResult.allowed ? "Wallet is on the allowlist!" : "Wallet is not on the allowlist."}
                  </div>
                )}
              </div>
            </div>

            {/* Highlights */}
            {project.highlights.length > 0 && (
              <div className={`rounded-2xl border ${theme.cardBorder} bg-black/40 p-6`}>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Star className={`w-5 h-5 ${theme.textAccent}`} />
                  Highlights
                </h2>
                <ul className="space-y-2">
                  {project.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle2 className={`w-4 h-4 ${theme.textAccent} flex-shrink-0 mt-0.5`} />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Utilities */}
            {project.utilities.length > 0 && (
              <div className={`rounded-2xl border ${theme.cardBorder} bg-black/40 p-6`}>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className={`w-5 h-5 ${theme.textAccent}`} />
                  Utility
                </h2>
                <ul className="space-y-2">
                  {project.utilities.map((u, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <div className={`w-1.5 h-1.5 rounded-full ${theme.textAccent.replace("text-", "bg-")} flex-shrink-0 mt-1.5`} />
                      {u}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
