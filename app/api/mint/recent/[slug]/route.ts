import { NextRequest, NextResponse } from 'next/server'

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
    
    // Fetch real NFT data from backend's unified endpoint
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    
    const response = await fetch(`${API_URL}/api/unified`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'collections.nfts',
        slug: slug,
        limit: 50,
        offset: 0,
        sortBy: 'token_id',
        sortOrder: 'DESC'
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch NFTs from backend')
    }
    
    const result = await response.json()
    
    if (!result.success || !result.data) {
      return NextResponse.json([])
    }
    
    // Transform backend data to frontend format
    const nfts: SampleNFT[] = result.data.map((nft: any) => ({
      _id: nft._id || `${nft.tokenId}`,
      tokenId: nft.tokenId,
      name: nft.name,
      image: nft.image,
      rarity: nft.rarityTier || (nft.rarityRank && nft.rarityRank > 0 ? `Rank #${nft.rarityRank}` : 'Common'),
      mintedBy: nft.mintedBy || nft.owner || '0x0000000000000000000000000000000000000000',
      mintedAt: nft.mintedAt || nft.createdAt || new Date().toISOString(),
      // Additional fields for modal
      animationUrl: nft.animationUrl,
      rarityTier: nft.rarityTier,
      rarityRank: nft.rarityRank,
      traits: nft.traits,
      contractAddress: nft.contractAddress,
      chainId: nft.chainId,
      explorerUrl: nft.explorerUrl,
      currentOwner: nft.currentOwner
    }))
    
    return NextResponse.json(nfts)
  } catch (error) {
    console.error('Error fetching recently minted NFTs:', error)
    return NextResponse.json([])
  }
}
