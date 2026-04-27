"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { fetchProjects, type Project } from "@/lib/api"
import { Loader2 } from "lucide-react"

function StatusBadge({ status }: { status: Project["status"] }) {
  const styles = {
    live:     "bg-green-500/20 text-green-400 border border-green-500/30",
    upcoming: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    ended:    "bg-gray-500/20 text-gray-400 border border-gray-500/30",
  }
  const labels = { live: "Live", upcoming: "Upcoming", ended: "Ended" }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

export default function CollectionsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Real-time updates for all projects
  useEffect(() => {
    const updateProjects = async () => {
      try {
        const updatedProjects = await fetchProjects()
        setProjects(updatedProjects)
      } catch (error) {
        console.error('Failed to update projects:', error)
      }
    }

    // Set up polling for real-time updates
    const interval = setInterval(updateProjects, 5000) // 5 seconds

    return () => clearInterval(interval)
  }, [])

  const filtered = projects.filter(p => selectedStatus === "all" || p.status === selectedStatus)

  const tabs = [
    { label: "All",      value: "all",      count: projects.length },
    { label: "Live",     value: "live",     count: projects.filter(p => p.status === "live").length },
    { label: "Upcoming", value: "upcoming", count: projects.filter(p => p.status === "upcoming").length },
    { label: "Ended",    value: "ended",    count: projects.filter(p => p.status === "ended").length },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Grid overlay */}
      <div
        className="fixed inset-0 z-0 opacity-[0.35] dark:opacity-[0.12]"
        style={{
          backgroundImage: "url('/grid-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <Navbar />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 pt-28 pb-20">

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-foreground/40 mb-4">
            Collections
          </p>
          <h1
            className="leading-none mb-4"
            style={{
              fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.5rem, 6vw, 3.5rem)",
            }}
          >
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4">
              <span style={{ color: "var(--electric-blue)" }}>DISCOVER</span>
              <span className="text-foreground">EXCLUSIVE</span>
              <span style={{ color: "var(--electric-blue)" }}>DROPS</span>
            </div>
          </h1>
          <p className="text-foreground/60 text-sm max-w-xl">
            Curated NFT collections launching on Bittensor EVM. Verified creators, audited contracts, and transparent minting.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-8 p-1 rounded-xl border border-border bg-card/30 backdrop-blur-sm overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className="px-3 py-2 rounded-lg text-xs sm:text-sm sm:px-5 font-semibold uppercase tracking-wider transition-all whitespace-nowrap"
              style={{
                color: selectedStatus === tab.value ? "var(--electric-blue)" : "text-foreground/60",
                background: selectedStatus === tab.value ? "color-mix(in srgb, var(--electric-blue) 10%, transparent)" : "transparent",
              }}
            >
              {tab.label}
              <span className="ml-1 sm:ml-2 text-xs opacity-60">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Gallery grid */}
        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--electric-blue)" }} />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(project => {
              const progress = Math.min(100, Math.round((project.minted / project.supply) * 100))
              return (
                <Link
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className="group block"
                >
                  {/* Card */}
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:border-white/20 transition-all duration-300">
                    {/* Image */}
                    <div className="relative aspect-square w-full overflow-hidden">
                      <Image
                        src={project.logoSquare}
                        alt={project.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        unoptimized
                      />
                      {/* Live pulse indicator */}
                      {project.status === "live" && (
                        <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full">
                          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="font-bold truncate"
                          style={{
                            fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif",
                            fontSize: "clamp(1rem, 2vw, 1.25rem)",
                            color: "var(--electric-blue)",
                          }}
                        >
                          {project.name}
                        </span>
                        <StatusBadge status={project.status} />
                      </div>
                      
                      <p className="text-xs text-foreground/50 mb-4 line-clamp-2">
                        {project.tagline || project.description}
                      </p>

                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="text-foreground/70">{project.mintPrice} {project.currency}</span>
                        <span className="text-foreground/70">{progress}% minted</span>
                      </div>

                      <div className="w-full bg-white/10 rounded-full h-1">
                        <div
                          className="h-1 rounded-full transition-all duration-500"
                          style={{
                            width: `${progress}%`,
                            background: "var(--electric-blue)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-32 text-foreground/40">
            <p className="text-lg font-medium mb-2">No collections found</p>
            <p className="text-sm">Check back soon for new drops</p>
          </div>
        )}

      </div>
    </div>
  )
}
