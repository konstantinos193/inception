import { fetchProject } from "@/lib/api"
import { ProjectDetail } from "@/components/project-detail"
import type { Metadata } from "next"
import { getCollectionTheme } from "@/lib/collection-theme"
import { extractDominantColor } from "@/lib/color-extraction"

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
  const pfpImage = `${APP_URL}${project.logoSquare}`

  const title       = `${project.name} — ${getStatusLabel(project.status)}`
  const description = project.tagline || project.description
  
  // Extract dominant color from banner image for theme-color
  let themeColor = '#000000'
  if (project.logoWide) {
    try {
      themeColor = await extractDominantColor(project.logoWide)
    } catch (error) {
      console.error('Failed to extract dominant color, using fallback:', error)
      // Fallback to collection theme color
      const theme = getCollectionTheme(slug)
      themeColor = theme.primary
    }
  } else {
    // Fallback to collection theme color
    const theme = getCollectionTheme(slug)
    themeColor = theme.primary
  }

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
      images: [
        { url: ogImage, width: 1200, height: 630, alt: project.name },
        { url: pfpImage, width: 512, height: 512, alt: `${project.name} icon` },
      ],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      [ogImage],
    },
    other: {
      'theme-color': themeColor,
    },
  }
}

export default function ProjectPage() {
  return <ProjectDetail />
}
