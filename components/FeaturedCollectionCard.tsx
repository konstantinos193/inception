"use client"

import Link from "next/link"
import { Project } from "@/lib/api"
import { TaoIcon } from "@/components/tao-icon"
import { MediaRenderer } from "@/components/MediaRenderer"
import Image from "next/image"
import { useIsMobile } from "@/hooks/use-mobile"
import { FeaturedCollectionCardMobileNew } from "@/components/FeaturedCollectionCard-mobile-new"

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-green-500 text-white">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      LIVE
    </span>
  )
}

function UpcomingBadge() {
  return (
    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-white/10 text-white/70 border border-white/20 backdrop-blur-sm">
      UPCOMING
    </span>
  )
}

export function FeaturedCollectionCard({ project }: { project: Project }) {
  if (!project) return null

  const progress = project.supply > 0 ? Math.min(100, Math.round((project.minted / project.supply) * 100)) : 0
  const isMobile = useIsMobile()

  console.log('FeaturedCollectionCard - isMobile:', isMobile, 'project:', project.name)

  // Return mobile version for mobile devices
  if (isMobile) {
    console.log('Rendering mobile version')
    return <FeaturedCollectionCardMobileNew project={project} />
  }

  return (
    <Link href={`/projects/${project.slug}`} className="block group">
      <div className="w-full rounded-2xl overflow-hidden border border-white/10 relative bg-gray-900" style={{ aspectRatio: "16/6" }}>
        {/* Background media */}
        <MediaRenderer
          src={project.logoWide || project.logoSquare}
          alt={project.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          sizes="100vw"
          priority
          unoptimized
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex items-end p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="w-full flex flex-col gap-4 sm:gap-6">

            {/* Left: badges + name */}
            <div className="flex flex-col gap-3 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {project.status === "live" && <LiveBadge />}
                {project.status === "upcoming" && <UpcomingBadge />}
              </div>
              <h2
                className="font-bold leading-tight"
                style={{
                  fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif",
                  color: "#ffffff",
                  fontSize: "clamp(1.5rem, 5vw, 3rem)",
                }}
              >
                {project.name}
              </h2>
              <p className="text-sm text-white/70 leading-relaxed max-w-full sm:max-w-md line-clamp-2">
                {project.tagline}
              </p>
            </div>

            {/* Right: stats + CTA */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 text-xs text-white/60 uppercase tracking-wide bg-white/10 backdrop-blur-sm">
                  <TaoIcon className="text-white/60" size={10} />
                  {project.mintPrice} {project.currency}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 text-xs text-white/60 uppercase tracking-wide bg-white/10 backdrop-blur-sm">
                  {progress}% minted
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/20 text-xs text-white/60 uppercase tracking-wide bg-white/10 backdrop-blur-sm">
                  {project.participants.toLocaleString()} holders
                </span>
              </div>
              <button
                className="w-full sm:w-auto px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-90 whitespace-nowrap"
                style={{ backgroundColor: "var(--electric-blue)", borderRadius: "8px" }}
              >
                View Collection
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
