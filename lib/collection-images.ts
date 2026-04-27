/**
 * Standard collection image paths.
 * All collections follow: /collections/{slug}/banner.jpg  (wide banner, ~1200×400)
 *                         /collections/{slug}/pfp.jpg     (square logo, ~400×400)
 *
 * If a project record holds an absolute URL (e.g. an externally hosted image),
 * that URL is returned as-is so legacy/external collections still work.
 */
export function collectionBanner(slugOrStoredUrl: string): string {
  if (!slugOrStoredUrl) return "/placeholder-banner.jpg"
  if (slugOrStoredUrl.startsWith("http") || slugOrStoredUrl.startsWith("//")) return slugOrStoredUrl
  if (slugOrStoredUrl.startsWith("/")) return slugOrStoredUrl
  return `/collections/${slugOrStoredUrl}/banner.jpg`
}

export function collectionSquare(slugOrStoredUrl: string): string {
  if (!slugOrStoredUrl) return "/placeholder-pfp.jpg"
  if (slugOrStoredUrl.startsWith("http") || slugOrStoredUrl.startsWith("//")) return slugOrStoredUrl
  if (slugOrStoredUrl.startsWith("/")) return slugOrStoredUrl
  return `/collections/${slugOrStoredUrl}/pfp.jpg`
}

/**
 * Sizes string for each display context.
 * Pass to next/image `sizes` prop so the browser fetches the right variant.
 */
export const IMAGE_SIZES = {
  /** Full-width hero banner */
  banner: "100vw",
  /** Square logo in the sticky mint sidebar (360px wide column) */
  sidebarSquare: "360px",
  /** Small identity thumbnail in the mint card header */
  mintThumb: "48px",
  /** NFT gallery card — 3-up on ≥sm, 2-up below */
  nftCard: "(min-width: 640px) 33vw, 50vw",
  /** Collection grid card — 3-up on ≥lg, 2-up on ≥sm, 1-up below */
  collectionCard: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}
