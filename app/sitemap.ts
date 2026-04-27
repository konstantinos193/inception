import type { MetadataRoute } from "next"
import { fetchProjects } from "@/lib/api"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://elevateart.xyz"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const projects = await fetchProjects()

    const collectionEntries: MetadataRoute.Sitemap = projects.map((project) => ({
      url:             `${APP_URL}/collection/${project.slug}`,
      lastModified:    new Date(project.startDate || Date.now()),
      changeFrequency: project.status === "live" ? "daily" : "weekly",
      priority:        project.status === "live" ? 0.9 : 0.7,
    }))

    return [
      {
        url:             `${APP_URL}`,
        lastModified:    new Date(),
        changeFrequency: "daily",
        priority:        1.0,
      },
      {
        url:             `${APP_URL}/collections`,
        lastModified:    new Date(),
        changeFrequency: "weekly",
        priority:        0.8,
      },
      {
        url:             `${APP_URL}/about`,
        lastModified:    new Date(),
        changeFrequency: "monthly",
        priority:        0.6,
      },
      ...collectionEntries,
    ]
  } catch (error) {
    console.error("Failed to generate sitemap:", error)
    
    // Fallback to static sitemap
    return [
      {
        url:             `${APP_URL}`,
        lastModified:    new Date(),
        changeFrequency: "daily",
        priority:        1.0,
      },
      {
        url:             `${APP_URL}/collections`,
        lastModified:    new Date(),
        changeFrequency: "weekly",
        priority:        0.8,
      },
      {
        url:             `${APP_URL}/about`,
        lastModified:    new Date(),
        changeFrequency: "monthly",
        priority:        0.6,
      },
    ]
  }
}
