import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const collectionId = searchParams.get('collectionId')

    if (!collectionId) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 })
    }

    // First, let's check if the table exists and log some debug info
    console.log('Fetching from nft_collections table for id:', collectionId)
    
    const { data, error } = await supabase
      .from('nft_collections')  // Make sure this matches exactly with your table name
      .select('total_minted')
      .eq('id', collectionId)
      .single()

    if (error) {
      // Log the full error for debugging
      console.error('Full Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log the data we got back
    console.log('Data received:', data)
    
    return NextResponse.json({ totalMinted: data?.total_minted || 0 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { collectionId, newTotal } = body

    if (!collectionId || typeof newTotal !== 'number') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { error } = await supabase
      .from('nft_collections')  // Make sure this matches exactly with your table name
      .update({ total_minted: newTotal })
      .eq('id', collectionId)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 