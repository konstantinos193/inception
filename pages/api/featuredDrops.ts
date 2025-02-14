import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from('featured_drops')
    .select('*');

  if (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: error.message });
  }

  console.log('Fetched data:', data);
  return res.status(200).json(data);
}

const channels = supabase.channel('custom-all-channel')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'featured_drops' }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe(); 