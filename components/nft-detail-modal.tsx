"use client"

import { X, ExternalLink } from 'lucide-react'

interface Trait {
  trait_type: string
  value: string
}

interface NFTDetail {
  _id: string
  tokenId: number
  name: string
  image: string
  animationUrl?: string
  rarityRank?: number
  rarityTier?: string
  mintedBy: string
  currentOwner?: string
  mintedAt?: string
  traits?: Trait[]
  contractAddress?: string
  chainId?: number
  explorerUrl?: string
}

interface NFTDetailModalProps {
  nft: NFTDetail | null
  onClose: () => void
}

export function NFTDetailModal({ nft, onClose }: NFTDetailModalProps) {
  if (!nft) return null

  const getRarityColor = (tier?: string) => {
    switch (tier?.toLowerCase()) {
      case 'legendary':
        return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
      case 'epic':
        return 'text-purple-400 border-purple-400/30 bg-purple-400/10'
      case 'rare':
        return 'text-blue-400 border-blue-400/30 bg-blue-400/10'
      case 'common':
        return 'text-gray-400 border-gray-400/30 bg-gray-400/10'
      default:
        return 'text-gray-400 border-gray-400/30 bg-gray-400/10'
    }
  }

  const shortAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background border border-border transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Media section */}
          <div className="relative aspect-square md:aspect-auto md:h-full bg-card/50">
            {nft.animationUrl ? (
              <video
                src={nft.animationUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to image if video fails to load
                  const target = e.target as HTMLVideoElement
                  target.style.display = 'none'
                  const img = document.createElement('img')
                  img.src = nft.image
                  img.alt = nft.name
                  img.className = 'w-full h-full object-cover'
                  target.parentElement?.appendChild(img)
                }}
              />
            ) : (
              <img
                src={nft.image}
                alt={nft.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Details section */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold mb-2">{nft.name}</h2>
              <div className="flex items-center gap-3">
                {nft.rarityTier && (
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getRarityColor(nft.rarityTier)}`}>
                    {nft.rarityTier}
                  </span>
                )}
                {nft.rarityRank && (
                  <span className="text-sm text-foreground/60">
                    Rank #{nft.rarityRank}
                  </span>
                )}
              </div>
            </div>

            {/* Owner info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/60">Token ID</span>
                <span className="font-mono">#{nft.tokenId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/60">Minted by</span>
                <span className="font-mono">{shortAddress(nft.mintedBy)}</span>
              </div>
              {nft.currentOwner && nft.currentOwner !== nft.mintedBy && (
                <div className="flex justify-between">
                  <span className="text-foreground/60">Current owner</span>
                  <span className="font-mono">{shortAddress(nft.currentOwner)}</span>
                </div>
              )}
              {nft.mintedAt && (
                <div className="flex justify-between">
                  <span className="text-foreground/60">Minted at</span>
                  <span className="font-mono">{new Date(nft.mintedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Traits */}
            {nft.traits && nft.traits.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/60 mb-3">Traits</h3>
                <div className="grid grid-cols-2 gap-2">
                  {nft.traits.map((trait, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-border bg-card/50 text-center"
                    >
                      <div className="text-[10px] uppercase tracking-wider text-foreground/60 mb-1">
                        {trait.trait_type}
                      </div>
                      <div className="text-sm font-medium">{trait.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explorer link */}
            {nft.explorerUrl && (
              <a
                href={nft.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-foreground/30 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
