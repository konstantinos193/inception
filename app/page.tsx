"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
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

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : (
        <ProjectGrid projects={projects} />
      )}
    </div>
  )
}
