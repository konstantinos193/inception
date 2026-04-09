import type { MetadataRoute } from "next"
import { fetchProjects } from "@/lib/api"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await fetchProjects().catch(() => [])

  const collectionEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url:             `${APP_URL}/projects/${project.slug}`,
    lastModified:    new Date(),
    changeFrequency: project.status === "live" ? "hourly" : "weekly",
    priority:        project.status === "live" ? 1.0 : 0.8,
  }))

  return [
    {
      url:             `${APP_URL}`,
      lastModified:    new Date(),
      changeFrequency: "hourly",
      priority:        1.0,
    },
    {
      url:             `${APP_URL}/collections`,
      lastModified:    new Date(),
      changeFrequency: "hourly",
      priority:        0.9,
    },
    ...collectionEntries,
  ]
}
