"use client"

import { Project } from "@/lib/api"
import { FeaturedCollectionCard } from "@/components/FeaturedCollectionCard"
import { SecondaryFeaturedCard } from "@/components/SecondaryFeaturedCard"

interface ProjectGridProps {
  projects: Project[]
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
    // Featured projects first, then by status
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    const order = { live: 0, upcoming: 1, ended: 2 }
    return order[a.status] - order[b.status]
  })

  const [featured, ...rest] = sorted

  return (
    <section
      id="projects"
      className="relative py-20 bg-background overflow-hidden"
      style={{
        backgroundImage: `url(/grid-bg.png)`,
        backgroundSize: "auto",
        backgroundPosition: "left",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">

        {/* Section heading */}
        <div className="mb-6 sm:mb-8 text-center sm:text-right">
          <h2
            className="uppercase tracking-widest text-foreground"
            style={{ fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif", fontWeight: 800, fontSize: "clamp(1.25rem, 4vw, 2.5rem)" }}
          >
            Featured Collections
          </h2>
        </div>

        {/* Featured wide card */}
        <div className="mb-8">
          <FeaturedCollectionCard project={featured} />
        </div>

        {/* Secondary collection grid */}
        {rest.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((project) => (
              <SecondaryFeaturedCard key={project.slug} project={project} />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
