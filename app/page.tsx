"use client"

import { useState, useEffect } from "react"
import { Hero } from "@/components/hero"
import { ProjectGrid } from "@/components/project-grid"
import { fetchProjects, type Project } from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="min-h-screen bg-black text-white">
      <Hero />
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--electric-blue)" }} />
        </div>
      ) : (
        <ProjectGrid projects={projects} />
      )}
    </div>
  )
}
