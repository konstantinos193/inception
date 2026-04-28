"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useIsMobile } from "@/hooks/use-mobile"
import { MobileNavbar } from "@/components/mobile-navbar"
import dynamic from "next/dynamic"

const ConnectButton = dynamic(
  () => import("@/components/connect-button").then((m) => m.ConnectButton),
  { ssr: false }
)


export function Navbar() {
  const [hidden, setHidden] = useState(false)
  const [mounted, setMounted] = useState(false)
  const isMobile = useIsMobile()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    let lastY = window.scrollY
    let stopTimer: ReturnType<typeof setTimeout>
    const onScroll = () => {
      const currentY = window.scrollY
      clearTimeout(stopTimer)
      if (currentY < 80) {
        setHidden(false)
      } else if (currentY < lastY) {
        setHidden(false)
        stopTimer = setTimeout(() => setHidden(true), 1000)
      } else {
        setHidden(true)
      }
      lastY = currentY
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(stopTimer) }
  }, [])

  // Return MobileNavbar for mobile devices
  if (mounted && isMobile) {
    return <MobileNavbar />
  }

  // Desktop navbar
  return (
    <nav className={`fixed top-3 w-full z-50 transition-[transform,opacity] duration-300 ease-in-out will-change-transform ${hidden ? "-translate-y-[calc(100%+12px)] opacity-0" : "translate-y-0 opacity-100"}`}>
      <div
        className="max-w-7xl mx-auto px-6 lg:px-10 bg-card/50 border-t-0 border-b rounded-b-xl backdrop-blur-md"
        style={{ borderColor: "var(--electric-blue)", boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 2px 16px rgba(76,159,252,0.08)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center justify-between h-16">
          {/* Desktop Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-3">
            <div className="flex items-baseline gap-1">
              <span style={{ fontFamily: "var(--font-goldman), sans-serif", fontWeight: 700, fontSize: "24px", lineHeight: "32px", color: "hsl(var(--foreground))", textTransform: "uppercase" }}>
                ELEVATE
              </span>
              <span style={{ width: "7px", height: "7px", backgroundColor: "hsl(var(--foreground))", borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />
            </div>
            <span style={{ width: "1px", height: "18px", backgroundColor: "hsl(var(--border))", display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "9px", fontWeight: 500, letterSpacing: "0.22em", color: "hsl(var(--muted-foreground))", opacity: 0.75, textTransform: "uppercase", lineHeight: 1 }}>
              LAUNCHPAD
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="flex items-center gap-3">
            <Link href="/collections" className="text-xs font-medium uppercase tracking-widest transition-colors px-3 text-[#1a1a1a] hover:text-black dark:text-white dark:hover:text-white/70">
              Collections
            </Link>
            <Link href="/about" className="text-xs font-medium uppercase tracking-widest transition-colors px-3 text-[#1a1a1a] hover:text-black dark:text-white dark:hover:text-white/70">
              About
            </Link>
            <ConnectButton />
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-md transition-colors hover:bg-accent text-[#1a1a1a] dark:text-white"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
