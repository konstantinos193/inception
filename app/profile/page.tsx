"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FaEdit } from "react-icons/fa"
import DreamLayers from "@/components/dream-layers"
import EditProfileModal from "@/components/edit-profile-modal"
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'react-hot-toast'
import { useProfile } from '@/context/ProfileContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

type Profile = {
  address: string
  username: string
  bio: string
  profile_picture: string
}

type MintedNFT = {
  id: string
  collection_name: string
  collection_image: string
  mint_date: string
  token_id: number
}

export default function ProfilePage() {
  const { walletAddress } = useProfile()
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mintedNFTs, setMintedNFTs] = useState<MintedNFT[]>([])

  useEffect(() => {
    const fetchWalletAddress = async () => {
      if (walletAddress) {
        await Promise.all([
          fetchProfile(walletAddress),
          fetchMintedNFTs(walletAddress)
        ])
      }
      setLoading(false)
    }

    fetchWalletAddress()
  }, [walletAddress])

  const fetchMintedNFTs = async (address: string) => {
    try {
      const { data, error } = await supabase
        .from('minted_nfts')
        .select(`
          id,
          token_id,
          minted_at,
          collection_id,
          nft_collections (
            name,
            image
          )
        `)
        .eq('wallet_address', address.toLowerCase())
        .order('minted_at', { ascending: false })

      if (error) throw error

      if (data) {
        const formattedNFTs = data.map(nft => ({
          id: nft.id,
          collection_name: nft.nft_collections?.name || 'Uncategorized',
          collection_image: nft.nft_collections?.image || '/placeholder.svg',
          mint_date: new Date(nft.minted_at).toLocaleDateString(),
          token_id: nft.token_id
        }))
        setMintedNFTs(formattedNFTs)
      }
    } catch (error) {
      console.error('Error fetching minted NFTs:', error)
      toast.error('Failed to fetch minted NFTs')
    }
  }

  const fetchProfile = async (address: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('address', address.toLowerCase());

      if (error) throw error;

      if (data && data.length > 0) {
        // If a profile exists, set it
        setProfile(data[0]);
      } else {
        // If no profile exists, create a default one
        const defaultProfile = {
          address: address.toLowerCase(),
          username: `${address.slice(0, 6)}...${address.slice(-4)}`,
          bio: '',
          profile_picture: '/placeholder.svg?height=200&width=200'
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert([defaultProfile]);

        if (insertError) throw insertError;

        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch profile');
    }
  };

  const handleProfileUpdate = async (updatedProfile: Profile) => {
    try {
      console.log('Updating profile:', updatedProfile) // Debug log

      const { error } = await supabase
        .from('profiles')
        .upsert({ // Changed from update to upsert
          address: walletAddress?.toLowerCase(),
          username: updatedProfile.username,
          bio: updatedProfile.bio,
          profile_picture: updatedProfile.profile_picture,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'address' // This ensures we update the existing record
        })

      if (error) {
        console.error('Supabase error:', error) // Debug log
        throw error
      }

      setProfile(updatedProfile)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const deleteCollection = async (collectionId: string) => {
    try {
      // First check if there are any associated NFTs
      const { count } = await supabase
        .from('minted_nfts')
        .select('*', { count: 'exact' })
        .eq('collection_id', collectionId);

      if (count && count > 0) {
        throw new Error('Cannot delete collection with associated NFTs');
      }

      const { error } = await supabase
        .from('nft_collections')
        .delete()
        .eq('id', collectionId);

      if (error) throw error;
      toast.success('Collection deleted successfully');
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error(error.message || 'Failed to delete collection');
    }
  };

  if (loading) {
    return <div>Loading...</div>
  }

  if (!walletAddress) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Oops!</h1>
            <p className="text-lg">You need to connect your wallet to access your profile.</p>
            <p className="text-sm text-gray-400">Please use the wallet connection button in the header.</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // Shorten the wallet address for display
  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 text-gray-100 py-20">
        <DreamLayers />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <img
                src={profile?.profile_picture || "/placeholder.svg?height=200&width=200"}
                alt={profile?.username || shortAddress}
                className="w-48 h-48 rounded-full object-cover border-4 border-[#0154fa]"
              />
              <div className="flex-grow">
                <h1 className="text-4xl font-bold mb-2">{profile?.username || shortAddress}</h1>
                <p className="text-lg mb-6">{profile?.bio || "This is your profile page. Explore your NFTs!"}</p>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-[#0154fa] text-white px-4 py-2 rounded-md flex items-center gap-2"
                >
                  <FaEdit /> Edit Profile
                </button>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4">Minted Collections</h2>
              {mintedNFTs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {mintedNFTs.map((nft) => (
                    <div 
                      key={nft.id} 
                      className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                    >
                      <img 
                        src={nft.collection_image || "/placeholder.svg"} 
                        alt={nft.collection_name} 
                        className="w-full h-32 object-cover rounded-md mb-3"
                      />
                      <div className="space-y-1">
                        <h3 className="font-semibold">{nft.collection_name}</h3>
                        <p className="text-sm text-gray-400">Token #{nft.token_id}</p>
                        <p className="text-sm text-gray-400">Minted on {nft.mint_date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-700 rounded-lg">
                  <p className="text-gray-400">No NFTs minted yet</p>
                  <Link 
                    href="/explore" 
                    className="inline-block mt-4 bg-[#0154fa] text-white px-6 py-2 rounded-md hover:bg-[#0143d1] transition-colors"
                  >
                    Explore Collections
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleProfileUpdate}
          currentProfile={profile || {
            address: walletAddress || '',
            username: shortAddress,
            bio: '',
            profile_picture: '/placeholder.svg?height=200&width=200'
          }}
        />
      </div>
      <Footer className="mt-0" />
    </>
  )
}

