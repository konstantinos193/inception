import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req, res) {
  const { wallet, collectionId } = req.query;

  console.log('Received request:', { wallet, collectionId });

  if (!wallet || !collectionId) {
    console.error('Missing wallet or collectionId');
    return res.status(400).json({ error: 'Missing wallet or collectionId' });
  }

  try {
    console.log('Querying Supabase for minted NFTs...');
    const { count, error } = await supabase
      .from('minted_nfts')
      .select('*', { count: 'exact', head: true })
      .eq('wallet_address', wallet)
      .eq('collection_id', collectionId);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Minted NFTs count:', count);
    return res.status(200).json({ mintedCount: count || 0 });
  } catch (error) {
    console.error('Error fetching minted NFTs:', error);
    return res.status(500).json({ error: 'Failed to fetch minted NFTs' });
  }
} 