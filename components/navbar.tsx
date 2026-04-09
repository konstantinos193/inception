"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import dynamic from "next/dynamic"

const ConnectButton = dynamic(
  () => import("@/components/connect-button").then((m) => m.ConnectButton),
  { ssr: false }
)

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.webp"
              alt="Elevate"
              width={120}
              height={120}
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="flex items-center gap-8">
              <Link href="/collections" className="text-gray-400 hover:text-white transition-colors text-sm">
                Collections
              </Link>
              <ConnectButton />
            </div>
          )}

          {/* Mobile menu button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-gray-300"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          )}
        </div>

        {/* Mobile Navigation */}
        {isMobile && isOpen && (
          <div className="py-4 space-y-4 border-t border-white/10">
            <Link href="/collections" className="block text-gray-400 hover:text-white text-sm">
              Collections
            </Link>
            <ConnectButton />
          </div>
        )}
      </div>
    </nav>
  )
}
