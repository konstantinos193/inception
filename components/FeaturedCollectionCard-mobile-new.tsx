"use client"

import Link from "next/link"
import { Project } from "@/lib/api"
import { TaoIcon } from "@/components/tao-icon"
import { MediaRenderer } from "@/components/MediaRenderer"

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

export function FeaturedCollectionCardMobileNew({ project }: { project: Project }) {
  console.log('Mobile component called with project:', project)
  if (!project) return null

  const progress = project.supply > 0 ? Math.min(100, Math.round((project.minted / project.supply) * 100)) : 0

  return (
    <Link href={`/projects/${project.slug}`} className="block group">
      <div className="w-full rounded-2xl overflow-hidden border border-white/10 relative bg-gray-900">
        {/* Background media */}
        <div style={{ aspectRatio: "4/5" }} className="relative w-full">
          <MediaRenderer
            src={project.logoWide || project.logoSquare}
            alt={project.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            sizes="100vw"
            priority
            unoptimized
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          {/* Top section */}
          <div className="flex justify-between items-start">
            <div className="flex flex-wrap items-center gap-2">
              {project.status === "live" && <LiveBadge />}
              {project.status === "upcoming" && <UpcomingBadge />}
            </div>
          </div>

          {/* Bottom section */}
          <div className="space-y-3">
            {/* Name */}
            <h2
              className="font-bold leading-tight"
              style={{
                fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif",
                color: "#ffffff",
                fontSize: "clamp(1.5rem, 6vw, 2.5rem)",
              }}
            >
              {project.name}
            </h2>

            {/* Tagline */}
            <p className="text-sm text-white/80 leading-relaxed line-clamp-2">
              {project.tagline}
            </p>

            {/* Stats */}
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

            {/* CTA Button */}
            <button
              className="w-full px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-90 whitespace-nowrap"
              style={{ backgroundColor: "var(--electric-blue)", borderRadius: "8px" }}
            >
              View Collection
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
