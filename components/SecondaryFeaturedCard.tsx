"use client"

import Link from "next/link"
import Image from "next/image"
import { Project } from "@/lib/api"
import { TaoIcon } from "@/components/tao-icon"

export function SecondaryFeaturedCard({ project }: { project: Project }) {
  if (!project) return null

  const progress = project.supply > 0 ? Math.min(100, Math.round((project.minted / project.supply) * 100)) : 0

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex items-center gap-4 px-4 py-4 rounded-xl border border-border hover:border-white/20 bg-card/30 backdrop-blur-sm hover:bg-card/60 transition-all"
    >
      {/* Square thumbnail */}
      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white/5 shrink-0">
        <Image
          src={project.logoSquare}
          alt={project.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="56px"
          unoptimized
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-sm font-bold truncate"
            style={{ fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif", color: "var(--electric-blue)" }}
          >
            {project.name}
          </span>
          {project.status === "live" && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-green-500/20 text-green-400 shrink-0">
              <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
              LIVE
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{project.tagline}</p>
      </div>

      {/* Stats */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center gap-1 text-sm font-medium text-foreground">
          <TaoIcon className="text-foreground" />
          <span>{project.mintPrice} {project.currency}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{progress}% minted</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{project.participants.toLocaleString()} holders</span>
        </div>
      </div>
    </Link>
  )
}
