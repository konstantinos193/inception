import sharp from 'sharp'
import path from 'path'

/**
 * Extracts the dominant color from an image
 * @param imagePath - Path to the image file (relative to public folder or absolute)
 * @returns Hex color string (e.g., "#ec4899") or fallback color
 */
export async function extractDominantColor(imagePath: string): Promise<string> {
  try {
    // Handle relative paths - convert to absolute path from public folder
    let fullPath = imagePath
    
    if (imagePath.startsWith('/')) {
      // Remove leading slash and resolve from public folder
      const publicPath = path.join(process.cwd(), 'public', imagePath.slice(1))
      fullPath = publicPath
    }

    // Use sharp to extract dominant color
    const { dominant } = await sharp(fullPath)
      .resize(100, 100, { fit: 'inside' }) // Resize for performance
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        // Simple dominant color extraction - average all pixels
        let r = 0, g = 0, b = 0
        const pixelCount = data.length / 3
        
        for (let i = 0; i < data.length; i += 3) {
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
        }
        
        r = Math.round(r / pixelCount)
        g = Math.round(g / pixelCount)
        b = Math.round(b / pixelCount)
        
        return { dominant: { r, g, b } }
      })

    // Convert to hex
    const hex = `#${dominant.r.toString(16).padStart(2, '0')}${dominant.g.toString(16).padStart(2, '0')}${dominant.b.toString(16).padStart(2, '0')}`
    return hex
  } catch (error) {
    console.error('Error extracting dominant color:', error)
    // Fallback to a default color
    return '#000000'
  }
}

/**
 * Extracts dominant color from image URL (for use in metadata generation)
 * This is a synchronous version that uses a cached/default color during build
 * and can be updated later with the actual color
 */
export function getDominantColorSync(imagePath: string, fallback: string = '#000000'): string {
  // For now, return fallback - actual extraction happens asynchronously
  // In production, you might want to pre-compute and cache these colors
  return fallback
}
