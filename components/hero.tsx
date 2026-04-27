"use client"

import Image from "next/image"
import Link from "next/link"
import { Wallet, ShieldCheck, Zap } from "lucide-react"
import { useDiscordInvite } from "@/hooks/useDiscordInvite"

function IconBittensor() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" className="opacity-50 hover:opacity-100 transition-opacity">
      <path d="M16 2L4 9v14l12 7 12-7V9L16 2zm0 3.2l9.2 5.3v10.6L16 26.8l-9.2-5.3V10.5L16 5.2z" />
    </svg>
  )
}

export function Hero() {
  const { inviteUrl, isLoading } = useDiscordInvite()

  return (
    <section className="relative min-h-screen overflow-hidden bg-background flex items-center">

      {/* Grid overlay — identical to marketplace */}
      <div
        className="absolute inset-0 z-0 opacity-[0.35] dark:opacity-[0.12]"
        style={{
          backgroundImage: "url('/grid-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Blue wash — light mode only */}
      <div
        className="absolute inset-0 z-0 dark:hidden"
        style={{
          background: "radial-gradient(ellipse 80% 100% at 0% 80%, rgba(76,159,252,0.75) 0%, rgba(76,159,252,0.4) 35%, rgba(76,159,252,0.1) 60%, transparent 75%)",
        }}
      />

      {/* Hero background image — light mode only */}
      <div className="absolute inset-0 z-0 dark:hidden">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: "url('/hero-bg-no-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: 1,
          }}
        />
      </div>

      {/* Hero background image — dark mode only */}
      <div className="absolute inset-0 z-0 hidden dark:block">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: "url('/hero-bg-dark-no-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: 1,
          }}
        />
      </div>

      {/* Right: brand mark — radial mask hides the solid background, keeps the icon */}
      <div className="absolute right-[-6%] top-[50%] -translate-y-1/2 w-[52%] aspect-square pointer-events-none select-none">
        {/* Atmospheric glow behind the icon */}
        <div
          className="absolute inset-[15%] rounded-full blur-[100px] opacity-20 dark:opacity-15"
          style={{ background: "var(--electric-blue)" }}
        />
        {/* Icon with radial mask to dissolve the white background edges */}
        <div
          className="relative w-full h-full"
          style={{
            WebkitMaskImage: "radial-gradient(circle at center, black 28%, transparent 62%)",
            maskImage: "radial-gradient(circle at center, black 28%, transparent 62%)",
          }}
        >
          <Image
            src="/logo1x1-colored.png"
            alt=""
            fill
            className="object-contain opacity-70 dark:opacity-60"
            sizes="52vw"
            priority
          />
        </div>
      </div>

      {/* Left: text content — same structure as marketplace */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 pt-28 pb-16">
        <div className="max-w-[55%]">

          {/* Eyebrow */}
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-black/50 dark:text-white/60 mb-6">
            NFT Launchpad&nbsp;&nbsp;·&nbsp;&nbsp;Bittensor EVM
          </p>

          {/* Headline */}
          <h1
            className="leading-none mb-8"
            style={{
              fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif",
              fontWeight: 800,
              fontStyle: "normal",
              fontSize: "clamp(2.8rem, 9vw, 7rem)",
            }}
          >
            <span style={{ color: "var(--electric-blue)" }}>PREMIUM</span>
            <br />
            <span className="text-foreground">BY DESIGN,</span>
            <br />
            <span style={{ color: "var(--electric-blue)" }}>ACCOUNTABLE</span>
            <br />
            <span className="text-foreground">BY CHOICE.</span>
          </h1>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mb-10">
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={isLoading ? "Loading fresh invite..." : "VIEW COLLECTIONS"}
            >
              <button
                className="px-7 py-3 text-sm font-semibold uppercase tracking-wider bg-white text-black hover:bg-white/90 transition-colors"
                style={{ borderRadius: "8px" }}
              >
                VIEW COLLECTIONS
              </button>
            </a>
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={isLoading ? "Loading fresh invite..." : "Launch With Us"}
            >
              <button
                className="px-7 py-3 text-sm font-semibold uppercase tracking-wider bg-transparent hover:bg-white/10 transition-colors"
                style={{ boxShadow: "inset 0 0 0 2px var(--electric-blue)", color: "var(--electric-blue)", borderRadius: "8px" }}
              >
                Launch With Us
              </button>
            </a>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Bittensor EVM */}
            <div className="flex items-center gap-2 text-foreground/50 hover:text-foreground/80 transition-opacity">
              <IconBittensor />
              <span className="text-[11px] font-medium uppercase tracking-[0.12em]">Bittensor EVM</span>
            </div>
            <span className="w-px h-4 bg-foreground/20" />
            {/* Non-custodial */}
            <div className="flex items-center gap-2 text-foreground/50 hover:text-foreground/80 transition-opacity">
              <Wallet className="w-4 h-4" />
              <span className="text-[11px] font-medium uppercase tracking-[0.12em]">Non-Custodial</span>
            </div>
            <span className="w-px h-4 bg-foreground/20" />
            {/* Audited */}
            <div className="flex items-center gap-2 text-foreground/50 hover:text-foreground/80 transition-opacity">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[11px] font-medium uppercase tracking-[0.12em]">Audited</span>
            </div>
            <span className="w-px h-4 bg-foreground/20" />
            {/* Verified */}
            <div className="flex items-center gap-2 text-foreground/50 hover:text-foreground/80 transition-opacity">
              <Zap className="w-4 h-4" />
              <span className="text-[11px] font-medium uppercase tracking-[0.12em]">Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee — pinned to hero bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-10 overflow-hidden bg-background/80 backdrop-blur-sm border-t border-black/10 dark:border-white/10"
        style={{ boxShadow: "0 6px 8px 0 rgba(0,0,0,0.10)" }}
      >
        <div className="animate-marquee flex items-center h-full whitespace-nowrap">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="flex items-center shrink-0">
              {["PERMISSIONLESS","VERIFIED","BITTENSOR","EVM","LAUNCHPAD","AUDITED","SECURE","ACCOUNTABLE"].map((word) => (
                <span key={word} className="flex items-center">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/70 px-5">
                    {word}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-foreground/30 shrink-0" />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
