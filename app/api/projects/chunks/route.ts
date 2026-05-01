import { NextRequest, NextResponse } from 'next/server';

// Local test endpoint for chunks simulation
// This endpoint returns paginated chunks of project data for load testing

interface ChunkResponse {
  chunkId: number;
  totalChunks: number;
  data: any[];
  timestamp: string;
  simulationInfo: {
    requestId: string;
    serverTime: number;
  };
}

// Simulated project data generator
function generateProjectData(count: number): any[] {
  const projects = [];
  for (let i = 0; i < count; i++) {
    projects.push({
      _id: `project-${Math.random().toString(36).substr(2, 9)}`,
      slug: `test-project-${i}`,
      name: `Test Project ${i}`,
      tagline: `A test project for simulation ${i}`,
      description: `This is a simulated project for load testing the chunks endpoint`,
      category: ['Art', 'Gaming', 'Utility', 'DeFi'][Math.floor(Math.random() * 4)],
      chain: 'Bittensor',
      status: ['live', 'upcoming', 'ended'][Math.floor(Math.random() * 3)],
      minted: Math.floor(Math.random() * 10000),
      supply: 10000,
      currency: 'TAO',
      participants: Math.floor(Math.random() * 5000),
      mintPrice: (Math.random() * 20).toFixed(2),
      maxPerWallet: Math.floor(Math.random() * 10) + 1,
      gradient: 'from-blue-500 to-purple-600',
      logoColors: ['#3B82F6', '#8B5CF6'],
      artist: `Artist ${i}`,
      rarity: ['Common', 'Rare', 'Legendary'][Math.floor(Math.random() * 3)],
      featured: Math.random() > 0.8,
      subnet: {
        id: Math.floor(Math.random() * 100),
        name: `Subnet ${i}`,
        alphaToken: 'TST',
        alphaPrice: (Math.random() * 5).toFixed(2),
        miners: Math.floor(Math.random() * 200),
        validators: Math.floor(Math.random() * 100),
        dailyEmissions: (Math.random() * 2000).toFixed(2),
      },
      phases: [
        {
          _id: `phase-${i}-1`,
          name: 'Allowlist',
          status: 'completed',
          price: 8.0,
          maxPerWallet: 3,
          supply: 2000,
          minted: 2000,
        },
        {
          _id: `phase-${i}-2`,
          name: 'Public',
          status: 'active',
          price: 10.0,
          maxPerWallet: 5,
          supply: 8000,
          minted: Math.floor(Math.random() * 5000),
        },
      ],
      sampleNFTs: Array.from({ length: 8 }, (_, j) => ({
        _id: `nft-${i}-${j}`,
        tokenId: j + 1,
        name: `Test NFT #${j + 1}`,
        image: `https://via.placeholder.com/400?text=NFT+${j + 1}`,
        rarity: j < 2 ? 'Legendary' : j < 4 ? 'Rare' : 'Common',
        mintedBy: `0x${Math.random().toString(16).substr(2, 40)}`,
        mintedAt: new Date().toISOString(),
      })),
    });
  }
  return projects;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const chunkId = parseInt(searchParams.get('chunkId') || '0');
  const chunkSize = parseInt(searchParams.get('chunkSize') || '100');
  const totalChunks = parseInt(searchParams.get('totalChunks') || '100');
  
  // Generate unique request ID for tracking
  const requestId = Math.random().toString(36).substr(2, 9);
  
  // Generate chunk data
  const data = generateProjectData(chunkSize);
  
  const response: ChunkResponse = {
    chunkId,
    totalChunks,
    data,
    timestamp: new Date().toISOString(),
    simulationInfo: {
      requestId,
      serverTime: Date.now(),
    },
  };
  
  // Add performance headers
  const headers = new Headers({
    'Content-Type': 'application/json',
    'X-Request-ID': requestId,
    'X-Chunk-Id': chunkId.toString(),
    'X-Total-Chunks': totalChunks.toString(),
    'X-Chunk-Size': chunkSize.toString(),
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  });
  
  return NextResponse.json(response, { headers });
}

// Optional: POST endpoint for batch processing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, payload } = body;
    
    if (action === 'batch_simulate') {
      const { count = 1000 } = payload;
      const data = generateProjectData(count);
      
      return NextResponse.json({
        success: true,
        count,
        timestamp: new Date().toISOString(),
        data,
      });
    }
    
    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
