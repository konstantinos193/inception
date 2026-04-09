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
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-light text-white mb-2">Collections</h1>
          <p className="text-gray-500 text-sm">Discover and mint exclusive NFT collections on Bittensor</p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedStatus === tab.value
                  ? "bg-white text-black"
                  : "text-gray-500 hover:text-white transition-colors"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs ${selectedStatus === tab.value ? "text-gray-600" : "text-gray-600"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Gallery grid */}
        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(project => {
              const progress = Math.min(100, Math.round((project.minted / project.supply) * 100))
              return (
                <Link
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className="group block"
                >
                  {/* Image */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white/5 mb-3">
                    <Image
                      src={project.logoSquare}
                      alt={project.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {/* Live pulse indicator */}
                    {project.status === "live" && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full">
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="px-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white truncate group-hover:text-gray-300 transition-colors">
                        {project.name}
                      </span>
                      <StatusBadge status={project.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{project.mintPrice} {project.currency}</span>
                      <span>{progress}% minted</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-0.5 mt-2">
                      <div className="bg-white/50 h-0.5 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-32 text-gray-600">No collections found</div>
        )}

      </div>
    </div>
  )
}
