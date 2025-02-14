"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { FaTwitter, FaDiscord, FaGlobe } from "react-icons/fa"
import DreamLayers from "@/components/dream-layers"
import Countdown from "react-countdown"
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { ethers } from "ethers"
import { toast } from 'react-hot-toast'

const collections = {
  1: {
    name: "Dream Architects",
    artist: "Cobb & Co.",
    description:
      "Dive into a world of impossible structures and mind-bending landscapes. Each NFT in this collection represents a unique architectural marvel that defies the laws of physics, inspired by the deepest layers of our subconscious.",
    image: "/placeholder.svg?height=800&width=800",
    totalSupply: 10000,
    maxPerWallet: 3,
    socialLinks: {
      twitter: "https://twitter.com/dreamarchitects",
      discord: "https://discord.gg/dreamarchitects",
      website: "https://dreamarchitects.io",
    },
    phases: [
      { name: "Early Bird", price: 0.08, supply: 1000, start: Date.now() + 86400000, end: Date.now() + 86400000 * 2 },
      { name: "Presale", price: 0.1, supply: 3000, start: Date.now() + 86400000 * 2, end: Date.now() + 86400000 * 3 },
      {
        name: "Public Sale",
        price: 0.15,
        supply: 6000,
        start: Date.now() + 86400000 * 3,
        end: Date.now() + 86400000 * 5,
      },
    ],
  },
  // Add more collections here...
}

// ABI for your NFT contract
const CONTRACT_ABI = [
  // Add your contract ABI here
]

