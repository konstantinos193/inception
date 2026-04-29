"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ExternalLink, Users, TrendingUp, Clock, Calendar,
  Globe, MessageCircle, Check, BarChart3, Wallet, Zap,
  Loader2, AlertCircle, CheckCircle2, XCircle, Lock, Unlock,
} from "lucide-react"
import { IMAGE_SIZES } from "@/lib/collection-images"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getCollectionTheme, CollectionTheme } from "@/lib/collection-theme"
import {
  fetchProject,
  fetchSignature,
  fetchOnChainStatus,
  checkAllowlist,
  fetchRecentlyMinted,
  fetchNFTRarity,
  fetchRarityStats,
  type Project,
  type AllowlistResult,
  type OnChainStatus,
  type SampleNFT,
  type NFTRarity,
} from "@/lib/api"
import { TAO_NFT_ABI, type OnChainPhase } from "@/lib/contracts"
import {
  useAccount,
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
  usePublicClient,
} from "wagmi"
import { useAppKit } from "@reown/appkit/react"
import { formatUnits, parseUnits, zeroAddress, decodeErrorResult } from "viem"
import { 
  recordOnChainMint, 
  fetchWalletPhaseMints,
  submitMintForConfirmation,
  getTransactionStatus,
} from "@/lib/api"

// ─── Contract error → human message ───────────────────────────────────────────
const CONTRACT_ERRORS: Record<string, string> = {
  MintGloballyPaused:       "Minting is globally paused.",
  PhasePausedError:         "This phase is currently paused.",
  PhaseNotStarted:          "This phase has not started yet.",
  PhaseEnded:               "This phase has ended.",
  ExceedsCollectionSupply:  "Collection is sold out.",
  ExceedsPhaseSupply:       "Phase supply is exhausted.",
  ExceedsPhaseWalletLimit:  "You have reached the max mints for this phase.",
  ExceedsGlobalWalletLimit: "You have reached the max mints for this collection.",
  InvalidSignature:         "Allowlist signature is invalid — please refresh and try again.",
  InvalidQuantity:          "Invalid quantity.",
  InsufficientPayment:      "Insufficient ETH sent.",
  TokensLocked:             "Token transfers are currently locked.",
  ReservedSupplyExceeded:   "Reserved supply exceeded.",
}

