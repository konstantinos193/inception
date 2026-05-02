"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { CheckCircle2, X, ExternalLink, Copy, Sparkles, Trophy } from "lucide-react"
import { nftImageUrl, fetchNFTRarity, type NFTRarity } from "@/lib/api"
import { getCollectionTheme } from "@/lib/collection-theme"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface MintSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  slug: string
  tokenIds: number[]
  txHash: string
  quantity: number
  phaseName: string
  totalCost: string
  currency: string
  receipt?: any
}

interface MintedNFT {
  tokenId: number
  imageUrl: string
  rarity: NFTRarity | null
  loading: boolean
}

export function MintSuccessModal({
  isOpen,
  onClose,
  slug,
  tokenIds,
  txHash,
  quantity,
  phaseName,
  totalCost,
  currency,
  receipt,
}: MintSuccessModalProps) {
  const theme = getCollectionTheme(slug)
  const [mintedNFTs, setMintedNFTs] = useState<MintedNFT[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isOpen || tokenIds.length === 0) return

    // Initialize NFTs with loading state
    const nfts: MintedNFT[] = tokenIds.map(tokenId => ({
      tokenId,
      imageUrl: nftImageUrl(slug, tokenId),
      rarity: null,
      loading: true,
    }))
    setMintedNFTs(nfts)

    // Fetch rarity for each NFT
    tokenIds.forEach(async (tokenId, index) => {
      try {
        const rarity = await fetchNFTRarity(slug, tokenId)
        setMintedNFTs(prev => {
          const updated = [...prev]
          updated[index] = { ...updated[index], rarity, loading: false }
          return updated
        })
      } catch (error) {
        console.error(`Failed to fetch rarity for token ${tokenId}:`, error)
        setMintedNFTs(prev => {
          const updated = [...prev]
          updated[index] = { ...updated[index], rarity: null, loading: false }
          return updated
        })
      }
    })
  }, [isOpen, tokenIds, slug])

  const copyTxHash = () => {
    navigator.clipboard.writeText(txHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getRarityColor = (tier?: string) => {
    if (!tier) return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    const lower = tier.toLowerCase()
    if (lower.includes("legendary") || lower.includes("one of one")) {
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    }
    if (lower.includes("mythic")) {
      return "bg-red-500/20 text-red-400 border-red-500/30"
    }
    if (lower.includes("ultra rare") || lower.includes("epic")) {
      return "bg-purple-500/20 text-purple-400 border-purple-500/30"
    }
    if (lower.includes("rare")) {
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
    return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }

  const getRarityIcon = (tier?: string) => {
    if (!tier) return null
    const lower = tier.toLowerCase()
    if (lower.includes("legendary") || lower.includes("one of one")) {
      return <Trophy className="w-3 h-3" />
    }
    if (lower.includes("mythic") || lower.includes("epic")) {
      return <Sparkles className="w-3 h-3" />
    }
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full bg-black/95 border border-white/10 text-white p-0 overflow-hidden">
        {/* Header with gradient background */}
        <div className="relative p-6 pb-8">
          {/* Animated gradient background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20 animate-gradient" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>

          {/* Success icon and title */}
          <div className="relative z-10">
            <button
              onClick={onClose}
              className="absolute top-0 right-0 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Mint Successful!
                </h2>
                <p className="text-gray-400 text-sm">
                  {quantity} NFT{quantity > 1 ? "s" : ""} minted successfully
                </p>
              </div>
            </div>

            {/* Transaction details */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Phase</p>
                <p className="text-sm font-semibold text-white">{phaseName}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Cost</p>
                <p className="text-sm font-semibold text-white">
                  {totalCost} {currency}
                </p>
              </div>
              {receipt && (
                <>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Block</p>
                    <p className="text-sm font-semibold text-white">{Number(receipt.blockNumber)}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Gas Used</p>
                    <p className="text-sm font-semibold text-white">{Number(receipt.gasUsed).toLocaleString()}</p>
                  </div>
                </>
              )}
              <div className="bg-white/5 rounded-lg p-3 border border-white/10 col-span-2 sm:col-span-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Transaction Hash</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-white/90 truncate flex-1">
                    {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </p>
                  <button
                    onClick={copyTxHash}
                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                    title="Copy transaction hash"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
                  </button>
                  <a
                    href={`https://evm.taostats.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                    title="View on explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
                  </a>
                </div>
                {copied && (
                  <p className="text-[10px] text-green-400 mt-1">Copied!</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NFT Grid */}
        <div className="p-6 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {mintedNFTs.map((nft, index) => (
              <div
                key={nft.tokenId}
                className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:border-white/20 transition-all duration-300 hover:scale-105"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* NFT Image */}
                <div className="relative w-full h-full">
                  {nft.loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <Image
                      src={nft.imageUrl}
                      alt={`Token #${nft.tokenId}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}

                  {/* Overlay with details on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-bold text-sm mb-1">
                        #{nft.tokenId}
                      </p>
                      {nft.rarity && (
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getRarityColor(nft.rarity.nft.rarity_tier)}`}>
                          {getRarityIcon(nft.rarity.nft.rarity_tier)}
                          {nft.rarity.nft.rarity_tier}
                        </div>
                      )}
                      {nft.rarity && (
                        <div className="mt-2 text-[10px] text-gray-400">
                          <div className="flex justify-between">
                            <span>Rank:</span>
                            <span className="text-white">#{nft.rarity.nft.rarity_rank}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Score:</span>
                            <span className="text-white">{nft.rarity.nft.rarity_score.toFixed(2)}</span>
                          </div>
                          {nft.rarity.collectionStats && (
                            <div className="flex justify-between">
                              <span>Percentile:</span>
                              <span className="text-white">{nft.rarity.collectionStats.percentile}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {nft.rarity && nft.rarity.nft.trait_rarities && Object.keys(nft.rarity.nft.trait_rarities).length > 0 && (
                        <div className="mt-2 space-y-1">
                          {Object.entries(nft.rarity.nft.trait_rarities).slice(0, 3).map(([trait, data]: [string, any]) => (
                            <div key={trait} className="flex justify-between items-center text-[9px]">
                              <span className="text-gray-400 capitalize truncate max-w-[60%]">{trait}:</span>
                              <span className="text-white font-medium">{data.value}</span>
                            </div>
                          ))}
                          {Object.keys(nft.rarity.nft.trait_rarities).length > 3 && (
                            <p className="text-[9px] text-gray-500">+{Object.keys(nft.rarity.nft.trait_rarities).length - 3} more traits</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rarity badge (always visible) */}
                {!nft.loading && nft.rarity && (
                  <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getRarityColor(nft.rarity.nft.rarity_tier)} backdrop-blur-sm`}>
                    {getRarityIcon(nft.rarity.nft.rarity_tier)}
                    {nft.rarity.nft.rarity_tier}
                  </div>
                )}

                {/* Token ID badge (always visible) */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-mono text-white border border-white/10">
                  #{nft.tokenId}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className={`w-full py-3 px-6 bg-gradient-to-r ${theme.mintButton} ${theme.mintButtonHover} text-white font-bold rounded-lg hover:opacity-90 transition-all duration-200`}
          >
            Continue Browsing
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
