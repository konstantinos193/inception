import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    const collectionId = searchParams.get('collectionId');

    if (!wallet || !collectionId) {
      return NextResponse.json(
        { error: 'Missing wallet or collectionId' },
        { status: 400 }
      );
    }

    // Get minted NFTs count per phase for this wallet and collection
    const { data, error } = await supabase
      .from('minted_nfts')
      .select('phase_id')
      .eq('wallet_address', wallet.toLowerCase())
      .eq('collection_id', collectionId);

    if (error) {
      console.error('Error fetching minted NFTs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch minted NFTs' },
        { status: 500 }
      );
    }

    // Count NFTs per phase
    const mintedCounts: { [key: string]: number } = {};
    data?.forEach(nft => {
      mintedCounts[nft.phase_id] = (mintedCounts[nft.phase_id] || 0) + 1;
    });

    return NextResponse.json({ mintedCounts });
  } catch (error) {
    console.error('Error in minted-nfts API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wallet, collectionId, quantity, phaseId } = body;

    if (!wallet || !collectionId || !quantity || !phaseId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert new minted NFTs with phase_id
    const { error } = await supabase
      .from('minted_nfts')
      .insert(
        Array.from({ length: quantity }, () => ({
          wallet_address: wallet.toLowerCase(),
          collection_id: collectionId,
          phase_id: phaseId,
          minted_at: new Date().toISOString(),
        }))
      );

    if (error) {
      console.error('Error inserting minted NFTs:', error);
      return NextResponse.json(
        { error: 'Failed to update minted NFTs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in minted-nfts API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 