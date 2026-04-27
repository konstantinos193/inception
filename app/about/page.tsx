"use client"

import Link from "next/link"
import { useDiscordInvite } from "@/hooks/useDiscordInvite"

export default function About() {
  const { inviteUrl } = useDiscordInvite()

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════
          01 · STATEMENT
          ═══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen border-b border-border flex flex-col">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-10 pt-28 pb-16 flex flex-col justify-between flex-1">

          {/* top meta bar */}
          <div className="flex items-center justify-between text-[11px] font-mono tracking-[0.2em] uppercase text-foreground/35">
            <span>Elevate · Bittensor EVM</span>
            <span>Est. 2026</span>
          </div>

          {/* central statement */}
          <div className="py-16">
            <h1
              className="leading-[0.88] tracking-tight"
              style={{
                fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(4.5rem, 13vw, 11rem)",
              }}
            >
              <span className="text-foreground/20">NOT EVERY</span>
              <br />
              <span className="text-foreground">COLLECTION</span>
              <br />
              <span style={{ color: "var(--electric-blue)" }}>MAKES IT</span>
              <br />
              <span className="text-foreground">HERE.</span>
            </h1>

            <div className="flex items-start gap-6 mt-14 max-w-xl">
              <div
                className="w-px shrink-0 mt-1"
                style={{ height: "72px", background: "var(--electric-blue)" }}
              />
              <p className="text-base md:text-lg text-foreground/55 leading-relaxed">
                Elevate is a curated NFT launchpad on Bittensor EVM. Every collection is
                reviewed, every contract is audited, and every project earns its place.
              </p>
            </div>
          </div>

          {/* bottom row */}
          <div className="flex items-end justify-between">
            <div className="flex flex-wrap gap-4">
              <a href={inviteUrl} target="_blank" rel="noopener noreferrer">
                <button
                  className="px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] bg-foreground text-background hover:opacity-80 transition-opacity"
                  style={{ borderRadius: "6px" }}
                >
                  Join Discord
                </button>
              </a>
              <Link href="/collections">
                <button
                  className="px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] bg-transparent hover:bg-foreground/5 transition-colors"
                  style={{ boxShadow: "inset 0 0 0 1.5px var(--electric-blue)", color: "var(--electric-blue)", borderRadius: "6px" }}
                >
                  Browse Collections
                </button>
              </Link>
            </div>
            <span
              className="text-foreground/10 select-none hidden md:block"
              style={{
                fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(4rem, 8vw, 7rem)",
                lineHeight: 1,
              }}
            >
              01
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          02 · WHAT WE ARE
          ═══════════════════════════════════════════════════════ */}
      <section className="border-b border-border py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-[220px_1fr] gap-10 md:gap-20">

            <div className="flex flex-col gap-3 pt-1">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em]" style={{ color: "var(--electric-blue)" }}>
                What We Are
              </span>
              <span
                className="text-foreground/10"
                style={{ fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif", fontWeight: 800, fontSize: "clamp(3rem, 6vw, 5rem)", lineHeight: 1 }}
              >
                02
              </span>
            </div>

            <div>
              <p className="text-foreground/80 leading-relaxed mb-8" style={{ fontSize: "clamp(1.05rem, 2vw, 1.3rem)" }}>
                We built Elevate because Bittensor needed a launchpad that held itself to a
                standard. One that vets the teams behind the art, verifies the contracts before a
                single wallet connects, and stands behind every project it lists.
              </p>
              <p className="text-foreground/50 leading-relaxed text-base">
                Creators apply. We review. Only approved collections go live — with our
                infrastructure, our tools, and our name behind them.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px mt-14 border border-border rounded-xl overflow-hidden">
                {[
                  { n: "TAO",  label: "Native Currency" },
                  { n: "100%", label: "Non-Custodial" },
                  { n: "0%",   label: "Hidden Fees" },
                  { n: "24/7", label: "Community" },
                ].map(({ n, label }) => (
                  <div key={label} className="bg-card px-6 py-6 flex flex-col gap-1">
                    <span
                      style={{ fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif", fontWeight: 800, fontSize: "2.2rem", color: "var(--electric-blue)", lineHeight: 1 }}
                    >
                      {n}
                    </span>
                    <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/45">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          03 · PLATFORM SERVICES
          ═══════════════════════════════════════════════════════ */}
      <section className="border-b border-border py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-[220px_1fr] gap-10 md:gap-20">

            <div className="flex flex-col gap-3 pt-1">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em]" style={{ color: "var(--electric-blue)" }}>
                Platform
              </span>
              <span
                className="text-foreground/10"
                style={{ fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif", fontWeight: 800, fontSize: "clamp(3rem, 6vw, 5rem)", lineHeight: 1 }}
              >
                03
              </span>
            </div>

            <div>
              <p className="text-foreground/45 text-sm mb-10 max-w-md">
                Everything a creator needs to launch — and everything a collector needs to trust.
              </p>

              <div className="divide-y divide-border">
                {[
                  { name: "Audited Smart Contracts",    detail: "ERC-721A with ERC-2981 royalties. Gas-optimised, security-reviewed, deployed per collection." },
                  { name: "Multi-Phase Launches",        detail: "Allowlist, team, and public phases — each with independent pricing, supply caps, and wallet limits." },
                  { name: "Allowlist Management",        detail: "ECDSA-signed per-wallet allowances. No merkle trees. On-chain verification, off-chain flexibility." },
                  { name: "Secondary Marketplace",       detail: "Off-chain listings via EIP-712 — sellers sign for free, buyers pay when they buy. On-chain offers with escrow." },
                  { name: "Creator Royalties Enforced",  detail: "ERC-2981 royalties split on every marketplace transaction, with a configurable cap protecting collectors." },
                  { name: "Discord Integration",         detail: "Server management, invite tracking, and whitelist tooling baked into the platform." },
                  { name: "Transfer Lock",               detail: "Tokens launch non-transferable by default. Creators unlock trading on their own terms — preventing day-one flipping." },
                  { name: "Reveal Mechanics",            detail: "Hidden mint with unrevealed URI. Owner reveals when ready, then optionally freezes metadata permanently." },
                ].map(({ name, detail }) => (
                  <div
                    key={name}
                    className="group grid md:grid-cols-[1fr_1.6fr] gap-4 py-5 items-baseline hover:bg-card/40 transition-colors -mx-4 px-4 rounded-lg"
                  >
                    <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors uppercase tracking-[0.06em]">
                      {name}
                    </span>
                    <span className="text-sm text-foreground/45 leading-relaxed">{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          04 · THE PROCESS
          ═══════════════════════════════════════════════════════ */}
      <section className="border-b border-border py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-[220px_1fr] gap-10 md:gap-20">

            <div className="flex flex-col gap-3 pt-1">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em]" style={{ color: "var(--electric-blue)" }}>
                For Creators
              </span>
              <span
                className="text-foreground/10"
                style={{ fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif", fontWeight: 800, fontSize: "clamp(3rem, 6vw, 5rem)", lineHeight: 1 }}
              >
                04
              </span>
            </div>

            <div className="relative">
              <div
                className="absolute left-[19px] top-8 bottom-8 w-px hidden md:block"
                style={{ background: "linear-gradient(to bottom, var(--electric-blue), transparent)" }}
              />

              <div className="space-y-0">
                {[
                  { n: "01", title: "Apply",  body: "Submit your project through Discord. Share artwork, contract plans, team info, and timeline. No application fee." },
                  { n: "02", title: "Review", body: "We verify the team, artwork originality, and contract integrity. This takes days, not weeks. You hear back either way." },
                  { n: "03", title: "Deploy", body: "Approved projects get a deployment-ready ERC-721A contract with phases, allowlist, royalties, and reveal mechanics pre-configured." },
                  { n: "04", title: "Launch", body: "Go live on Elevate. We manage the allowlist signing, monitor the mint in real time, and open the marketplace post-launch." },
                ].map(({ n, title, body }) => (
                  <div key={n} className="flex gap-6 py-8 border-b border-border/50 last:border-0">
                    <div className="flex flex-col items-center shrink-0 mt-1">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-mono font-semibold z-10"
                        style={{ background: "var(--electric-blue)", color: "#fff" }}
                      >
                        {n}
                      </div>
                    </div>
                    <div className="flex-1 pb-2">
                      <h3
                        className="text-foreground mb-2"
                        style={{ fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif", fontWeight: 800, fontSize: "1.5rem", letterSpacing: "0.03em" }}
                      >
                        {title}
                      </h3>
                      <p className="text-foreground/50 text-sm leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          05 · FEE STRUCTURE
          ═══════════════════════════════════════════════════════ */}
      <section className="border-b border-border py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-[220px_1fr] gap-10 md:gap-20">

            <div className="flex flex-col gap-3 pt-1">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em]" style={{ color: "var(--electric-blue)" }}>
                Fees
              </span>
              <span
                className="text-foreground/10"
                style={{ fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif", fontWeight: 800, fontSize: "clamp(3rem, 6vw, 5rem)", lineHeight: 1 }}
              >
                05
              </span>
            </div>

            <div>
              <p className="text-foreground/45 text-sm mb-10 max-w-md">
                Every fee is on-chain and immutable per collection. No hidden percentages, no back-door takes.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "Platform Mint Fee",  value: "Fixed at deploy", note: "Set once per collection when the contract is deployed. Charged on every mint — including free mints as a flat rate." },
                  { label: "Marketplace Fee",    value: "≤ 10%",           note: "Applied on secondary sales. Max capped at 10% by contract. Split alongside creator royalties automatically." },
                  { label: "Creator Royalties",  value: "ERC-2981",        note: "Set by the creator at deploy time. Enforced on every marketplace transaction up to the configured cap." },
                  { label: "Listing Gas",        value: "Free",            note: "Sellers sign listings off-chain — no gas required. Gas is only paid by the buyer on purchase." },
                ].map(({ label, value, note }) => (
                  <div key={label} className="rounded-xl border border-border bg-card/40 p-6 flex flex-col gap-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground/50">{label}</span>
                      <span className="shrink-0 font-mono text-sm font-semibold" style={{ color: "var(--electric-blue)" }}>{value}</span>
                    </div>
                    <p className="text-xs text-foreground/40 leading-relaxed">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA
          ═══════════════════════════════════════════════════════ */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">

            <h2
              className="leading-none"
              style={{ fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif", fontWeight: 800, fontSize: "clamp(3rem, 8vw, 7rem)" }}
            >
              <span className="text-foreground">READY TO</span>
              <br />
              <span style={{ color: "var(--electric-blue)" }}>ELEVATE?</span>
            </h2>

            <div className="flex flex-col gap-5 md:items-end max-w-sm">
              <p className="text-foreground/45 text-sm leading-relaxed md:text-right">
                Whether you&apos;re a creator with a serious project or a collector looking for
                what&apos;s next on Bittensor — this is where to start.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href={inviteUrl} target="_blank" rel="noopener noreferrer">
                  <button
                    className="px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] bg-foreground text-background hover:opacity-80 transition-opacity"
                    style={{ borderRadius: "6px" }}
                  >
                    Apply as Creator
                  </button>
                </a>
                <Link href="/collections">
                  <button
                    className="px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] bg-transparent hover:bg-foreground/5 transition-colors"
                    style={{ boxShadow: "inset 0 0 0 1.5px var(--electric-blue)", color: "var(--electric-blue)", borderRadius: "6px" }}
                  >
                    Explore Collections
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-20 h-px bg-gradient-to-r from-[var(--electric-blue)] via-border to-transparent" />
        </div>
      </section>

    </div>
  )
}
