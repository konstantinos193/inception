"use client"

import Link from "next/link"
import Image from "next/image"
import { ExternalLink, Users, TrendingUp, Clock, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Project } from "@/lib/api"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const progress = (project.minted / project.supply) * 100
  const daysLeft = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  
  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "live":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "upcoming":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "ended":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusText = (status: Project["status"]) => {
    switch (status) {
      case "live":
        return "Live Now"
      case "upcoming":
        return "Upcoming"
      case "ended":
        return "Ended"
      default:
        return status
    }
  }

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 group">
      {/* Minimal Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Small Logo */}
          <div className="relative w-10 h-10 rounded-lg overflow-hidden">
            <Image
              src={project.logoSquare}
              alt={`${project.name} logo`}
              fill
              className="object-cover"
              sizes="40px"
              unoptimized
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white group-hover:text-purple-400 transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-gray-400">{project.category}</p>
          </div>
        </div>
        <Badge className={getStatusColor(project.status)}>
          {getStatusText(project.status)}
        </Badge>
      </div>

      {/* Minimal Description */}
      <p className="text-sm text-gray-300 mb-4 line-clamp-2">
        {project.tagline}
      </p>

      {/* Key Metrics */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-gray-400">Minted</div>
          <div className="text-sm font-medium text-white">
            {project.minted.toLocaleString()} / {project.supply.toLocaleString()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Price</div>
          <div className="text-sm font-medium text-white">
            {project.mintPrice} {project.currency}
          </div>
        </div>
      </div>

      {/* Simple Progress */}
      <div className="mb-4">
        <div className="w-full bg-white/10 rounded-full h-1">
          <div 
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-1 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{project.minted} / {project.supply} minted</span>
          <span>{project.participants.toLocaleString()} holders</span>
        </div>
      </div>

      {/* Simple Actions */}
      <div className="flex gap-2">
        <Link href={`/projects/${project.slug}`} className="flex-1">
          <Button className="w-full bg-white text-black hover:bg-gray-100 text-sm font-medium">
            View
          </Button>
        </Link>
        {project.website && (
          <Button variant="outline" size="sm" asChild>
            <a
              href={project.website}
              target="_blank"
              rel="noopener noreferrer"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}
