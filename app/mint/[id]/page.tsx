'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
import { parseEther } from '@ethersproject/units'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTwitter, FaDiscord, FaGlobe } from 'react-icons/fa'
import Countdown from 'react-countdown'
import { toast } from 'react-hot-toast'
import DreamLayers from '@/components/dream-layers'
import { CONTRACT_ABI } from '@/lib/contract'

const MintPage = ({ params }: { params: { id: string } }) => {
  const [collection, setCollection] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [isMinting, setIsMinting] = useState(false)
  const [isMinted, setIsMinted] = useState(false)
  const [totalMinted, setTotalMinted] = useState(0)
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCollection();
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const timeout = setTimeout(() => {
      if (loading) {
        toast.error('Loading took too long. Please try again.');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    fetchData();
    
    return () => clearTimeout(timeout);
  }, [params.id]);

  const fetchCollection = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/collections/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch collection');
      }
      const data = await response.json();
      setCollection(data);
      
      // Fetch total minted count
      const provider = new Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        data.contract_address,
        CONTRACT_ABI,
        provider
      );
      const totalMinted = await contract.totalSupply();
      setTotalMinted(totalMinted.toNumber());
    } catch (error) {
      console.error('Error fetching collection:', error);
      toast.error('Failed to load collection data');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPhaseMaxSupply = () => {
    if (!collection?.phases?.phases?.[currentPhase]) return 0;
    return collection.phases.phases[currentPhase].supply;
  }

  const getProgressPercentage = () => {
    if (!collection?.phases?.phases?.[currentPhase]) return 0;
    const phase = collection.phases.phases[currentPhase];
    return (totalMinted / phase.supply) * 100;
  }

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        setAddress(await signer.getAddress());
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const isWhitelistedForCurrentPhase = () => {
    if (!address || !collection?.phases?.phases?.[currentPhase]) return false
    const phase = collection.phases.phases[currentPhase]
    if (!phase.isWhitelist) return true

    return phase.whitelists
      .map((addr: string) => addr.toLowerCase())
      .includes(address.toLowerCase())
  }

  const handleMint = async () => {
    if (!address) {
      toast.error('Please connect your wallet')
      connectWallet();
      return
    }

    const phase = collection.phases.phases[currentPhase]

    if (phase.isWhitelist && !isWhitelistedForCurrentPhase()) {
      toast.error('You are not whitelisted for this phase')
      return
    }

    try {
      setIsMinting(true)
      const provider = new Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(collection.contract_address, CONTRACT_ABI, signer)

      const price = parseEther((phase.price * quantity).toString())
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

  const isMintingDisabled = () => {
    if (!collection?.phases?.phases?.[currentPhase]) return true
    const phase = collection.phases.phases[currentPhase]

    if (totalMinted >= phase.supply) return true
    if (new Date(phase.start).getTime() > Date.now()) return true
    if (phase.isWhitelist && !isWhitelistedForCurrentPhase()) return true
    return false
  }

  const getMintButtonText = () => {
    if (!collection?.phases?.phases?.[currentPhase]) return "Loading..."
    const phase = collection.phases.phases[currentPhase]

    if (totalMinted >= phase.supply) return "Sold Out"
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

  const getEligibilityText = (phase: any, walletAddress: string | null) => {
    if (!walletAddress) return "Connect Wallet"
    if (!phase.isWhitelist) return "Public"

    const isEligible = phase.whitelists
      .map((addr: string) => addr.toLowerCase())
      .includes(walletAddress.toLowerCase())

    return isEligible ? "Eligible" : "Not Eligible"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#0154fa] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading collection...</p>
        </div>
      </div>
    )
  }

  if (!collection) {
    return <div>Collection not found</div>
  }

  if (!collection?.phases?.phases) {
    return <div>No phases available for this collection</div>;
  }

  const phase = collection.phases.phases?.[currentPhase]

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-20">
      <div className="absolute top-4 right-4">
        <button
          onClick={connectWallet}
          className="bg-[#0154fa] text-white px-4 py-2 rounded-md"
        >
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
        </button>
      </div>
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
            <div className="flex items-center mb-6">
              {collection.artist_image && (
                <img
                  src={collection.artist_image}
                  alt={collection.artist}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full mr-2 object-cover"
                />
              )}
              <p className="text-lg md:text-xl">by {collection.artist}</p>
            </div>
            <p className="mb-6">{collection.description}</p>
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <h2 className="text-xl md:text-2xl font-semibold mb-4">Mint Details</h2>
              <p>Total Supply: {collection.total_supply}</p>
              <p>Max Per Wallet: {collection.max_per_wallet}</p>
            </div>
            {phase && (
              <div className="mb-6">
                <h3 className="text-lg md:text-xl font-semibold mb-2">Current Phase: {phase.name}</h3>
                <p className="text-xl md:text-2xl font-semibold text-[#0154fa] mb-6">
                  {phase.price === 0 ? "FREE" : `${phase.price} APE`}
                </p>
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
            {collection?.phases?.phases?.[currentPhase]?.isWhitelist && (
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
            {Array.isArray(collection?.phases?.phases) && collection.phases.phases.map((phase, index) => (
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
                <p className="text-gray-400">Price: {phase.price === 0 ? "FREE" : `${phase.price} APE`}</p>
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
export default MintPage
