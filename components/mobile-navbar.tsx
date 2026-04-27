"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import dynamic from "next/dynamic"

const ConnectButton = dynamic(
  () => import("@/components/connect-button").then((m) => m.ConnectButton),
  { ssr: false }
)

export function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  return (
    <nav className="fixed top-0 w-full z-50 transition-[transform,opacity] duration-300 ease-in-out will-change-transform translate-y-0 opacity-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center">
            <img 
              src="/logo-mark.png" 
              alt="TAO Launchpad" 
              className="w-8 h-8 object-contain"
            />
          </Link>

          {/* Right side with blue border */}
          <div 
            className="flex items-center gap-3 px-4 py-3 border-b rounded-b-xl backdrop-blur-md"
            style={{ borderColor: "var(--electric-blue)", boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 2px 16px rgba(76,159,252,0.08)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
          >
            <ConnectButton />
            <button onClick={() => setIsOpen(!isOpen)} className="w-9 h-9 flex items-center justify-center text-foreground" aria-label="Toggle menu">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)}></div>
            <aside className={`fixed inset-y-0 right-0 w-80 bg-card/95 backdrop-blur-lg z-50 transform transition-transform ease-in-out duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/20">
                <div className="flex items-center gap-2">
                  <img src="/logo-mark.png" alt="TAO Launchpad" className="w-6 h-6 object-contain" />
                  <span className="text-sm font-semibold text-foreground">MENU</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Navigation */}
              <div className="flex-1 p-4 space-y-3 bg-card/95">
                <Link href="/collections" className="block p-3 rounded-lg hover:bg-muted/50 transition-colors" onClick={() => setIsOpen(false)}>
                  <span className="text-sm font-medium uppercase tracking-wider text-foreground">Collections</span>
                </Link>
                <Link href="/about" className="block p-3 rounded-lg hover:bg-muted/50 transition-colors" onClick={() => setIsOpen(false)}>
                  <span className="text-sm font-medium uppercase tracking-wider text-foreground">About</span>
                </Link>
              </div>
              
              {/* Theme Toggle */}
              <div className="border-t border-border/20 pt-4">
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="w-full flex items-center justify-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    aria-label="Toggle theme"
                  >
                    {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    <span className="text-sm text-foreground">Theme</span>
                  </button>
                </div>
            </aside>
          </>
        )}
      </div>
    </nav>
  )
}
