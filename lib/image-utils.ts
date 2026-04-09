/**
 * Image utility functions for handling local images
 */

/**
 * Converts a backend image path to a local public folder path
 * @param imagePath - The image path from the backend (e.g., /collections/1000-chunks/pfp.jpg)
 * @returns The local path for the image (e.g., /collections/1000-chunks/pfp.jpg)
 */
export function getImageUrl(imagePath: string): string {
  if (!imagePath) return "";
  
  // If it's already a full URL (starts with http), extract the path part
  if (imagePath.startsWith("http")) {
    try {
      const url = new URL(imagePath);
      return url.pathname;
    } catch {
      // If URL parsing fails, return as-is
      return imagePath;
    }
  }
  
  // If it starts with a slash, it's already a relative path - return as-is
  if (imagePath.startsWith("/")) {
    return imagePath;
  }
  
  // Otherwise, ensure it starts with a slash
  return `/${imagePath}`;
}

/**
 * Process a project object to convert all image paths to local paths
 * @param project - The project object with image paths
 * @returns The project object with all image paths converted to local paths
 */
export function processProjectImages(project: any): any {
  if (!project) return project;
  
  return {
    ...project,
    logoWide: getImageUrl(project.logoWide),
    logoSquare: getImageUrl(project.logoSquare),
    sampleNFTs: project.sampleNFTs?.map((nft: any) => ({
      ...nft,
      image: getImageUrl(nft.image)
    })) || []
  };
}
