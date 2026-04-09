import { fetchProject } from "@/lib/api"
import { ProjectDetail } from "@/components/project-detail"
import type { Metadata } from "next"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

function getStatusLabel(status: string): string {
  switch (status) {
    case "live":     return "Minting Now"
    case "upcoming": return "Dropping Soon"
    case "ended":    return "Collection"
    default:         return "Elevate"
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const project = await fetchProject(slug)

  if (!project) {
    return { title: "Not Found — Elevate" }
  }

  const favicon  = `${APP_URL}${project.logoSquare}`
  const ogImage  = project.logoWide
    ? `${APP_URL}${project.logoWide}`
    : favicon

  const title       = `${project.name} — ${getStatusLabel(project.status)}`
  const description = project.tagline || project.description

  return {
    title,
    description,
    icons: {
      icon:     favicon,
      shortcut: favicon,
      apple:    favicon,
    },
    openGraph: {
      type:        "website",
      title,
      description,
      siteName:    "Elevate",
      images: [{ url: ogImage, width: 1200, height: 630, alt: project.name }],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      [ogImage],
    },
  }
}

export default function ProjectPage() {
  return <ProjectDetail />
}
