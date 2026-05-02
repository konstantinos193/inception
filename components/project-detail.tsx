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
import MintGraphic from "@/components/mint-graphic"
import ContractInfo from "./contract-info"
import { TaoIcon } from "@/components/tao-icon"
import { MintSuccessModal } from "@/components/mint-success-modal"
import { getCollectionTheme, CollectionTheme } from "@/lib/collection-theme"
import {
  fetchProject,
  fetchSignature,
  fetchOnChainStatus,
  checkAllowlist,
  fetchRecentlyMinted,
  fetchNFTRarity,
  fetchRarityStats,
  nftImageUrl,
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
  if (d > 0) return `${d}d ${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`
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
  const [mintSuccess, setMintSuccess] = useState<{ txHash: string; quantity: number; tokenIds?: number[] } | null>(null)
  const [mintError, setMintError] = useState<string | null>(null)
  const [showMintSuccessModal, setShowMintSuccessModal] = useState(false)

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

  // Update favicon dynamically based on project
  useEffect(() => {
    if (project?.logoSquare) {
      const faviconUrl = project.logoSquare
      
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll("link[rel*='icon']")
      existingLinks.forEach(link => link.remove())
      
      // Add new favicon links with multiple rel values for better browser support
      const rels = ['icon', 'shortcut icon', 'apple-touch-icon']
      rels.forEach(rel => {
        const link = document.createElement('link')
        link.rel = rel
        link.href = faviconUrl
        document.head.appendChild(link)
      })
    }
  }, [project])

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
    return onChainStatus.onChain.phases.filter(p => !p.paused).map(p => ({
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

  // Whether multiple phases are active (used for MintGraphic)
  const multiPhase = activePhaseIndices.length > 1

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

  // Load recently minted NFTs (fast — no rarity blocking)
  const loadRecentlyMinted = useCallback(async (showSpinner: boolean) => {
    try {
      if (showSpinner) setLoadingNFTs(true)
      const nfts = await fetchRecentlyMinted(slug)
      setRecentlyMinted(nfts)
    } catch (error) {
      console.error("Failed to load recently minted NFTs:", error)
      if (showSpinner) setRecentlyMinted([])
    } finally {
      if (showSpinner) setLoadingNFTs(false)
    }
  }, [slug])

  useEffect(() => {
    if (!slug) return
    loadRecentlyMinted(true)
    const interval = setInterval(() => loadRecentlyMinted(false), 30000)
    return () => clearInterval(interval)
  }, [slug, loadRecentlyMinted])

  // Load rarity data in background (non-blocking, after NFTs are visible)
  useEffect(() => {
    if (!slug || recentlyMinted.length === 0) return
    let cancelled = false

    const loadRarity = async () => {
      try {
        const stats = await fetchRarityStats(slug)
        if (cancelled || stats.statistics.total === 0) return

        const rarityMap = new Map<number, NFTRarity>()
        const results = await Promise.allSettled(
          recentlyMinted.map(nft => fetchNFTRarity(slug, nft.tokenId))
        )
        results.forEach((r, i) => {
          if (r.status === "fulfilled") rarityMap.set(recentlyMinted[i].tokenId, r.value)
        })
        if (!cancelled) setNftRarityData(rarityMap)
      } catch (_) { /* rarity not available */ }
    }

    loadRarity()
    return () => { cancelled = true }
  }, [slug, recentlyMinted])

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
  const { data: receipt, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const [txConfirmed, setTxConfirmed] = useState<boolean>(false)
  const [txConfirming, setTxConfirming] = useState<boolean>(false)

  useEffect(() => {
    if (isTxSuccess && receipt && txHash && activeOnChainPhase && selectedPhaseIndex !== null && !txConfirmed) {
      setTxConfirmed(true)
      setTxConfirming(false)

      // Extract token IDs from transaction receipt logs
      // The Transfer event topics[3] contains the tokenId for ERC721
      let tokenIds: number[] = []
      if (receipt.logs && receipt.logs.length > 0) {
        const firstTokenId = Number(receipt.logs[0]?.topics[3] || 1)
        tokenIds = Array.from({ length: mintQuantity }, (_, i) => firstTokenId + i)
      }

      // Show success popup immediately since transaction is confirmed on-chain
      setMintSuccess({ txHash, quantity: mintQuantity, tokenIds })
      setMintError(null)
      setShowMintSuccessModal(true)

      // Try to submit to backend, but don't block success popup on failure
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
        loadOnChainStatus()
        loadRecentlyMinted(false)

        if (connectedWallet) {
          fetchWalletPhaseMints(slug, selectedPhaseIndex, connectedWallet).then(setWalletPhaseMinted)
        }
      }).catch((err) => {
        console.error("[mint] Backend confirmation failed:", err)
        // Still refresh data even if backend confirmation fails
        loadOnChainStatus()
        loadRecentlyMinted(false)

        if (connectedWallet) {
          fetchWalletPhaseMints(slug, selectedPhaseIndex, connectedWallet).then(setWalletPhaseMinted)
        }
      })
    }
  }, [isTxSuccess, receipt, txHash, activeOnChainPhase, selectedPhaseIndex, slug, connectedWallet, mintQuantity, txConfirmed, loadOnChainStatus, loadRecentlyMinted])

  useEffect(() => {
    if (writeError) {
      const decoded = decodeContractError(writeError, TAO_NFT_ABI)
      console.error("[mint] writeError:", writeError)
      const msg = decoded
        ?? (writeError as { shortMessage?: string })?.shortMessage
        ?? writeError.message
        ?? "Transaction failed"
      setMintError(msg)
      resetWrite()
      setTxConfirming(false)
    }
  }, [writeError, resetWrite])

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
      setTxConfirming(true)
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
      setTxConfirming(false)
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

  // Use on-chain data if available and non-zero, otherwise fall back to database
  const displayMinted = (hasContract && onChainTotalMinted !== undefined && onChainTotalMinted > 0)
    ? onChainTotalMinted
    : (project?.minted ?? 0)

  const displaySupply = (onChainStatus?.deployed && onChainStatus.onChain?.maxSupply !== undefined && onChainStatus.onChain.maxSupply > 0)
    ? onChainStatus.onChain.maxSupply
    : (project?.supply ?? 10_000)

  const progress = displaySupply > 0 ? (displayMinted / displaySupply) * 100 : 0


  const displayCurrency = project?.currency ?? "TAO"

  // Find the maximum price across all phases for display
  const maxPhasePrice = useMemo(() => {
    if (!onChainPhases || onChainPhases.length === 0) return 0n
    return onChainPhases.reduce((max, phase) => phase.price > max ? phase.price : max, 0n)
  }, [onChainPhases])

  // Calculate total cost for MintGraphic (used outside renderMintPanel)
  const totalCostWei = activeOnChainPhase ? activeOnChainPhase.price * BigInt(mintQuantity) : 0n
  const hasEnoughBalance = walletBalance ? walletBalance.value >= totalCostWei : true

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

  // Calculate disabled reason for mint button
  const disabledReason = useMemo(() => {
    if (canMint && hasEnoughBalance) return undefined
    if (!hasContract) return "Contract not deployed"
    if (!isConnected) return "Connect wallet to mint"
    if (!onCorrectChain) return "Switch to correct network"
    if (selectedPhaseIndex === null) return "No active mint phase"
    if (activeOnChainPhase?.paused) return "Minting is paused"
    if (isAllowlistPhase && !walletOnAllowlist) return "Not on allowlist"
    if (remainingForWallet <= 0) return "No minting slots remaining"
    if (mintQuantity < 1) return "Invalid quantity"
    if (!hasEnoughBalance) return "Insufficient balance"
    if (isMinting) return "Transaction in progress"
    return undefined
  }, [canMint, hasEnoughBalance, hasContract, isConnected, onCorrectChain, selectedPhaseIndex, activeOnChainPhase?.paused, isAllowlistPhase, walletOnAllowlist, remainingForWallet, mintQuantity, isMinting])

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
    // No phases configured state
    if (!hasContract && (!project.phases || !Array.isArray(project.phases) || project.phases.length === 0)) {
      return (
        <div className="rounded-xl border border-dashed border-border/50 bg-card/20 p-8 text-center">
          <Clock className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
          <p className="text-foreground/60 text-sm font-medium mb-1">No Phases Configured</p>
          <p className="text-foreground/40 text-xs">Minting phases haven't been set up yet. Check back soon!</p>
        </div>
      )
    }

    if (hasContract && onChainPhases && (onChainPhases as OnChainPhase[]).length > 0) {
      return (onChainPhases as OnChainPhase[]).filter((phase) => !phase.paused).map((phase, idx) => {
        const status    = phaseStatusFromTimestamps(phase.startTime, phase.endTime, nowSecs)
        const isActive  = status === "active"
        const isDone    = status === "completed"
        const isUpcoming = status === "upcoming"
        const isSelected = isActive && selectedPhaseIndex === idx
        const secsLeft  = isActive && phase.endTime > 0n
          ? Math.max(0, Number(phase.endTime) - nowSecs)
          : null
        const secsUntil = isUpcoming
          ? Math.max(0, Number(phase.startTime) - nowSecs)
          : null
        const minted = phase.minted ?? 0
        const maxSupply = phase.maxSupply ?? 0
        const progress = maxSupply > 0 ? (minted / maxSupply) * 100 : 0
        const isSoldOut = maxSupply > 0 && minted >= maxSupply

        return (
          <div
            key={idx}
            onClick={() => isActive && !isSoldOut && setSelectedPhaseIndex(idx)}
            className={`rounded-xl border p-4 transition-all cursor-pointer ${
              isSelected
                ? `border-green-500/50 bg-green-500/10 ring-1 ring-green-500/30`
                : isActive
                ? "border-green-500/20 bg-green-500/5 hover:border-green-500/40 hover:bg-green-500/8"
                : isDone
                ? "border-purple-500/20 bg-purple-500/5"
                : isUpcoming
                ? "border-blue-500/20 bg-blue-500/5"
                : "border-border bg-card/30"
            } ${isSoldOut ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                  isActive ? "bg-green-500/20" : isDone ? "bg-purple-500/20" : isUpcoming ? "bg-blue-500/20" : "bg-foreground/10"
                }`}>
                  {isSoldOut ? <XCircle className="w-5 h-5 text-red-400" />
                   : isActive ? <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                   : isDone  ? <Check className="w-5 h-5 text-purple-400" />
                   : isUpcoming ? <Clock className="w-5 h-5 text-blue-400" />
                   : <Clock className="w-5 h-5 text-foreground/40" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground text-base">{phase.name}</p>
                    {isSoldOut && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] font-semibold">SOLD OUT</Badge>}
                    {phase.signer !== zeroAddress && !isSoldOut
                      ? <Lock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      : !isSoldOut && <Unlock className="w-4 h-4 text-foreground/30 flex-shrink-0" />}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 flex flex-col items-end gap-1">
                {isActive && !isSoldOut && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] font-semibold">LIVE</Badge>
                )}
                {isDone && (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px] font-semibold">DONE</Badge>
                )}
                {isUpcoming && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] font-semibold">UPCOMING</Badge>
                )}
              </div>
            </div>

            {/* Price and Supply */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`font-mono font-bold ${phase.price === 0n ? "text-green-400" : "text-foreground"} flex items-center gap-1`}>
                  {phase.price === 0n ? "Free" : <>{fmt(phase.price)} <span className="flex items-center justify-center w-3 h-3 rounded-full bg-white"><img alt="T" className="w-2 h-2" src="/bittensor-logo.svg" /></span></>}
                </span>
              </div>
              <span className="text-xs text-foreground/50 font-mono flex items-center">
                {minted.toLocaleString()} / {maxSupply === 0 ? "∞" : maxSupply.toLocaleString()}
              </span>
            </div>

            {/* Progress Bar */}
            {maxSupply > 0 && (
              <div className="mb-3">
                <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, progress)}%`,
                      background: isSoldOut ? "#ef4444" : isActive ? "var(--electric-blue)" : isDone ? "#a855f7" : isUpcoming ? "#3b82f6" : "var(--foreground/30)"
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-foreground/40 mt-1 font-mono">
                  <span>{progress.toFixed(1)}%</span>
                  {isSoldOut && <span className="text-red-400">Sold Out</span>}
                </div>
              </div>
            )}

            {/* Timer */}
            {(secsLeft !== null || secsUntil !== null) && (
              <div className="text-center">
                <span className={`text-xs font-mono ${secsLeft !== null ? "text-orange-400" : "text-blue-400"}`}>
                  {secsLeft !== null ? `⏱ Ends in ${formatCountdown(secsLeft)}` : `🕐 Starts in ${formatCountdown(secsUntil)}`}
                </span>
              </div>
            )}
          </div>
        )
      })
    }

    // Fall back to DB phases (no on-chain data)
    if (!project.phases || !Array.isArray(project.phases)) {
      return (
        <div className="rounded-xl border border-dashed border-border/50 bg-card/20 p-8 text-center">
          <Clock className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
          <p className="text-foreground/60 text-sm font-medium mb-1">No Phases Configured</p>
          <p className="text-foreground/40 text-xs">Minting phases haven't been set up yet. Check back soon!</p>
        </div>
      )
    }
    
    if (project.phases.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-border/50 bg-card/20 p-8 text-center">
          <Clock className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
          <p className="text-foreground/60 text-sm font-medium mb-1">No Phases Configured</p>
          <p className="text-foreground/40 text-xs">Minting phases haven't been set up yet. Check back soon!</p>
        </div>
      )
    }
    
    return project.phases.map((phase, idx) => {
      const isActive    = phase.status === "active"
      const isCompleted = phase.status === "completed"
      const minted = phase.minted || 0
      const maxSupply = phase.maxSupply || 0
      const progress = maxSupply > 0 ? (minted / maxSupply) * 100 : 0

      return (
        <div
          key={idx}
          onClick={() => isActive && setSelectedPhaseIndex(idx)}
          className={`rounded-xl border p-4 transition-all cursor-pointer ${
            isActive    ? "border-green-500/30 bg-green-500/5 hover:border-green-500/40 hover:bg-green-500/8"
            : isCompleted ? "border-purple-500/20 bg-purple-500/5"
            : "border-border bg-card/30"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                isActive ? "bg-green-500/20" : isCompleted ? "bg-purple-500/20" : "bg-foreground/10"
              }`}>
                {isActive ? <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                 : isCompleted ? <Check className="w-5 h-5 text-purple-400" />
                 : <Clock className="w-5 h-5 text-foreground/40" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground text-base">{phase.name}</p>
                  {phase.requireAllowlist && <Lock className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-1">
              {isActive && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] font-semibold">LIVE</Badge>
              )}
              {isCompleted && (
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px] font-semibold">DONE</Badge>
              )}
            </div>
          </div>

          {/* Price and Supply */}
          <div className="flex items-center justify-between mb-3">
            <span className={`font-mono font-bold ${phase.price === 0 ? "text-green-400" : "text-foreground"} flex items-center gap-1`}>
              {phase.price === 0 ? "Free" : <>{phase.price} <span className="flex items-center justify-center w-3 h-3 rounded-full bg-white"><img alt="T" className="w-2 h-2" src="/bittensor-logo.svg" /></span></>}
            </span>
            <span className="text-xs text-foreground/50 font-mono flex items-center">
              {minted.toLocaleString()} / {maxSupply === 0 ? "∞" : maxSupply.toLocaleString()}
            </span>
          </div>

          {/* Progress Bar */}
          {maxSupply > 0 && (
            <div className="mb-3">
              <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, progress)}%`,
                    background: isActive ? "var(--electric-blue)" : isCompleted ? "#a855f7" : "var(--foreground/30)"
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-foreground/40 mt-1 font-mono">
                <span>{progress.toFixed(1)}%</span>
              </div>
            </div>
          )}
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
      const completedPhases = onChainPhases
        ? (onChainPhases as OnChainPhase[]).filter(p => phaseStatusFromTimestamps(p.startTime, p.endTime, nowSecs) === "completed")
        : []
      const secsUntil = upcomingPhase ? Math.max(0, Number(upcomingPhase.startTime) - nowSecs) : null
      
      // All phases completed state
      if (completedPhases.length === (onChainPhases?.length ?? 0) && (onChainPhases?.length ?? 0) > 0) {
        return (
          <div className="p-6 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
            <CheckCircle2 className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <p className="text-purple-400 font-medium text-lg mb-1">All Phases Completed</p>
            <p className="text-foreground/50 text-sm">Minting has ended for this collection</p>
          </div>
        )
      }

      // No phases at all state
      if (!onChainPhases || onChainPhases.length === 0) {
        return (
          <div className="p-6 rounded-xl bg-gray-500/10 border border-gray-500/20 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400 font-medium text-lg mb-1">No Phases Available</p>
            <p className="text-foreground/50 text-sm">Minting phases haven't been configured yet</p>
          </div>
        )
      }

      // Upcoming countdown state
      return (
        <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
          <Clock className="w-12 h-12 text-blue-400 mx-auto mb-3" />
          <p className="text-blue-400 font-medium text-lg mb-1">Next Phase Starting Soon</p>
          {secsUntil !== null && (
            <>
              <p className="text-foreground font-mono text-2xl font-bold mb-1">{formatCountdown(secsUntil)}</p>
              <p className="text-foreground/50 text-sm">{upcomingPhase?.name}</p>
            </>
          )}
        </div>
      )
    }

    // ── Per-phase guard states ─────────────────────────────────────────────
    if (isAllowlistPhase && !walletOnAllowlist) {
      return (
        <div className="space-y-3">
          {multiPhase && (
            <div className="flex gap-2 flex-wrap lg:hidden">
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

    // Check if phase is sold out
    const isPhaseSoldOut = activeOnChainPhase && activeOnChainPhase.maxSupply > 0 && activeOnChainPhase.minted >= activeOnChainPhase.maxSupply

    if (isPhaseSoldOut) {
      return (
        <div className="space-y-3">
          {multiPhase && (
            <div className="flex gap-2 flex-wrap lg:hidden">
              {activePhaseIndices.map(i => {
                const ph = (onChainPhases as OnChainPhase[])[i]
                const phSoldOut = ph.maxSupply > 0 && ph.minted >= ph.maxSupply
                return (
                  <button key={i} onClick={() => !phSoldOut && setSelectedPhaseIndex(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      selectedPhaseIndex === i
                        ? "bg-foreground/15 border-foreground/30 text-foreground"
                        : phSoldOut
                        ? "bg-red-500/10 border-red-500/20 text-red-400 cursor-not-allowed opacity-60"
                        : "bg-foreground/5 border-border text-foreground/50 hover:bg-foreground/10"
                    }`}>
                    {ph.name} {phSoldOut && "(Sold Out)"}
                  </button>
                )
              })}
            </div>
          )}
          <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-400 font-medium text-lg mb-1">Phase Sold Out</p>
            <p className="text-foreground/50 text-sm">
              {activeOnChainPhase.minted} / {activeOnChainPhase.maxSupply} minted
            </p>
          </div>
        </div>
      )
    }

    if (remainingForWallet === 0) {
      return (
        <div className="space-y-3">
          {multiPhase && (
            <div className="flex gap-2 flex-wrap lg:hidden">
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

    const secsLeft = activeOnChainPhase && activeOnChainPhase.endTime > 0n
      ? Math.max(0, Number(activeOnChainPhase.endTime) - nowSecs)
      : null

    return (
      <div className="space-y-4">
        {/* Phase selector tabs (only when multiple active) - mobile only */}
        {multiPhase && (
          <div className="flex gap-2 flex-wrap lg:hidden">
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
      <div className="relative w-full overflow-hidden aspect-[2/1] lg:aspect-[3/1]" style={{ maxHeight: "450px" }}>
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

        {/* Badge + Title — bottom-left, all screens */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-5 lg:pb-8 relative">
            <Badge className={`${statusColor} text-[10px] px-2.5 py-0.5 font-semibold uppercase tracking-[0.15em] mb-2 lg:mb-3 inline-flex items-center`}>
              {project.status === "live" && <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse inline-block" />}
              {statusText}
            </Badge>
            <h1
              className="text-white leading-none"
              style={{ fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 8vw, 5.5rem)" }}
            >
              {project.name}
            </h1>

            {/* Mint Progress card — right side of banner */}
            {hasContract && (
              <div className="absolute right-0 top-0 w-48 sm:w-64 lg:w-[360px] lg:right-10">
                <div className="rounded-xl lg:rounded-2xl bg-white/80 backdrop-blur-md border border-white/30 p-2.5 sm:p-3 lg:p-5 shadow-lg">
                  <p className="text-gray-800 font-semibold text-xs sm:text-sm lg:text-base mb-2 lg:mb-3">Mint Progress:</p>
                  <div className="h-1.5 lg:h-2 bg-gray-300 rounded-full overflow-hidden mb-1.5 lg:mb-2">
                    <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: "var(--electric-blue)" }} />
                  </div>
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] lg:text-xs text-gray-500 mb-1">
                    <span>{progress.toFixed(1)}% Sold</span>
                    <span className="font-mono">{displayMinted.toLocaleString()} / {displaySupply.toLocaleString()}</span>
                  </div>
                  {hasContract && onChainPhases && onChainPhases.length > 0 && (
                    <p className="text-[9px] sm:text-[10px] lg:text-xs text-gray-500">
                      Mint Price: <span className="text-gray-800 font-semibold inline-flex items-center gap-0.5">
                        {maxPhasePrice === 0n ? "Free" : fmt(maxPhasePrice)}
                        {maxPhasePrice !== 0n && (
                          <span className="flex items-center justify-center w-3 h-3 rounded-full bg-white">
                            <img alt="T" className="w-2 h-2" src="/bittensor-logo.svg" />
                          </span>
                        )}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pb-20">

        {/* ── TWO-COLUMN ── */}
        <div className="grid lg:grid-cols-[1fr_360px] gap-12 pt-10 items-start">

          {/* LEFT: content */}
          <div className="space-y-12 min-w-0">

            {/* About */}
            <div className="space-y-6">
              {/* 1:1 PFP + Social Links on desktop */}
              {project.logoSquare && (
                <div className="hidden lg:flex items-end gap-4 justify-between">
                  <div className="relative aspect-square w-64 rounded-2xl overflow-hidden border border-border/50 flex-shrink-0">
                    <Image
                      src={project.logoSquare}
                      alt={project.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  {(project.twitter || project.discord || project.website) && (
                    <div className="flex items-center gap-2 ml-auto pb-3">
                      {project.twitter && (
                        <a href={project.twitter} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center w-8 h-8 rounded-lg border hover:border-foreground/30 transition-all"
                          style={{ color: "var(--electric-blue)", borderColor: "var(--electric-blue)" }}>
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                      )}
                      {project.discord && (
                        <a href={project.discord} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center w-8 h-8 rounded-lg border hover:border-foreground/30 transition-all"
                          style={{ color: "var(--electric-blue)", borderColor: "var(--electric-blue)" }}>
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.133 18.115a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                        </a>
                      )}
                      {project.website && (
                        <a href={project.website} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center w-8 h-8 rounded-lg border hover:border-foreground/30 transition-all"
                          style={{ color: "var(--electric-blue)", borderColor: "var(--electric-blue)" }}>
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
              {/* About section (both mobile and desktop) */}
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-foreground/35 mb-2 block lg:hidden">About</p>
                <p className="text-foreground/60 text-sm mt-1 block lg:hidden">{project.tagline}</p>
                {project.description && (
                  <p className="text-foreground/60 text-base leading-snug mt-3 hidden lg:block">{project.description}</p>
                )}
              </div>
            </div>

            {/* Mobile: Mint Graphic under About */}
            <div className="lg:hidden mb-8">
              <MintGraphic
                slug={slug}
                pfpPath={project?.logoSquare}
                minted={displayMinted}
                supply={displaySupply}
                quantity={mintQuantity}
                totalCost={fmt(totalCostWei)}
                currency={displayCurrency}
                onDecrement={() => setMintQuantity(Math.max(1, mintQuantity - 1))}
                onIncrement={() => setMintQuantity(Math.min(remainingForWallet, mintQuantity + 1))}
                onMint={handleOnChainMint}
                canDecrement={mintQuantity > 1}
                canIncrement={mintQuantity < remainingForWallet}
                canMint={canMint && hasEnoughBalance}
                isMinting={isMinting}
                disabledReason={disabledReason}
                phaseName={activeOnChainPhase?.name}
                phasePrice={activeOnChainPhase ? (activeOnChainPhase.price === 0n ? "Free" : fmt(activeOnChainPhase.price)) : undefined}
                phases={multiPhase ? activePhaseIndices.map(i => ({
                  name: (onChainPhases as OnChainPhase[])[i].name,
                  index: i,
                  isActive: true,
                  isSelected: selectedPhaseIndex === i,
                  paused: (onChainPhases as OnChainPhase[])[i].paused
                })) : undefined}
                onPhaseSelect={(index) => { setSelectedPhaseIndex(index); setMintQuantity(1) }}
                mintSuccess={mintSuccess}
                mintError={mintError}
              />
            </div>

            <div className="border-b border-foreground/20 mt-4" />

            {/* Phase Selector */}
            {((hasContract && onChainPhases && (onChainPhases as OnChainPhase[]).length > 0) || (project.phases && project.phases.length > 0)) && (
              <div className="mt-8">
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-foreground/35 mb-4">Mint Phases</p>
                <div className="space-y-2">{renderPhases()}</div>
              </div>
            )}

            {/* NFT Gallery */}
            <div className="min-w-0">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-foreground/35 mb-4">Recently Minted</p>
              {loadingNFTs ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 text-foreground/40 animate-spin" />
                </div>
              ) : recentlyMinted.length > 0 ? (
                <>
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                    {visibleNFTs.map((nft) => (
                      <div
                        key={nft._id}
                        className="flex-shrink-0 w-48 rounded-xl border border-border bg-card/40 overflow-hidden cursor-pointer hover:border-foreground/20 transition-all group snap-start"
                        onClick={() => handleNFTClick(nft.tokenId)}
                        title={`View ${nft.name} on block explorer`}
                      >
                        <div className="relative aspect-square bg-card">
                          <Image
                            src={nftImageUrl(slug, nft.tokenId)}
                            alt={nft.name} fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes={IMAGE_SIZES.nftCard}
                            loading="lazy"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <ExternalLink className="w-5 h-5 text-foreground" />
                          </div>
                        </div>
                        <div className="p-3 border-t border-border">
                          <p className="text-sm font-medium text-foreground truncate mb-2">{nft.name}</p>
                          <div className="flex items-center justify-between">
                            <Badge className={`${getRarityColor(nft.rarity)} text-[10px] px-2 py-0.5`}>{nft.rarity}</Badge>
                            <span className="text-[10px] text-foreground/40 font-mono">
                              {nft.mintedBy.length > 12
                                ? `${nft.mintedBy.slice(0, 6)}…${nft.mintedBy.slice(-4)}`
                                : nft.mintedBy}
                            </span>
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
          <div className="lg:sticky lg:top-24 lg:self-start space-y-4 hidden lg:block">
            {/* Mint Graphic - desktop only */}
            <MintGraphic
              slug={slug}
              pfpPath={project?.logoSquare}
              minted={displayMinted}
              supply={displaySupply}
              quantity={mintQuantity}
              totalCost={fmt(totalCostWei)}
              currency={displayCurrency}
              onDecrement={() => setMintQuantity(Math.max(1, mintQuantity - 1))}
              onIncrement={() => setMintQuantity(Math.min(remainingForWallet, mintQuantity + 1))}
              onMint={handleOnChainMint}
              canDecrement={mintQuantity > 1}
              canIncrement={mintQuantity < remainingForWallet}
              canMint={canMint && hasEnoughBalance}
              isMinting={isMinting}
              disabledReason={disabledReason}
              phaseName={activeOnChainPhase?.name}
              phasePrice={activeOnChainPhase ? (activeOnChainPhase.price === 0n ? "Free" : fmt(activeOnChainPhase.price)) : undefined}
              phases={multiPhase ? activePhaseIndices.map(i => ({
                name: (onChainPhases as OnChainPhase[])[i].name,
                index: i,
                isActive: true,
                isSelected: selectedPhaseIndex === i,
                paused: (onChainPhases as OnChainPhase[])[i].paused
              })) : undefined}
              onPhaseSelect={(index) => { setSelectedPhaseIndex(index); setMintQuantity(1) }}
              mintSuccess={mintSuccess}
              mintError={mintError}
            />

            {/* Contract Info - desktop only */}
            {hasContract && contractAddress && (() => {
              const explorerBase =
                onChainStatus?.chainId === 11155111 ? "https://sepolia.etherscan.io" :
                onChainStatus?.chainId === 964       ? "https://evm.taostats.io"     :
                onChainStatus?.chainId === 945       ? "https://test.taostats.io"    : null
              const contractUrl = explorerBase ? `${explorerBase}/address/${contractAddress}` : null
              const transfersLocked = onChainTransfersLocked as boolean | undefined
              const royaltyBps = onChainStatus?.onChain?.royaltyBps
              const owner = onChainStatus?.onChain?.owner

              return (
                <ContractInfo
                  key="contract-info"
                  contractAddress={contractAddress}
                  explorerUrl={contractUrl}
                  owner={owner}
                  royaltyBps={royaltyBps}
                  phasesCount={(onChainPhases as OnChainPhase[]).length || (project.phases?.length || 0)}
                  transfersLocked={transfersLocked}
                />
              )
            })()}

            {mintError && (
              <div className="flex items-start gap-2 text-red-400 text-sm p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{mintError}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mint Success Modal */}
      {mintSuccess && mintSuccess.tokenIds && (
        <MintSuccessModal
          isOpen={showMintSuccessModal}
          onClose={() => setShowMintSuccessModal(false)}
          slug={slug}
          tokenIds={mintSuccess.tokenIds}
          txHash={mintSuccess.txHash}
          quantity={mintSuccess.quantity}
          phaseName={activeOnChainPhase?.name || ""}
          totalCost={activeOnChainPhase ? (activeOnChainPhase.price * BigInt(mintSuccess.quantity)).toString() : "0"}
          currency={project?.currency || "TAO"}
          receipt={receipt}
        />
      )}
    </div>
  )
}

