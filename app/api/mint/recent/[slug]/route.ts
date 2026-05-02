import { NextRequest, NextResponse } from 'next/server'
import { fetchProject } from '@/lib/api'

interface SampleNFT {
  _id: string
  tokenId: number
  name: string
  image: string
  rarity: string
  mintedBy: string
  mintedAt: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    // Fetch project data to get sample NFTs
    const project = await fetchProject(slug)
    
    if (project && project.sampleNFTs && project.sampleNFTs.length > 0) {
      // Transform sampleNFTs to match the expected format
      const nfts: SampleNFT[] = project.sampleNFTs.map((nft: any, index: number) => ({
        _id: nft.id?.toString() || `nft-${index}`,
        tokenId: nft.id || index,
        name: nft.name || `NFT #${index + 1}`,
        image: nft.image || '',
        rarity: nft.rarity || 'Common',
        mintedBy: nft.mintedBy || '0x0000000000000000000000000000000000000000',
        mintedAt: nft.mintedAt || new Date().toISOString()
      }))
      return NextResponse.json(nfts)
    }

    // TODO: Implement proper backend endpoint to fetch actual on-chain minted NFTs
    // For now, return empty array - the backend API endpoint /api/mint/recent/${slug} needs to be implemented
    console.log(`No sampleNFTs found for ${slug}, backend endpoint /api/mint/recent/${slug} needs implementation`)
    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching recently minted NFTs:', error)
    return NextResponse.json([])
  }
}