const MintPage = () => {
  const params = useParams()
  const id = params.id
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [address, setAddress] = useState(null)
  const [isMinting, setIsMinting] = useState(false)
  const [isMinted, setIsMinted] = useState(false)
  const [totalMinted, setTotalMinted] = useState(0)

  useEffect(() => {
    const fetchCollection = async () => {
      if (!id) return;

      setLoading(true)
      const { data, error } = await supabase
        .from('nft_collections')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching collection:', error)
      } else {
        // Handle the nested phases structure
        const parsedData = {
          ...data,
          phases: data.phases?.phases || [], // Access the nested phases array
          whitelists: data.whitelists || []
        }
        setCollection(parsedData)
      }
      setLoading(false)
    }

    fetchCollection()
  }, [id])

  // Check if user is whitelisted for current phase
  const isWhitelistedForCurrentPhase = () => {
    if (!address || !collection?.phases?.[currentPhase]) return false
    
    const phase = collection.phases[currentPhase]
    if (!phase.isWhitelist) return true // Not a whitelist phase, so everyone is "whitelisted"
    
    const isWhitelisted = phase.whitelists.map(addr => addr.toLowerCase())
      .includes(address.toLowerCase())
    return isWhitelisted
  }

  useEffect(() => {
    // Check if already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setAddress(accounts[0])
          }
        } catch (error) {
          console.error("Error checking connection:", error)
        }
      }
    }

    checkConnection()

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAddress(accounts[0] || null)
      })
    }
  }, [])

  useEffect(() => {
    if (collection?.phases) {
      const now = Date.now()
      const phaseIndex = collection.phases.findIndex(
        (phase) => now >= new Date(phase.start).getTime() && now < new Date(phase.end).getTime()
      )
      setCurrentPhase(phaseIndex !== -1 ? phaseIndex : 0)
    }
  }, [collection])

  // Fetch total minted amount from smart contract
  const fetchTotalMinted = async () => {
    if (!collection?.contract_address) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(collection.contract_address, CONTRACT_ABI, provider)
      const minted = await contract.totalSupply() // Assuming your contract has this function
      setTotalMinted(Number(minted))
    } catch (error) {
      console.error('Error fetching total minted:', error)
    }
  }

  // Update total minted amount periodically
  useEffect(() => {
    fetchTotalMinted()
    const interval = setInterval(fetchTotalMinted, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [collection?.contract_address])

  // Listen for mint events from the contract
  useEffect(() => {
    if (!collection?.contract_address) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(collection.contract_address, CONTRACT_ABI, provider)

    const mintListener = (to, amount) => {
      fetchTotalMinted()
    }

    contract.on('Transfer', mintListener)
    return () => {
      contract.off('Transfer', mintListener)
    }
  }, [collection?.contract_address])

  // Calculate current phase's max supply
  const getCurrentPhaseMaxSupply = () => {
    if (!collection?.phases?.[currentPhase]) return collection?.total_supply || 0;
    
    // Calculate remaining supply after previous phases
    let remainingSupply = collection.total_supply
    for (let i = 0; i < currentPhase; i++) {
      const phase = collection.phases[i]
      if (phase.maxSupply) {
        remainingSupply -= phase.maxSupply
      }
    }

    // Return either the phase's max supply or remaining total supply, whichever is smaller
    const currentPhaseMax = collection.phases[currentPhase].maxSupply
    return currentPhaseMax ? Math.min(currentPhaseMax, remainingSupply) : remainingSupply
  }

  // Calculate progress percentage for current phase
  const getProgressPercentage = () => {
    const maxSupply = getCurrentPhaseMaxSupply()
    return Math.min((totalMinted / maxSupply) * 100, 100)
  }

  // Handle minting
  const handleMint = async () => {
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }

    const phase = collection.phases[currentPhase]
    
    // Check if current phase is whitelist and user is whitelisted
    if (phase.isWhitelist && !isWhitelistedForCurrentPhase()) {
      toast.error('You are not whitelisted for this phase')
      return
    }

    try {
      setIsMinting(true)
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(collection.contract_address, CONTRACT_ABI, signer)
      
      const price = ethers.utils.parseEther((phase.price * quantity).toString())
      const tx = await contract.mint(quantity, { value: price })
      
      await tx.wait()
      setIsMinted(true)
      toast.success('Successfully minted!')
    } catch (error) {
      console.error('Minting error:', error)
      toast.error('Failed to mint NFT')
    } finally {
      setIsMinting(false)
    }
  }

  // Determine if minting should be disabled
  const isMintingDisabled = () => {
    if (!collection?.phases?.[currentPhase]) return true
    const phase = collection.phases[currentPhase]
    
    if (new Date(phase.start).getTime() > Date.now()) return true
    if (phase.isWhitelist && !isWhitelistedForCurrentPhase()) return true
    return false
  }

  // Get appropriate mint button text
  const getMintButtonText = () => {
    if (!collection?.phases?.[currentPhase]) return "Loading..."
    const phase = collection.phases[currentPhase]

    if (isMinting) return "Minting..."
    if (phase.isWhitelist && !isWhitelistedForCurrentPhase()) return "Not Whitelisted for this Phase"
    if (new Date(phase.start).getTime() > Date.now()) return "Minting Not Yet Started"
    return `Mint ${quantity} NFT${quantity > 1 ? "s" : ""}`
  }

  const isPhaseActive = (phase) => {
    const now = Date.now()
    const startTime = new Date(phase.start).getTime()
    const endTime = new Date(phase.end).getTime()
    return now >= startTime && now < endTime
  }

  const isPhaseUpcoming = (phase) => {
    return Date.now() < new Date(phase.start).getTime()
  }

  const renderCountdown = (phase) => {
    const now = Date.now()
    const startTime = new Date(phase.start).getTime()
    const endTime = new Date(phase.end).getTime()

    if (now < startTime) {
      return (
        <div>
          <p className="text-gray-400 mb-2">Starts in:</p>
          <Countdown
            date={startTime}
            renderer={({ days, hours, minutes, seconds }) => (
              <span className="text-xl font-bold text-[#0154fa]">
                {days}d {hours}h {minutes}m {seconds}s
              </span>
            )}
          />
        </div>
      )
    } else if (now < endTime) {
      return (
        <div>
          <p className="text-gray-400 mb-2">Ends in:</p>
          <Countdown
            date={endTime}
            renderer={({ days, hours, minutes, seconds }) => (
              <span className="text-xl font-bold text-[#0154fa]">
                {days}d {hours}h {minutes}m {seconds}s
              </span>
            )}
          />
        </div>
      )
    } else {
      return <p className="text-gray-400">Phase Ended</p>
    }
  }

  // Add this helper function
  const getEligibilityText = (phase: any, walletAddress: string | null) => {
    if (!walletAddress) return "Connect Wallet";
    if (!phase.isWhitelist) return "Public";
    
    const isEligible = phase.whitelists
      .map((addr: string) => addr.toLowerCase())
      .includes(walletAddress.toLowerCase());
      
    return isEligible ? "Eligible" : "Not Eligible";
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!collection) {
    return <div>Collection not found</div>
  }

  const phase = collection.phases?.[currentPhase]

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-20">
      <DreamLayers />
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <Link href="/" className="text-[#0154fa] hover:underline mb-8 inline-block">
          ← Back to Launchpad
        </Link>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <motion.img
              src={collection.image}
              alt={collection.name}
              className="w-full rounded-lg shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            />
            <div className="mt-6 flex justify-center space-x-6">
              {collection.twitter && (
                <a
                  href={collection.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0154fa] hover:text-white transition-colors"
                >
                  <FaTwitter size={24} />
                </a>
              )}
              {collection.discord && (
                <a
                  href={collection.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0154fa] hover:text-white transition-colors"
                >
                  <FaDiscord size={24} />
                </a>
              )}
              {collection.website && (
                <a
                  href={collection.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0154fa] hover:text-white transition-colors"
                >
                  <FaGlobe size={24} />
                </a>
              )}
            </div>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#0154fa]">{collection.name}</h1>
            <p className="text-lg md:text-xl mb-6">by {collection.artist}</p>
            <p className="mb-6">{collection.description}</p>
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <h2 className="text-xl md:text-2xl font-semibold mb-4">Mint Details</h2>
              <p>Total Supply: {collection.total_supply}</p>
              <p>Max Per Wallet: {collection.max_per_wallet}</p>
            </div>
            {phase && (
              <div className="mb-6">
                <h3 className="text-lg md:text-xl font-semibold mb-2">Current Phase: {phase.name}</h3>
                <p className="mb-2">Price: {phase.price} APE</p>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-[#0154fa] h-2.5 rounded-full" 
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                <p>
                  {totalMinted} / {getCurrentPhaseMaxSupply()} minted
                </p>
              </div>
            )}
            <AnimatePresence>
              {phase && new Date(phase.start).getTime() > Date.now() && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6"
                >
                  <h3 className="text-lg md:text-xl font-semibold mb-2">Phase Starts In:</h3>
                  <Countdown
                    date={new Date(phase.start)}
                    renderer={({ days, hours, minutes, seconds }) => (
                      <span className="text-2xl font-bold">
                        {days}d {hours}h {minutes}m {seconds}s
                      </span>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="bg-gray-700 text-gray-200 px-3 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                -
              </button>
              <span className="text-2xl font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(collection.max_per_wallet, quantity + 1))}
                className="bg-gray-700 text-gray-200 px-3 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                +
              </button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-[#0154fa] text-white py-3 rounded-md text-xl font-semibold hover:bg-[#0143d1] transition-colors shadow-lg hover:shadow-[#0154fa]/50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isMintingDisabled() || isMinting}
              onClick={handleMint}
            >
              {getMintButtonText()}
            </motion.button>
            {isMinting && (
              <p className="mt-2 text-sm text-gray-400">
                Transaction pending...
              </p>
            )}
            {isMinted && (
              <p className="mt-2 text-sm text-green-400">
                Successfully minted!
              </p>
            )}
            {collection?.phases?.[currentPhase]?.isWhitelist && (
              <p className="mt-2 text-sm text-gray-400">
                {isWhitelistedForCurrentPhase() 
                  ? "✅ You are whitelisted for this phase" 
                  : "❌ You are not whitelisted for this phase"}
              </p>
            )}
          </div>
        </div>
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Mint Phases</h2>
          <div className="space-y-4">
            {Array.isArray(collection?.phases) && collection.phases.map((phase, index) => (
              <div 
                key={index} 
                className={`bg-gray-800 p-4 rounded-lg shadow-md ${
                  isPhaseActive(phase) ? 'border-2 border-[#0154fa]' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-[#0154fa]">
                    {phase.name}
                    {isPhaseActive(phase) && (
                      <span className="ml-2 text-sm bg-[#0154fa] text-white px-2 py-1 rounded">
                        Active
                      </span>
                    )}
                  </h3>
                  {!phase.name.toLowerCase().includes('public') && (
                    <span className={`px-2 py-1 rounded text-sm ${
                      getEligibilityText(phase, address) === "Eligible" 
                        ? "bg-green-500 text-white" 
                        : getEligibilityText(phase, address) === "Connect Wallet"
                        ? "bg-yellow-500 text-white"
                        : "bg-red-500 text-white"
                    }`}>
                      {getEligibilityText(phase, address)}
                    </span>
                  )}
                </div>
                <p className="text-gray-400">Price: {phase.price} APE</p>
                <p className="text-gray-400">
                  {phase.isWhitelist ? "Whitelist Only" : "Public Sale"}
                </p>
                <div className="mt-4">
                  {renderCountdown(phase)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MintPage;

