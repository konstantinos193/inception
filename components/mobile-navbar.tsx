"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"

const ConnectButton = dynamic(
  () => import("@/components/connect-button").then((m) => m.ConnectButton),
  { ssr: false }
)

export function MobileNavbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  useEffect(() => { setIsOpen(false) }, [pathname])

  return (
    <>
      {/* Top bar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-card border-b border-border/20">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/" className="shrink-0 flex items-center">
            <img src="/logo-mark.png" alt="TAO Launchpad" className="w-8 h-8 object-contain" />
          </Link>
          <div className="flex items-center gap-2">
            <ConnectButton />
            <button
              onClick={() => setIsOpen(true)}
              className="w-8 h-8 flex items-center justify-center text-[#1a1a1a] dark:text-white"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 w-72 bg-white dark:bg-card z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border/20 flex-shrink-0">
          <div className="flex items-center gap-2">
            <img src="/logo-mark.png" alt="TAO Launchpad" className="w-6 h-6 object-contain" />
            <span className="text-sm font-semibold text-[#1a1a1a] dark:text-white">MENU</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors text-[#1a1a1a] dark:text-white"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation links — fills remaining space */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <button
            onClick={() => {
              router.push('/collections')
              setIsOpen(false)
            }}
            className="block w-full text-left px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm font-medium uppercase tracking-wider text-[#1a1a1a] dark:text-white">Collections</span>
          </button>
          <button
            onClick={() => {
              router.push('/about')
              setIsOpen(false)
            }}
            className="block w-full text-left px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm font-medium uppercase tracking-wider text-[#1a1a1a] dark:text-white">About</span>
          </button>
        </div>

        {/* Theme toggle — pinned to bottom */}
        <div className="flex-shrink-0 border-t border-border/20 p-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-sm text-[#1a1a1a] dark:text-white">Toggle theme</span>
          </button>
        </div>
      </aside>
    </>
  )
}
