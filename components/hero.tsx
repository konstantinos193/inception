"use client"

import { useState, useEffect } from "react"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { fetchStats, type PlatformStats } from "@/lib/api"
import { useDiscordInvite } from "@/hooks/useDiscordInvite"

function formatNum(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K"
  return n.toString()
}

export function Hero() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const { inviteUrl, isLoading } = useDiscordInvite()

  useEffect(() => {
    fetchStats().then(setStats).catch(console.error)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-black">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        
        {/* Big watermark logos */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] opacity-[0.03]">
          <Image src="/logo.webp" alt="" fill className="object-contain" sizes="500px" />
        </div>
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] opacity-[0.03]">
          <Image src="/logo.webp" alt="" fill className="object-contain" sizes="500px" />
        </div>
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Hero Logo — og-image is 16:9 and already has brand + tagline */}
        <div className="relative w-full max-w-2xl mx-auto aspect-video mb-12">
          <Image
            src="/og-image.webp"
            alt="Elevate — Launch What's Next"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        </div>

        {/* Sub-tagline */}
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-xl mx-auto">
          Premium NFT Launchpad for Digital Artists and Collectors
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/collections">
            <Button 
              size="lg" 
              className="bg-white text-black hover:bg-gray-100 px-8 py-3 text-base font-medium"
            >
              Explore Collections
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <a 
            href={inviteUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            title={isLoading ? "Loading fresh invite..." : "Launch Your NFT"}
          >
            <Button
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-3 text-base font-medium"
            >
              Launch Your NFT
            </Button>
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-20">
          <div className="text-center">
            <div className="text-3xl font-light text-white">
              {stats ? formatNum(stats.totalMinted) : "—"}
            </div>
            <div className="text-gray-400 text-sm mt-1">NFTs Minted</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-white">
              {stats ? stats.activeDrops : "—"}
            </div>
            <div className="text-gray-400 text-sm mt-1">Active Drops</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-white">
              {stats ? formatNum(stats.collectors) : "—"}
            </div>
            <div className="text-gray-400 text-sm mt-1">Collectors</div>
          </div>
        </div>
      </div>
    </section>
  )
}
