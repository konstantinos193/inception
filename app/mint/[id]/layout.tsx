import { createClient } from '@supabase/supabase-js'
import { Metadata } from 'next'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function getCollectionData(id: string) {
  try {
    // Get collection data from nft_collections table
    const { data: collection, error: collectionError } = await supabase
      .from('nft_collections')
      .select('name, description, image')
      .eq('id', id)
      .single()

    if (collectionError) {
      console.error('Error fetching collection:', collectionError)
      return null
    }

    if (collection) {
      return {
        name: collection.name,
        description: collection.description || 'Mint NFTs on ApeChain',
        image: collection.image
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching collection:', error)
    return null
  }
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const collection = await getCollectionData(params.id)
  
  if (!collection) {
    return {
      title: 'Inception - Where Dreams Become Digital Reality',
      description: 'Mint NFTs on ApeChain',
      openGraph: {
        title: 'Inception - Where Dreams Become Digital Reality',
        description: 'Mint NFTs on ApeChain',
        images: ['/og-image.jpg'],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Inception - Where Dreams Become Digital Reality',
        description: 'Mint NFTs on ApeChain',
        images: ['/og-image.jpg'],
      },
    }
  }

  return {
    title: `${collection.name} | Inception`,
    description: collection.description,
    openGraph: {
      title: `${collection.name} | Inception`,
      description: collection.description,
      images: [collection.image],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${collection.name} | Inception`,
      description: collection.description,
      images: [collection.image],
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
} 