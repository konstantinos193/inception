import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req, res) {
  const { wallet, collectionId, quantity } = req.body;

  console.log('Received request:', { wallet, collectionId, quantity });

  if (!wallet || !collectionId || !quantity) {
    console.error('Missing required fields');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Insert new minted NFTs into Supabase
    const { error } = await supabase
      .from('minted_nfts')
      .insert(
        Array.from({ length: quantity }, () => ({
          wallet_address: wallet,
          collection_id: collectionId,
          minted_at: new Date().toISOString(),
        }))
      );

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Minted NFTs updated in Supabase');
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating minted NFTs:', error);
    return res.status(500).json({ error: 'Failed to update minted NFTs', details: error.message });
  }
} 