function decodeContractError(err: any, abi: any[]): string | null {
  try {
    // Viem wraps the revert data in err.cause.data or err.data
    const data: `0x${string}` | undefined =
      err?.cause?.data ?? err?.data ?? err?.cause?.cause?.data
    if (!data || data === "0x") return null
    const decoded = decodeErrorResult({ abi, data })
    return CONTRACT_ERRORS[decoded.errorName] ?? `Contract error: ${decoded.errorName}`
  } catch {
    return null
  }
}

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
  const [recentlyMinted, setRecentlyMinted] = useState<SampleNFT[]>([])
  const [loadingNFTs, setLoadingNFTs] = useState(false)
  const [nftRarityData, setNftRarityData] = useState<Map<number, NFTRarity>>(new Map())

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
  const publicClient = usePublicClient()

  // TAO EVM uses 18 decimals (1 TAO = 1e18 wei), same as ETH
  const nativeDecimals = 18
  const fmt = (wei: bigint) => formatUnits(wei, nativeDecimals)

  // On-chain status fetched from backend (backend makes the RPC call, not the frontend)
  const [onChainStatus, setOnChainStatus] = useState<OnChainStatus | null>(null)

  const loadOnChainStatus = useCallback(async () => {
    try {
      const status = await fetchOnChainStatus(slug)
      setOnChainStatus(status)
    } catch {}
  }, [slug])

  useEffect(() => { loadOnChainStatus() }, [loadOnChainStatus])

  useEffect(() => {
    const id = setInterval(loadOnChainStatus, 15_000)
    return () => clearInterval(id)
  }, [loadOnChainStatus])

  const contractAddress = (onChainStatus?.deployed ? onChainStatus.contractAddress : null) as `0x${string}` | null
  const hasContract = !!onChainStatus?.deployed
  const onCorrectChain = onChainStatus?.chainId === chainId

  // ── Countdown ticker ───────────────────────────────────────────────────────
  const [nowSecs, setNowSecs] = useState(() => Math.floor(Date.now() / 1000))
  useEffect(() => {
    const id = setInterval(() => setNowSecs(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  // ── On-chain data from backend status ─────────────────────────────────────

  // Convert backend's string-price phases to OnChainPhase (BigInt) format for compatibility
  const onChainPhases: OnChainPhase[] | undefined = useMemo(() => {
    if (!onChainStatus?.deployed || !onChainStatus.onChain) return undefined
    return onChainStatus.onChain.phases.map(p => ({
      name: p.name,
      startTime: BigInt(p.startTime),
      endTime: BigInt(p.endTime),
      price: parseUnits(p.price, nativeDecimals),
      maxPerWallet: p.maxPerWallet,
      maxSupply: p.maxSupply,
      minted: p.minted,
      signer: p.signer,
      paused: p.paused,
    }))
  }, [onChainStatus, nativeDecimals])

  const onChainTotalMinted: number | undefined = onChainStatus?.deployed
    ? onChainStatus.onChain?.totalMinted
    : undefined

  const onChainTransfersLocked: boolean | undefined = onChainStatus?.deployed
    ? onChainStatus.onChain?.transfersLocked
    : undefined

  // Derive status from on-chain phases when available, otherwise fall back to DB status
  const derivedStatus = useMemo(() => {
    if (hasContract && onChainPhases && onChainPhases.length > 0) {
      const hasActive = onChainPhases.some(p => phaseStatusFromTimestamps(p.startTime, p.endTime, nowSecs) === "active")
      const hasUpcoming = onChainPhases.some(p => phaseStatusFromTimestamps(p.startTime, p.endTime, nowSecs) === "upcoming")
      if (hasActive) return "live"
      if (hasUpcoming) return "upcoming"
      return "ended"
    }
    return project?.status ?? "ended"
  }, [hasContract, onChainPhases, nowSecs, project?.status])

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

  // How many has this wallet minted in the selected phase? — fetched from backend (backend reads chain)
  const [walletPhaseMinted, setWalletPhaseMinted] = useState<number>(0)

  // Check if user is on allowlist for the active phase
  const [userOnAllowlist, setUserOnAllowlist] = useState<boolean | null>(null)
  const [userMaxAllowance, setUserMaxAllowance] = useState<number>(0)

  // Check allowlist status when wallet or phase changes
  useEffect(() => {
    const checkUserAllowlist = async () => {
      if (!connectedWallet || !activeOnChainPhase || activeOnChainPhase.signer === zeroAddress) {
        setUserOnAllowlist(null)
        setUserMaxAllowance(0)
        return
      }

      try {
        const result = await fetchSignature(slug, selectedPhaseIndex!, connectedWallet)
        setUserOnAllowlist(result.allowed)
        setUserMaxAllowance(result.maxAllowance)
      } catch (error) {
        console.error("Failed to check allowlist status:", error)
        setUserOnAllowlist(false)
        setUserMaxAllowance(0)
      }
    }

    checkUserAllowlist()
  }, [connectedWallet, slug, activeOnChainPhase, selectedPhaseIndex])

  // Load recently minted NFTs
  useEffect(() => {
    if (!slug) return

    const loadRecentlyMinted = async (showSpinner: boolean) => {
      try {
        if (showSpinner) setLoadingNFTs(true)
        const nfts = await fetchRecentlyMinted(slug)
        setRecentlyMinted(nfts)

        // Load rarity data only if rarity has been calculated for this collection
        const rarityMap = new Map<number, NFTRarity>()
        try {
          const stats = await fetchRarityStats(slug)
          if (stats.statistics.total > 0) {
            for (const nft of nfts) {
              try {
                const rarity = await fetchNFTRarity(slug, nft.tokenId)
                rarityMap.set(nft.tokenId, rarity)
              } catch (_) { /* token not in rarity_data yet */ }
            }
          }
        } catch (_) { /* rarity stats not available */ }
        setNftRarityData(rarityMap)
      } catch (error) {
        console.error("Failed to load recently minted NFTs:", error)
        if (showSpinner) setRecentlyMinted([])
      } finally {
        if (showSpinner) setLoadingNFTs(false)
      }
    }

    // Initial load shows the spinner
    loadRecentlyMinted(true)

    // Background polling refreshes silently (no spinner)
    const interval = setInterval(() => loadRecentlyMinted(false), 30000)
    return () => clearInterval(interval)
  }, [slug])

  // Helper to get block explorer URL for NFT
  const getExplorerUrl = (tokenId: number) => {
    if (!contractAddress) return null
    
    // For TAO networks, use the /instance/ URL format
    if (chainId === 964) {
      return `https://evm.taostats.io/token/${contractAddress}/instance/${tokenId}`
    }
    if (chainId === 945) {
      return `https://test.taostats.io/token/${contractAddress}/instance/${tokenId}`
    }
    
    // For other networks, use the standard format
    const explorerBase = 
      chainId === 11155111 ? "https://sepolia.etherscan.io" :
      "https://etherscan.io"
    
    return `${explorerBase}/token/${contractAddress}?a=${tokenId}`
  }

  // Handle NFT click - open in block explorer
  const handleNFTClick = (tokenId: number) => {
    const explorerUrl = getExplorerUrl(tokenId)
    if (explorerUrl) {
      window.open(explorerUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // Timeout fallback for slow RPC
  const [txSubmitted, setTxSubmitted] = useState<boolean>(false)
  const [txSubmittedTime, setTxSubmittedTime] = useState<number>(0)

  useEffect(() => {
    if (!hasContract || !connectedWallet || selectedPhaseIndex === null) {
      setWalletPhaseMinted(0)
      return
    }
    let cancelled = false
    fetchWalletPhaseMints(slug, selectedPhaseIndex, connectedWallet).then(n => {
      if (!cancelled) setWalletPhaseMinted(n)
    })
    return () => { cancelled = true }
  }, [hasContract, connectedWallet, selectedPhaseIndex, slug])

  // Native balance of connected wallet
  const { data: walletBalance } = useBalance({
    address: connectedWallet,
    query: { enabled: !!connectedWallet },
  })

  // ── Allowlist / ECDSA signature — fetched from backend on demand ──────────
  // address(0) = public phase; any other address = backend must sign for the wallet

  const isAllowlistPhase = !!activeOnChainPhase && activeOnChainPhase.signer !== zeroAddress

  const [sigData, setSigData] = useState<{
    signature: `0x${string}` | null
    allowed: boolean
    maxAllowance: number
  } | null>(null)

  useEffect(() => {
    if (!isAllowlistPhase || !connectedWallet || selectedPhaseIndex === null) {
      setSigData(null)
      return
    }
    fetchSignature(slug, selectedPhaseIndex, connectedWallet).then((data) => {
      console.log("[allowlist] signature response:", {
        phaseIndex: selectedPhaseIndex,
        wallet: connectedWallet,
        allowed: data.allowed,
        maxAllowance: data.maxAllowance,
        hasSignature: !!data.signature,
      })
      setSigData(data)
    }).catch((err) => {
      console.error("[allowlist] fetchSignature failed:", err)
      setSigData({ signature: null, allowed: false, maxAllowance: 0 })
    })
  }, [isAllowlistPhase, connectedWallet, selectedPhaseIndex, slug])

  const walletOnAllowlist = isAllowlistPhase ? (sigData?.allowed ?? false) : true
  const mintSignature     = sigData?.signature ?? "0x"
  const wlMaxAllowance    = sigData?.maxAllowance ?? 0

  // ── Per-wallet mint limit (per-phase only, 0 = unlimited) ─────────────────

  const effectiveMaxPerWallet: number = useMemo(() => {
    if (!activeOnChainPhase) return 0
    return activeOnChainPhase.maxPerWallet  // 0 = unlimited per contract
  }, [activeOnChainPhase])

  const alreadyMintedThisPhase = walletPhaseMinted
  const remainingForWallet = effectiveMaxPerWallet === 0
    ? Number.MAX_SAFE_INTEGER
    : Math.max(0, effectiveMaxPerWallet - alreadyMintedThisPhase)

  // ── Write contract ─────────────────────────────────────────────────────────

  const { writeContractAsync, data: txHash, isPending: isWritePending, error: writeError, reset: resetWrite } = useWriteContract()

  const [txConfirmed, setTxConfirmed] = useState<boolean>(false)
  const [txConfirming, setTxConfirming] = useState<boolean>(false)

  useEffect(() => {
    if (txHash && activeOnChainPhase && selectedPhaseIndex !== null && !txConfirmed) {
      setTxConfirming(true)
      
      submitMintForConfirmation({
        txHash,
        chainId,
        slug,
        wallet: connectedWallet ?? "",
        quantity: mintQuantity,
        phaseIndex: selectedPhaseIndex,
        phaseName: activeOnChainPhase.name,
        priceEach: Number(activeOnChainPhase.price),
      }).then(() => {
        const pollInterval = setInterval(async () => {
          try {
            const status = await getTransactionStatus({
              txHash,
              chainId,
              network: chainId === 11155111 ? "sepolia" : 
                      chainId === 964 ? "mainnet" : 
                      chainId === 945 ? "testnet" : "mainnet"
            })
            
            if (status.confirmed) {
              setTxConfirmed(true)
              setTxConfirming(false)
              clearInterval(pollInterval)
              
              setMintSuccess({ txHash, quantity: mintQuantity })
              setMintError(null)
              loadOnChainStatus()
              
              if (connectedWallet) {
                fetchWalletPhaseMints(slug, selectedPhaseIndex, connectedWallet).then(setWalletPhaseMinted)
              }
            }
          } catch (error) {
            console.error("Error checking transaction status:", error)
          }
        }, 2000) // Poll every 2 seconds
        
        setTimeout(() => {
          clearInterval(pollInterval)
          setTxConfirming(false)
        }, 60000)
        
        return () => clearInterval(pollInterval)
      }).catch(() => {
        setTxConfirming(false)
      })
    }
  }, [txHash, activeOnChainPhase, selectedPhaseIndex, slug, connectedWallet, mintQuantity, txConfirmed])

  useEffect(() => {
    if (writeError) {
      const decoded = decodeContractError(writeError, TAO_NFT_ABI)
      console.error("[mint] writeError:", writeError)
      const msg = decoded
        ?? (writeError as { shortMessage?: string })?.shortMessage
        ?? writeError.message
        ?? "Transaction failed"
      setMintError(msg)
    }
  }, [writeError])

  // ── Mint handler ───────────────────────────────────────────────────────────

  const handleOnChainMint = async () => {
    if (!contractAddress || selectedPhaseIndex === null || !activeOnChainPhase || !publicClient) return
    setMintError(null)
    setMintSuccess(null)
    resetWrite()

    const totalCost = activeOnChainPhase.price * BigInt(mintQuantity)
    const mintArgs = {
      address: contractAddress,
      abi: TAO_NFT_ABI,
      functionName: "mint" as const,
      args: [
        BigInt(selectedPhaseIndex),
        BigInt(mintQuantity),
        mintSignature as `0x${string}`,
        BigInt(wlMaxAllowance),
      ] as const,
      value: totalCost,
    }

    // Estimate gas — if this throws, the tx WILL revert. Decode why and bail early.
    let gas: bigint | undefined
    try {
      const estimated = await publicClient.estimateContractGas({
        ...mintArgs,
        account: connectedWallet,
      })
      const buffered = (estimated * BigInt(120)) / BigInt(100)
      const chainGasCap = BigInt(16_000_000)
      gas = buffered > chainGasCap ? chainGasCap : buffered
      console.log("[mint] gas estimate:", estimated.toString(), "→ using:", gas.toString())
    } catch (estimateErr: any) {
      const decoded = decodeContractError(estimateErr, TAO_NFT_ABI)
      console.error("[mint] estimateContractGas failed:", estimateErr)
      console.error("[mint] decoded revert:", decoded)
      setMintError(decoded ?? estimateErr?.shortMessage ?? estimateErr?.message ?? "Simulation failed — check phase status and try again.")
      return // ← do NOT submit a transaction that will fail on-chain
    }

    try {
      console.log("[mint] submitting tx", {
        phaseIndex: selectedPhaseIndex,
        quantity: mintQuantity,
        maxAllowance: wlMaxAllowance,
        value: totalCost.toString(),
        gas: gas.toString(),
      })
      await writeContractAsync({ ...mintArgs, gas })
    } catch (err: any) {
      const decoded = decodeContractError(err, TAO_NFT_ABI)
      console.error("[mint] writeContractAsync failed:", err)
      setMintError(decoded ?? err?.shortMessage ?? err?.message ?? "Mint failed")
    }
  }

  // ── Allowlist checker (on-chain API) ────────────────────────────────────────
  const handleCheckAllowlist = async () => {
    if (!alWallet.trim()) return
    setAlChecking(true)
    setAlResult(null)
    try {
      // Use the first active phase for checking, or phase 0 as fallback
      const phaseToCheck = selectedPhaseIndex ?? 0
      const result = await fetchSignature(slug, phaseToCheck, alWallet.trim())
      setAlResult({ 
        wallet: alWallet.trim(), 
        allowed: result.allowed,
        maxAllowance: result.maxAllowance
      })
    } catch {
      setAlResult({ wallet: alWallet.trim(), allowed: false })
    } finally {
      setAlChecking(false)
    }
  }

  // ── Derived display values ─────────────────────────────────────────────────

  const displayMinted = hasContract && onChainTotalMinted !== undefined
    ? onChainTotalMinted
    : (project?.minted ?? 0)

  const displaySupply = onChainStatus?.deployed && onChainStatus.onChain?.maxSupply !== undefined
    ? onChainStatus.onChain.maxSupply
    : (project?.supply ?? 10_000)

  const progress = displaySupply > 0 ? (displayMinted / displaySupply) * 100 : 0


  const displayCurrency = project?.currency ?? "TAO"

  const isMinting = isWritePending || txConfirming
  const canMint = hasContract
    ? (isConnected
        && onCorrectChain
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--electric-blue)" }} />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {error === "not_found" ? "Project Not Found" : "Error Loading Project"}
          </h1>
          <p className="text-foreground/60 mb-8">{error === "not_found" ? "This project doesn't exist." : error}</p>
          <Link href="/"><Button style={{ backgroundColor: "var(--electric-blue)" }}>Back to Launchpad</Button></Link>
        </div>
      </div>
    )
  }

  const visibleNFTs = showAllNFTs ? recentlyMinted : recentlyMinted.slice(0, 6)

  const statusMap: Record<string, { color: string; text: string }> = {
    live:     { color: "bg-green-500/20 text-green-400 border-green-500/30", text: "Live Now" },
    upcoming: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30",   text: "Upcoming" },
    ended:    { color: "bg-gray-500/20 text-gray-400 border-gray-500/30",   text: "Ended" },
  }

  const { color: statusColor, text: statusText } = statusMap[derivedStatus] ?? statusMap.ended

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
                : "border-border bg-card/30"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                  isActive ? "bg-green-500/20" : isDone ? "bg-purple-500/20" : "bg-foreground/10"
                }`}>
                  {isActive ? <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                   : isDone  ? <Check className="w-4 h-4 text-purple-400" />
                   : <Clock className="w-4 h-4 text-foreground/40" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-semibold text-foreground text-sm">{phase.name}</p>
                    {phase.signer !== zeroAddress
                      ? <Lock className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                      : <Unlock className="w-3 h-3 text-foreground/30 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-foreground/50 truncate">
                    {phase.price === 0n ? "Free" : `${fmt(phase.price)} ${displayCurrency}`} · {(phase.minted ?? 0).toLocaleString()}/{phase.maxSupply === 0 ? "\u221E" : (phase.maxSupply ?? 0).toLocaleString()}
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
                  <span className="text-[10px] text-foreground/40 font-mono tabular-nums">ends {formatCountdown(secsLeft)}</span>
                )}
                {secsUntil !== null && (
                  <span className="text-[10px] text-foreground/40 font-mono tabular-nums">in {formatCountdown(secsUntil)}</span>
                )}
              </div>
            </div>
          </div>
        )
      })
    }

    // Fall back to DB phases (no on-chain data)
    if (!project.phases || !Array.isArray(project.phases)) {
      return null
    }
    return project.phases.map((phase, idx) => {
      const isActive    = phase.status === "active"
      const isCompleted = phase.status === "completed"
      return (
        <div
          key={idx}
          className={`rounded-lg border p-3 ${
            isActive    ? "border-green-500/30 bg-green-500/5"
            : isCompleted ? "border-purple-500/20 bg-purple-500/5"
            : "border-border bg-card/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isActive ? "bg-green-500/20" : isCompleted ? "bg-purple-500/20" : "bg-foreground/10"
              }`}>
                {isActive    ? <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                : isCompleted ? <Check className="w-4 h-4 text-purple-400" />
                : <Clock className="w-4 h-4 text-foreground/40" />}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{phase.name}</p>
                <p className="text-xs text-foreground/50">
                  {phase.price} {project.currency} · {(phase.minted ?? 0).toLocaleString()}/{phase.supply || "∞"}
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
          <p className="text-foreground/50 text-xs">Please connect to <strong>TAO Mainnet</strong> (chain 964) to mint.</p>
        </div>
      )
    }

    if (isConnected && !onCorrectChain) {
      return (
        <div className="space-y-2 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <p className="text-orange-400 text-sm font-medium">Wrong Network</p>
          <p className="text-foreground/50 text-xs">Please switch to <strong>TAO Mainnet</strong> (chain 964) to mint.</p>
        </div>
      )
    }

    if (derivedStatus !== "live") {
      return (
        <Button
          className={`w-full bg-gradient-to-r ${theme.mintButton} text-white py-3 font-semibold opacity-60`}
          disabled size="lg"
        >
          {derivedStatus === "upcoming"
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
          <p className="text-foreground/50 text-sm">No active mint phase right now</p>
          {secsUntil !== null && (
            <p className="text-foreground font-mono text-lg font-bold">{formatCountdown(secsUntil)}</p>
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
                        ? `bg-foreground/15 border-foreground/30 text-foreground`
                        : "bg-foreground/5 border-border text-foreground/50 hover:bg-foreground/10"
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
            <p className="text-foreground/40 text-xs mt-1">This phase requires allowlist access.</p>
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
                        ? "bg-foreground/15 border-foreground/30 text-foreground"
                        : "bg-foreground/5 border-border text-foreground/50 hover:bg-foreground/10"
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
            <p className="text-foreground/40 text-xs mt-1">
              {alreadyMintedThisPhase} / {effectiveMaxPerWallet === 0 ? "∞" : effectiveMaxPerWallet} minted in this phase
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
        <div className="flex items-center justify-between text-xs text-foreground/50">
          <div className="flex items-center gap-2">
            {isAllowlistPhase
              ? <><Lock className="w-3 h-3 text-yellow-400" /><span className="text-yellow-400">Allowlist</span></>
              : <><Unlock className="w-3 h-3 text-foreground/30" /><span>Public</span></>}
            {isAllowlistPhase && walletOnAllowlist && (
              <span className="flex items-center gap-1 text-green-400">
                <CheckCircle2 className="w-3 h-3" />verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-foreground/40">
              {alreadyMintedThisPhase}/{effectiveMaxPerWallet === 0 ? "∞" : effectiveMaxPerWallet} used
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
            <span className="text-foreground font-bold text-lg w-8 text-center tabular-nums">{mintQuantity}</span>
            <Button variant="outline" size="sm"
              onClick={() => setMintQuantity(Math.min(remainingForWallet, mintQuantity + 1))}
              disabled={mintQuantity >= remainingForWallet}
              className="h-9 w-9 p-0 text-lg">+</Button>
          </div>
          <div className="flex-1 p-2.5 rounded-lg bg-foreground/5 border border-border text-center">
            <p className="text-[10px] text-foreground/40">Total</p>
            <p className={`text-sm font-bold ${hasEnoughBalance ? "text-foreground" : "text-red-400"}`}>
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

        {txHash && !txConfirmed && (
          <p className="text-[10px] text-foreground/40 text-center truncate">
            TX: {txHash.slice(0, 10)}…{txHash.slice(-8)}
          </p>
        )}
      </div>
    )
  }

  // ── Full render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground pt-16 lg:pt-0">

      {/* ── BANNER ── */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "3/1", maxHeight: "450px" }}>
        <Image
          src={project.logoWide}
          alt={project.name}
          fill
          className="object-cover object-bottom"
          sizes={IMAGE_SIZES.banner}
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 pb-8">
            <Badge className={`${statusColor} text-[10px] px-2.5 py-0.5 font-semibold uppercase tracking-[0.15em] mb-3 inline-flex items-center`}>
              {project.status === "live" && <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse inline-block" />}
              {statusText}
            </Badge>
            <h1
              className="text-white leading-none"
              style={{ fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif", fontWeight: 800, fontSize: "clamp(2.8rem, 7vw, 5.5rem)" }}
            >
              {project.name}
            </h1>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pb-20">

        {/* Sub-header: tagline + socials */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-5 border-b border-border">
          <div>
            {project.tagline && <p className="text-foreground/60 text-base leading-snug">{project.tagline}</p>}
            {project.artist && <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-foreground/35 mt-1">by {project.artist}</p>}
          </div>
          {(project.twitter || project.discord || project.website) && (
            <div className="flex flex-wrap gap-2">
              {project.twitter && (
                <a href={project.twitter} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/50 hover:text-foreground border border-border hover:border-foreground/30 px-3 py-1.5 rounded-lg transition-all">
                  <MessageCircle className="w-3.5 h-3.5" />Twitter
                </a>
              )}
              {project.discord && (
                <a href={project.discord} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/50 hover:text-foreground border border-border hover:border-foreground/30 px-3 py-1.5 rounded-lg transition-all">
                  <Users className="w-3.5 h-3.5" />Discord
                </a>
              )}
              {project.website && (
                <a href={project.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/50 hover:text-foreground border border-border hover:border-foreground/30 px-3 py-1.5 rounded-lg transition-all">
                  <Globe className="w-3.5 h-3.5" />Website
                </a>
              )}
            </div>
          )}
        </div>

        {/* ── TWO-COLUMN ── */}
        <div className="grid lg:grid-cols-[1fr_360px] gap-12 pt-10 items-start">

          {/* LEFT: content */}
          <div className="space-y-12">

            {/* About */}
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-foreground/35 mb-4">About</p>
              <p className="text-foreground/70 leading-relaxed text-base">{project.description || project.tagline || "No description available"}</p>
            </div>

            {/* NFT Gallery */}
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-foreground/35 mb-4">Recently Minted</p>
              {loadingNFTs ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 text-foreground/40 animate-spin" />
                </div>
              ) : recentlyMinted.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {visibleNFTs.map((nft) => (
                      <div
                        key={nft._id}
                        className="rounded-xl border border-border bg-card/40 overflow-hidden cursor-pointer hover:border-foreground/20 transition-all group"
                        onClick={() => handleNFTClick(nft.tokenId)}
                        title={`View ${nft.name} on block explorer`}
                      >
                        <div className="relative aspect-square">
                          <Image
                            src={nft.image} alt={nft.name} fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes={IMAGE_SIZES.nftCard}
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).src = `/collections/${slug}/pfp.jpg` }}
                            unoptimized={nft.image?.startsWith('data:') || nft.image?.startsWith('ipfs://')}
                          />
                          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <ExternalLink className="w-5 h-5 text-foreground" />
                          </div>
                        </div>
                        <div className="p-3 border-t border-border">
                          <p className="text-sm font-medium text-foreground truncate mb-2">{nft.name}</p>
                          <div className="flex items-center justify-between">
                            <Badge className={`${getRarityColor(nft.rarity)} text-[10px] px-2 py-0.5`}>{nft.rarity}</Badge>
                            <span className="text-[10px] text-foreground/40 font-mono">{nft.mintedBy.slice(0, 6)}…{nft.mintedBy.slice(-4)}</span>
                          </div>
                          {nftRarityData.has(nft.tokenId) && (
                            <div className="flex items-center justify-between text-[10px] mt-2">
                              <span className="text-foreground/40">Rank <span className="text-foreground font-mono">#{nftRarityData.get(nft.tokenId)!.nft.rarity_rank}</span></span>
                              <span className="font-mono" style={{ color: "var(--electric-blue)" }}>{nftRarityData.get(nft.tokenId)!.nft.rarity_score.toFixed(3)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {recentlyMinted.length > 6 && (
                    <button
                      onClick={() => setShowAllNFTs(!showAllNFTs)}
                      className="mt-4 w-full text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground/50 hover:text-foreground border border-border hover:border-foreground/30 py-2.5 rounded-xl transition-all"
                    >
                      {showAllNFTs ? "Show Less" : `Show All ${recentlyMinted.length} NFTs`}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-12 border border-dashed border-border rounded-xl text-foreground/40">
                  <p className="text-sm">No NFTs minted yet — be first.</p>
                </div>
              )}
            </div>

            {/* Highlights */}
            {project.highlights && project.highlights.length > 0 && (
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-foreground/35 mb-4">Highlights</p>
                <div className="divide-y divide-border">
                  {project.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 py-3">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: "var(--electric-blue)" }} />
                      <span className="text-sm text-foreground/70 leading-relaxed">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Utilities */}
            {project.utilities && project.utilities.length > 0 && (
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-foreground/35 mb-4">Utility</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {project.utilities.map((u, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/40">
                      <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--electric-blue)" }} />
                      <span className="text-sm text-foreground/70 leading-relaxed">{u}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allowlist checker — hidden for fully-public collections */}
            {onChainPhases && onChainPhases.some(p => p.signer !== zeroAddress) && <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-foreground/35 mb-4">Allowlist Checker</p>
              <div className="max-w-md space-y-3">
                <input
                  type="text" value={alWallet}
                  onChange={(e) => { setAlWallet(e.target.value); setAlResult(null) }}
                  placeholder="0x… wallet address"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder-foreground/30 focus:outline-none focus:border-foreground/40 transition-all text-sm font-mono"
                />
                <Button
                  className="w-full font-semibold text-[11px] uppercase tracking-[0.15em]"
                  style={{ backgroundColor: "var(--electric-blue)", color: "#fff" }}
                  onClick={handleCheckAllowlist}
                  disabled={alChecking || !alWallet.trim()}
                >
                  {alChecking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Check Wallet
                </Button>
                {alResult && (
                  <div className={`flex items-center gap-2 text-sm p-3 rounded-xl border ${alResult.allowed ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-red-400 bg-red-500/10 border-red-500/20"}`}>
                    {alResult.allowed ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
                    {alResult.allowed ? "On the allowlist" : "Not on the allowlist"}
                  </div>
                )}
              </div>
            </div>}
          </div>

          {/* RIGHT: sticky mint panel */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">

            {/* Main mint card */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-5">

              {/* Identity */}
              <div className="flex items-center gap-3 pb-5 border-b border-border">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-border flex-shrink-0">
                  <Image src={project.logoSquare || "/placeholder-logo.png"} alt={project.name || slug} width={48} height={48} className="object-cover w-full h-full" sizes={IMAGE_SIZES.mintThumb} unoptimized />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{project.name || slug}</p>
                  {project.artist && <p className="text-[11px] text-foreground/40 font-mono truncate">by {project.artist}</p>}
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-[11px] text-foreground/40 mb-2 font-mono">
                  <span>{(displayMinted ?? 0).toLocaleString()} / {(displaySupply ?? 0).toLocaleString()} minted</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, progress)}%`, background: "var(--electric-blue)" }} />
                </div>
              </div>

              {/* Phases */}
              {((hasContract && onChainPhases && (onChainPhases as OnChainPhase[]).length > 0) || (project.phases && project.phases.length > 0)) && (
                <div className="space-y-2">{renderPhases()}</div>
              )}

              {/* Mint actions */}
              {renderMintPanel()}

              {mintSuccess && (
                <div className="flex items-center gap-2 text-green-400 text-sm p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Minted {mintSuccess.quantity} NFT{mintSuccess.quantity > 1 ? "s" : ""}! <span className="font-mono text-[10px] opacity-60">{mintSuccess.txHash.slice(0, 10)}…</span></span>
                </div>
              )}
              {mintError && (
                <div className="flex items-start gap-2 text-red-400 text-sm p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{mintError}</span>
                </div>
              )}

              <p className="text-[10px] text-foreground/30 text-center font-mono">{(project.participants ?? 0).toLocaleString()} holders</p>
            </div>

            {/* Contract card */}
            {hasContract && contractAddress && (() => {
              const explorerBase =
                onChainStatus?.chainId === 11155111 ? "https://sepolia.etherscan.io" :
                onChainStatus?.chainId === 964       ? "https://evm.taostats.io"     :
                onChainStatus?.chainId === 945       ? "https://test.taostats.io"    : null
              const contractUrl = explorerBase ? `${explorerBase}/address/${contractAddress}` : null
              const transfersLocked = onChainTransfersLocked as boolean | undefined
              const royaltyBps = onChainStatus?.onChain?.royaltyBps
              const royaltyPct = royaltyBps !== undefined && royaltyBps !== null && !isNaN(royaltyBps) ? (royaltyBps / 100).toFixed(1) + "%" : "..."
              const owner = onChainStatus?.onChain?.owner

              return (
                <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-foreground/35">Contract</p>
                    {contractUrl && (
                      <a href={contractUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] hover:opacity-70 transition-opacity"
                        style={{ color: "var(--electric-blue)" }}>
                        Explorer <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border">
                      <span className="text-[10px] text-foreground/40 uppercase tracking-[0.12em]">Address</span>
                      {contractUrl ? (
                        <a href={contractUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-foreground hover:opacity-70 flex items-center gap-1">
                          {contractAddress.slice(0, 8)}…{contractAddress.slice(-6)}<ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="font-mono text-xs text-foreground">{contractAddress.slice(0, 8)}…{contractAddress.slice(-6)}</span>
                      )}
                    </div>
                    {owner && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border">
                        <span className="text-[10px] text-foreground/40 uppercase tracking-[0.12em]">Creator</span>
                        {explorerBase ? (
                          <a href={`${explorerBase}/address/${owner}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-foreground hover:opacity-70 flex items-center gap-1">
                            {owner.slice(0, 8)}…{owner.slice(-6)}<ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="font-mono text-xs text-foreground">{owner.slice(0, 8)}…{owner.slice(-6)}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Royalty",   value: royaltyPct, cls: undefined },
                      { label: "Phases",    value: String((onChainPhases as OnChainPhase[] | undefined)?.length ?? 0), cls: undefined },
                      { label: "Transfers", value: transfersLocked === undefined ? "—" : transfersLocked ? "Locked" : "Open",
                        cls: transfersLocked ? "text-yellow-400" : "text-green-400" },
                      { label: "Standard",  value: "ERC-721A", cls: undefined },
                    ].map(({ label, value, cls }) => (
                      <div key={label} className="p-3 rounded-xl bg-background border border-border">
                        <p className="text-[10px] text-foreground/40 uppercase tracking-[0.1em] mb-1">{label}</p>
                        <p className={`text-xs font-bold ${cls ?? "text-foreground"}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                  {explorerBase && (
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Code", tab: "contract", Icon: BarChart3 },
                        { label: "Logs", tab: "logs",     Icon: TrendingUp },
                        { label: "Txs",  tab: "txs",      Icon: Zap },
                      ].map(({ label, tab, Icon }) => (
                        <a key={tab} href={`${explorerBase}/address/${contractAddress}?tab=${tab}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[11px] text-foreground/50 hover:text-foreground border border-border hover:border-foreground/30 px-3 py-1.5 rounded-lg transition-all">
                          <Icon className="w-3 h-3" />{label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}

