"use client"

import Link from "next/link"
import Image from "next/image"
import { Project } from "@/lib/api"

interface ProjectGridProps {
  projects: Project[]
}

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

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <section id="projects" className="py-20 bg-black">
        <p className="text-center text-gray-500">No collections yet.</p>
      </section>
    )
  }

  const sorted = [...projects].sort((a, b) => {
    const order = { live: 0, upcoming: 1, ended: 2 }
    return order[a.status] - order[b.status]
  })

  const [featured, ...rest] = sorted
  const progress = Math.min(100, Math.round((featured.minted / featured.supply) * 100))

  return (
    <section id="projects" className="py-20 bg-black">
      <div className="max-w-5xl mx-auto px-6">

        {/* Section label */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-6 h-px bg-white/20" />
          <span className="text-xs text-gray-500 uppercase tracking-widest">Featured Drop</span>
        </div>

        {/* Two-column layout: big image left, list right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

          {/* Left — featured 1:1 */}
          <Link href={`/projects/${featured.slug}`} className="group block">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors duration-300">
              <Image
                src={featured.logoSquare}
                alt={featured.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5">
                <StatusBadge status={featured.status} />
                <h2 className="text-xl font-medium text-white mt-2">{featured.name}</h2>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{featured.tagline}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-sm text-white font-light">{featured.mintPrice} {featured.currency}</div>
                  <div className="text-xs text-gray-500">{progress}% minted</div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-0.5 mt-2">
                  <div className="bg-white h-0.5 rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </Link>

          {/* Right — list of other drops */}
          {rest.length > 0 && (
            <div className="flex flex-col gap-3">
              {rest.map((project) => {
                const p = Math.min(100, Math.round((project.minted / project.supply) * 100))
                return (
                  <Link
                    key={project.slug}
                    href={`/projects/${project.slug}`}
                    className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-white/5">
                      <Image
                        src={project.logoSquare}
                        alt={project.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white truncate group-hover:text-gray-300 transition-colors">
                          {project.name}
                        </span>
                        <StatusBadge status={project.status} />
                      </div>
                      <div className="text-xs text-gray-500 truncate mb-2">{project.tagline}</div>
                      <div className="w-full bg-white/10 rounded-full h-0.5">
                        <div className="bg-white/40 h-0.5 rounded-full" style={{ width: `${p}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm text-white font-light">{project.mintPrice} {project.currency}</div>
                      <div className="text-xs text-gray-500 mt-1">{p}%</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
