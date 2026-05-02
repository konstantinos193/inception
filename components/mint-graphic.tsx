import { useState, useEffect, useRef } from "react"

interface MintGraphicProps {
  slug: string
  graphicPath?: string
  pfpPath?: string
  // Minting state
  minted?: number
  supply?: number
  quantity?: number
  totalCost?: string
  currency?: string
  // Handlers
  onDecrement?: () => void
  onIncrement?: () => void
  onMint?: () => void
  // Button state
  canDecrement?: boolean
  canIncrement?: boolean
  canMint?: boolean
  isMinting?: boolean
  disabledReason?: string
  // Phase info
  phaseName?: string
  phasePrice?: string
  // Phase selection (when multiple phases are active)
  phases?: Array<{ name: string; index: number; isActive: boolean; isSelected: boolean; paused?: boolean }>
  onPhaseSelect?: (index: number) => void
  // Success/Error state
  mintSuccess?: { txHash: string; quantity: number } | null
  mintError?: string | null
}

export default function MintGraphic({
  slug,
  graphicPath,
  pfpPath,
  minted = 0,
  supply = 10000,
  quantity = 1,
  totalCost = "0",
  currency = "TAO",
  onDecrement,
  onIncrement,
  onMint,
  canDecrement = true,
  canIncrement = true,
  canMint = true,
  isMinting = false,
  disabledReason,
  phaseName,
  phasePrice,
  phases,
  onPhaseSelect,
  mintSuccess,
  mintError,
}: MintGraphicProps) {
  const [videoError, setVideoError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Use provided graphic path or default to collection-specific path
  const videoSrc = graphicPath || `/collections/${slug}/mint-graphic.mp4`

  // Cleanup video on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.src = ""
      }
    }
  }, [])

  return (
    <div className="flex justify-center -mt-8 lg:justify-end lg:-mt-0">
      <div className="w-full max-w-md bg-gray-400/30 backdrop-blur-sm rounded-2xl overflow-hidden">
        {/* Desktop: different layout with same container */}
        <div className="hidden lg:block p-5 space-y-4">
          {/* Video/graphic */}
          <div className="relative aspect-square w-full max-w-xs rounded-2xl overflow-hidden border border-border/50 mx-auto">
            {!videoError ? (
              <video
                ref={videoRef}
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
                style={{ willChange: 'transform' }}
                onError={() => setVideoError(true)}
              />
            ) : (
              <img
                src={pfpPath || `/collections/${slug}/mint-graphic.png`}
                alt={`Mint ${slug}`}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Desktop controls */}
          <div className="space-y-3">
            {/* Phase selector - hidden on desktop since phases are selectable from main phase cards */}
            {phases && phases.length > 1 && (
              <div className="flex gap-2 flex-wrap lg:hidden">
                {phases.filter(p => !p.paused).map((phase) => (
                  <button
                    key={phase.index}
                    onClick={() => onPhaseSelect?.(phase.index)}
                    disabled={!phase.isActive}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      phase.isSelected
                        ? "bg-foreground/15 border-foreground/30 text-foreground"
                        : phase.isActive
                        ? "bg-foreground/5 border-border text-foreground/50 hover:bg-foreground/10"
                        : "bg-foreground/5 border-border text-foreground/30 cursor-not-allowed opacity-50"
                    }`}
                  >
                    {phase.name}
                  </button>
                ))}
              </div>
            )}

            {/* Phase info row */}
            {phaseName && (
              <div className="flex items-center text-xs text-foreground/50">
                <span>Phase: {phaseName}</span>
              </div>
            )}

            {/* Amount row - label and selector on same line */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground/70">AMOUNT:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onDecrement}
                  disabled={!canDecrement}
                  className="w-7 h-7 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                  style={{ borderColor: "var(--electric-blue)", color: "var(--electric-blue)" }}
                >
                  -
                </button>
                <span className="w-8 h-7 flex items-center justify-center font-mono text-foreground border rounded-lg text-sm select-text cursor-text" style={{ borderColor: "var(--electric-blue)" }}>{quantity}</span>
                <button
                  onClick={onIncrement}
                  disabled={!canIncrement}
                  className="w-7 h-7 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                  style={{ borderColor: "var(--electric-blue)", color: "var(--electric-blue)" }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Total cost & Minted */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50">
                <p className="text-[10px] text-foreground/40 uppercase tracking-[0.1em] mb-1">Total Cost</p>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-bold text-green-400 text-sm">{totalCost === "0" ? (phaseName ? "Free" : "—") : totalCost}</span>
                  {totalCost !== "0" && (
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white">
                      <img src="/bittensor-logo.svg" alt="T" className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50">
                <p className="text-[10px] text-foreground/40 uppercase tracking-[0.1em] mb-1">Minted</p>
                <p className="text-xs font-bold text-foreground font-mono">{minted.toLocaleString()} / {supply.toLocaleString()}</p>
              </div>
            </div>

            {/* Mint button */}
            <button
              onClick={onMint}
              disabled={!canMint || isMinting}
              className="w-full py-3 rounded-xl font-semibold uppercase tracking-[0.1em] transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--electric-blue)", color: "white" }}
            >
              {isMinting ? "Minting..." : `Mint ${slug.charAt(0).toUpperCase() + slug.slice(1)}`}
            </button>
            {disabledReason && !canMint && (
              <p className="text-xs text-center text-foreground/50">{disabledReason}</p>
            )}
            {mintSuccess && (
              <div className="flex items-center gap-2 text-green-400 text-sm p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <span>Minted {mintSuccess.quantity} NFT{mintSuccess.quantity > 1 ? "s" : ""}!</span>
              </div>
            )}
            {mintError && (
              <div className="flex items-start gap-2 text-red-400 text-sm p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <span>{mintError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: original design (unchanged) */}
        <div className="lg:hidden">
          {/* Video/graphic centered in frame (1:1 aspect ratio) */}
          <div className="p-8 flex justify-center">
            <div className="relative aspect-square w-56">
              {!videoError ? (
                <video
                  ref={videoRef}
                  src={videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover rounded-xl"
                  style={{ willChange: 'transform' }}
                  onError={() => setVideoError(true)}
                />
              ) : (
                <img
                  src={pfpPath || `/collections/${slug}/mint-graphic.png`}
                  alt={`Mint ${slug}`}
                  className="w-full h-full object-cover rounded-xl"
                />
              )}
            </div>
          </div>
          {/* Mint controls below */}
          <div className="p-5 space-y-4">
            {/* Phase selector (only shown when multiple phases are active) */}
            {phases && phases.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {phases.filter(p => !p.paused).map((phase) => (
                  <button
                    key={phase.index}
                    onClick={() => onPhaseSelect?.(phase.index)}
                    disabled={!phase.isActive}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      phase.isSelected
                        ? "bg-foreground/15 border-foreground/30 text-foreground"
                        : phase.isActive
                        ? "bg-foreground/5 border-border text-foreground/50 hover:bg-foreground/10"
                        : "bg-foreground/5 border-border text-foreground/30 cursor-not-allowed opacity-50"
                    }`}
                  >
                    {phase.name}
                  </button>
                ))}
              </div>
            )}

            {/* Current phase info */}
            {phaseName && (
              <div className="flex items-center text-xs text-foreground/50">
                <span>Phase: {phaseName}</span>
              </div>
            )}

            {/* Minted count */}
            <div className="flex justify-between text-sm text-foreground/60">
              <span>Minted</span>
              <span className="font-mono">{minted.toLocaleString()} / {supply.toLocaleString()}</span>
            </div>

            {/* Amount selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground/70">AMOUNT:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onDecrement}
                  disabled={!canDecrement}
                  className="w-8 h-8 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ borderColor: "var(--electric-blue)", color: "var(--electric-blue)" }}
                >
                  -
                </button>
                <span className="w-8 h-8 flex items-center justify-center font-mono text-foreground border rounded-lg" style={{ borderColor: "var(--electric-blue)" }}>{quantity}</span>
                <button
                  onClick={onIncrement}
                  disabled={!canIncrement}
                  className="w-8 h-8 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ borderColor: "var(--electric-blue)", color: "var(--electric-blue)" }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Total cost */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground/60">TOTAL COST:</span>
              <div className="flex items-center gap-1">
                <span className="font-mono font-bold text-green-400 text-sm">{totalCost === "0" ? (phaseName ? "Free" : "—") : totalCost}</span>
                {totalCost !== "0" && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white">
                    <img src="/bittensor-logo.svg" alt="T" className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>

            {/* Mint button */}
            <button
              onClick={onMint}
              disabled={!canMint || isMinting}
              className="w-full py-3 rounded-xl font-semibold uppercase tracking-[0.1em] transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--electric-blue)", color: "white" }}
            >
              {isMinting ? "Minting..." : `Mint ${slug.charAt(0).toUpperCase() + slug.slice(1)}`}
            </button>
            {disabledReason && !canMint && (
              <p className="text-xs text-center text-foreground/50">{disabledReason}</p>
            )}
            {mintSuccess && (
              <div className="flex items-center gap-2 text-green-400 text-sm p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <span>Minted {mintSuccess.quantity} NFT{mintSuccess.quantity > 1 ? "s" : ""}!</span>
              </div>
            )}
            {mintError && (
              <div className="flex items-start gap-2 text-red-400 text-sm p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <span>{mintError}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
