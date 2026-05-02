export interface MintPhase {
  name: string
  status: "completed" | "active" | "upcoming"
  price: number
  maxPerWallet: number
  supply: number
  minted: number
  startDate: string
  endDate: string
}

export interface SampleNFT {
  _id: string
  tokenId: number
  name: string
  image: string
  rarity: string
  mintedBy: string
  mintedAt: string
  animationUrl?: string
  rarityTier?: string
  rarityRank?: number
  traits?: Array<{ trait_type: string; value: string }>
  contractAddress?: string
  chainId?: number
  explorerUrl?: string
  currentOwner?: string
}

export interface SubnetInfo {
  id: number
  name: string
  alphaToken: string
  alphaPrice: number
  miners: number
  validators: number
  dailyEmissions: number
}

export interface Project {
  slug: string
  name: string
  tagline: string
  description: string
  category: string
  chain: string
  status: "live" | "upcoming" | "ended"
  minted: number
  supply: number
  currency: string
  participants: number
  mintPrice: number
  maxPerWallet: number
  startDate: string
  endDate: string
  twitter?: string
  discord?: string
  website?: string
  gradient: string
  logoColors: [string, string]
  highlights: string[]
  artist: string
  rarity: string[]
  utilities: string[]
  logoWide: string // 16:9 aspect ratio
  logoSquare: string // 1:1 aspect ratio
  phases: MintPhase[]
  sampleNFTs: SampleNFT[]
  totalTaoRaised?: number
  subnet: SubnetInfo
}

export const projects: Project[] = [
]

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}