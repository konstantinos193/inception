'use client'

import { useState, useEffect } from 'react'
import { BrowserProvider, Contract, parseEther, isAddress, arrayify } from 'ethers'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTwitter, FaDiscord, FaGlobe } from 'react-icons/fa'
import Countdown from 'react-countdown'
import { toast } from 'react-hot-toast'
import DreamLayers from '@/components/dream-layers'
import MyNFTCollection from '@/lib/MyNFTCollection.json'
import { keccak256 } from 'js-sha3'
import * as ethers from 'ethers'

const APECHAIN = {
  chainId: '0x8173', // 33139 in hex
  chainName: 'ApeChain',
  nativeCurrency: {
    name: 'APE',
    symbol: 'APE',
    decimals: 18,
  },
  rpcUrls: ['https://apechain.calderachain.xyz/http'],
  blockExplorerUrls: ['https://apechain.calderaexplorer.xyz/'],
};

// Verify ABI import
if (!MyNFTCollection || !MyNFTCollection.abi) {
  throw new Error('Failed to load contract ABI');
}

// Verify ABI structure
if (!Array.isArray(MyNFTCollection.abi)) {
  throw new Error('Invalid ABI structure');
}

// Use the ABI from the JSON file
const CONTRACT_ABI = MyNFTCollection.abi;

console.log('[DEBUG] ABI:', MyNFTCollection.abi);

const solidityKeccak256 = (types: string[], values: any[]) => {
  const packed = types.map((type, index) => {
    const value = values[index];
    if (type === 'address') {
      return value.slice(2).padStart(64, '0'); // Addresses are 20 bytes, padded to 32 bytes
    } else if (type === 'uint256') {
      return BigInt(value).toString(16).padStart(64, '0'); // uint256 is 32 bytes
    } else if (type === 'string') {
      return Buffer.from(value).toString('hex'); // Strings are encoded as UTF-8 bytes
    } else {
      throw new Error(`Unsupported type: ${type}`);
    }
  }).join('');

  return '0x' + keccak256(Buffer.from(packed, 'hex'));
};

const MintPage = ({ params }: { params: { id: string } }) => {
  const [collection, setCollection] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [isMinting, setIsMinting] = useState(false)
  const [isMinted, setIsMinted] = useState(false)
  const [totalMinted, setTotalMinted] = useState(0)
  const [address, setAddress] = useState<string | null>(null)
  const [pricePerNFT, setPricePerNFT] = useState<number | null>(null)
  const [isButtonDisabled, setIsButtonDisabled] = useState(true)
  const [mintedCountForWallet, setMintedCountForWallet] = useState(0)
  const [isFetchingMintedCount, setIsFetchingMintedCount] = useState(false)
  const [whitelistsNotLoaded, setWhitelistsNotLoaded] = useState(false)

  // Define fetchMintedCount here
  const fetchMintedCount = async () => {
    if (address) {
      try {
        setIsFetchingMintedCount(true);
        const response = await fetch(`/api/minted-nfts?wallet=${address}&collectionId=${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch minted NFTs count');
        }

        const { mintedCount } = await response.json();
        console.log('Fetched minted count:', mintedCount);
        setMintedCountForWallet(mintedCount || 0);
      } catch (error) {
        console.error('Error fetching minted NFTs count:', error);
        toast.error('Failed to check minted NFTs count. Please try again.');
      } finally {
        setIsFetchingMintedCount(false);
      }
    }
  };

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

  useEffect(() => {
    const checkMintingDisabled = () => {
      const disabled = isMintingDisabled();
      console.log('Button disabled:', disabled);
      setIsButtonDisabled(disabled);
    };

    checkMintingDisabled();
  }, [address, collection, currentPhase, totalMinted, mintedCountForWallet]);

  useEffect(() => {
    if (collection?.phases?.phases) {
      const now = Date.now();
      const activePhaseIndex = collection.phases.phases.findIndex(phase => {
        const startTime = new Date(phase.start).getTime();
        const endTime = phase.end ? new Date(phase.end).getTime() : Infinity;
        return now >= startTime && now < endTime;
      });

      // Check if there are multiple phases
      if (collection.phases.phases.length > 1) {
        // Check if the address is found in any phase except the last one
        const isAddressFoundInAnyPhase = collection.phases.phases.slice(0, -1).some(phase => {
          return phase.whitelists?.map((addr: string) => addr.toLowerCase()).includes(address?.toLowerCase());
        });

        // If the address is not found in any phase except the last one
        if (!isAddressFoundInAnyPhase) {
          setWhitelistsNotLoaded(true);
        } else {
          setWhitelistsNotLoaded(false);
        }
      }

      if (activePhaseIndex !== -1) {
        setCurrentPhase(activePhaseIndex);
        setPricePerNFT(collection.phases.phases[activePhaseIndex].price);
      }
    }
  }, [collection, address]);

  useEffect(() => {
    // Block the script from running
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'SCRIPT' && node.textContent?.includes('findWalletAddresses')) {
              node.remove();
              console.log('Blocked address scanning script');
            }
          });
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const switchToApeChain = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [APECHAIN],
      });
      console.log('Switched to ApeChain');
    } catch (error) {
      console.error('Error switching network:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
        const address = await signer.getAddress();
        console.log('[DEBUG] Connected wallet:', address);
        setAddress(address);
      } else {
        throw new Error('MetaMask not detected');
        }
      } catch (error) {
      console.error('[DEBUG] Error connecting wallet:', error);
      alert(`Wallet connection failed: ${error.message}`);
    }
  };

  const ensureWalletConnected = async () => {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask!');
    }
    const provider = new BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const network = await provider.getNetwork();
    console.log('Connected to network:', network);
    return provider;
  };

  const fetchCollection = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/collections/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch collection');
      }
      const data = await response.json();
      
      // Check if data is valid
      if (!data || !data.id) {
        throw new Error('Invalid collection data');
      }
      
      setCollection(data);

      // Ensure wallet is connected
      const provider = await ensureWalletConnected();

      // Set max supply for each phase
      if (data.phases?.phases) {
        data.phases.phases.forEach((phase: any) => {
          phase.supply = phase.supply || 0; // Set default supply if not defined
        });
      }

      // If there's a contract address, fetch total supply
      if (data.contract_address) {
        const contractAddress = data.contract_address; // Use the contract address from the API
        const contract = await fetchContract(contractAddress, provider);

        console.log('[DEBUG] Contract methods:', Object.keys(contract));
        console.log('[DEBUG] Contract interface:', contract.interface.fragments);

        // Use the price from Supabase phases
        if (data.phases?.phases?.[currentPhase]?.price) {
          setPricePerNFT(data.phases.phases[currentPhase].price);
        } else {
          setPricePerNFT(0); // Default price if not available
        }

        // Fetch total supply
        try {
          const totalMinted = await contract.totalSupply();
          console.log('[DEBUG] Total Minted:', totalMinted.toString());
          setTotalMinted(Number(totalMinted));
        } catch (supplyError) {
          console.error('[DEBUG] Error fetching total supply:', supplyError);
          setTotalMinted(0);
        }
      } else {
        // If no contract address, use the price from Supabase
        if (data.phases?.phases?.[currentPhase]?.price) {
          setPricePerNFT(data.phases.phases[currentPhase].price);
        } else {
          setPricePerNFT(0); // Default price if not available
        }
        setTotalMinted(0); // Set default value when no contract
      }

      console.log('[DEBUG] Contract address:', data.contract_address);
      console.log('[DEBUG] Contract ABI:', CONTRACT_ABI);
    } catch (error) {
      console.error('[DEBUG] Error fetching collection:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      toast.error('Failed to load collection data');
    } finally {
      setLoading(false);
    }
  };

  const fetchContract = async (contractAddress: string, provider: BrowserProvider) => {
    try {
      // Verify contract address format
      const isValidAddress = isAddress(contractAddress);
      if (!isValidAddress) {
        throw new Error(`Invalid contract address: ${contractAddress}`);
      }

      // Verify ABI is valid
      if (!Array.isArray(MyNFTCollection.abi)) {
        throw new Error('Invalid ABI format');
      }

      // Create contract instance
      const signer = await provider.getSigner();
      const contract = new Contract(
        contractAddress,
        MyNFTCollection.abi,
        signer
      );

      // Verify contract instance
      if (!contract) {
        throw new Error('Failed to create contract instance');
      }

      // Wait for contract to be deployed
      const code = await provider.getCode(contractAddress);
      console.log('[DEBUG] Contract code:', code);
      if (!code || code === '0x') {
        throw new Error('Contract not deployed at this address');
      }

      // Verify contract interface exists
      if (!contract.interface) {
        throw new Error('Contract interface not available');
      }

      // Verify contract functions exist
      if (!contract.interface.fragments) {
        throw new Error('Contract functions not available in interface');
      }

      // Get available methods
      const methods = contract.interface.fragments.map(fragment => fragment.name);
      if (!methods || methods.length === 0) {
        throw new Error('No contract methods found');
      }

      console.log('[DEBUG] Contract methods:', methods);

      // Verify mint function exists
      if (!methods.includes('mint')) {
        throw new Error('Mint function not found in contract ABI');
      }

      return contract;
    } catch (error) {
      console.error('[DEBUG] Error initializing contract:', error);
      throw new Error('Failed to initialize contract: ' + error.message);
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

  const isWhitelistedForCurrentPhase = () => {
    if (!address || !collection?.phases?.phases?.[currentPhase]) return false;
    const phase = collection.phases.phases[currentPhase];

    // Check if whitelists are loaded
    if (phase.whitelists === null || phase.whitelists.length === 0) {
      setWhitelistsNotLoaded(true); // Set state to indicate whitelists are not loaded
      return false; // Not whitelisted since we don't have the list
    }

    if (!phase.isWhitelist) return true; // Public phase, no whitelist check

    return phase.whitelists
      .map((addr: string) => addr.toLowerCase())
      .includes(address.toLowerCase());
  }

  const handleMint = async () => {
    try {
      // Ensure the wallet is connected
      if (!address) {
        await connectWallet();
        if (!address) {
          throw new Error('Please connect your wallet to proceed.');
        }
      }

      // Check if the current phase's supply has been reached
      if (totalMinted >= getCurrentPhaseMaxSupply()) {
        const currentPhaseData = collection.phases.phases[currentPhase];
        
        // Check if the current phase is a never-ending phase
        if (currentPhaseData.end === null) {
          // If it's a never-ending phase, you can choose to keep it active
          // or display a message that the supply is exhausted
          toast.error('The supply for this phase has been minted.');
          return; // Prevent further minting
        } else {
          // Automatically switch to the next phase if available
          if (currentPhase < collection.phases.phases.length - 1) {
            setCurrentPhase(currentPhase + 1);
            toast.success('Phase ended, moving to the next phase.');
          } else {
            throw new Error('Current phase supply reached. Cannot mint more NFTs.');
          }
        }
      }

      // Check if the wallet has already minted the maximum allowed for this phase
      const maxPerWallet = collection.phases.phases[currentPhase].max_per_wallet;
      if (mintedCountForWallet >= maxPerWallet) {
        throw new Error('You have already minted the maximum allowed NFTs for this phase.');
      }

      // Initialize the provider and contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        collection.contract_address, // Contract address
        MyNFTCollection.abi, // ABI
        signer // Signer
      );

      // Get the current phase's price directly
      const now = Date.now();
      const activePhase = collection.phases.phases.find(phase => {
        const startTime = new Date(phase.start).getTime();
        const endTime = phase.end ? new Date(phase.end).getTime() : Infinity;
        return now >= startTime && now < endTime;
      });

      if (!activePhase) {
        throw new Error('No active phase found');
      }

      const pricePerNFTInWei = parseEther(activePhase.price.toString());
      const totalValue = pricePerNFTInWei * BigInt(quantity);

      // Send the mint transaction with the correct payment amount and gas limit
      const tx = await contract.mint(quantity, pricePerNFTInWei, {
        value: totalValue,
        gasLimit: 300000, // Set a higher gas limit (e.g., 300,000)
      });

      await tx.wait();

      // Refresh the minted count
      await fetchMintedCount();
    } catch (error) {
      console.error('[DEBUG] Minting error:', error);
      toast.error(error.message || 'Minting failed. Please try again.');
    }
  };

  const isMintingDisabled = () => {
    if (!collection?.phases?.phases?.[currentPhase]) return true;
    const phase = collection.phases.phases[currentPhase];

    // Check if the wallet has minted the maximum allowed
    if (mintedCountForWallet >= collection.max_per_wallet) {
      console.log('Minting disabled: Max per wallet minted');
      return true;
    }

    if (totalMinted >= phase.supply) return true; // This will trigger the phase switch
    if (new Date(phase.start).getTime() > Date.now()) return true;
    if (phase.isWhitelist && !isWhitelistedForCurrentPhase()) return true;
    return false;
  };

  const getMintButtonText = () => {
    if (!address) return "Please Connect Wallet";
    if (isFetchingMintedCount) return "Loading...";
    if (!collection?.phases?.phases?.[currentPhase]) return "Loading...";
    const phase = collection.phases.phases[currentPhase];

    if (mintedCountForWallet >= collection.max_per_wallet) {
      return "Max Per Wallet Minted";
    }

    if (totalMinted >= phase.supply) return "Sold Out";
    if (isMinting) return "Minting...";
    if (phase.isWhitelist && !isWhitelistedForCurrentPhase()) return "Not Whitelisted for this Phase";
    if (new Date(phase.start).getTime() > Date.now()) return "Minting Not Yet Started";
    return `Mint ${quantity} NFT${quantity > 1 ? "s" : ""}`;
  };

  const isPhaseActive = (phase) => {
    const now = Date.now();
    const startTime = new Date(phase.start).getTime();
    
    // If end is null, the phase is active as long as the start time has passed
    if (phase.end === null) {
      return now >= startTime;
    }
    
    const endTime = new Date(phase.end).getTime();
    return now >= startTime && now < endTime;
  }

  const isPhaseUpcoming = (phase) => {
    return Date.now() < new Date(phase.start).getTime()
  }

  const renderCountdown = (phase) => {
    const now = Date.now();
    const startTime = new Date(phase.start).getTime();
    const endTime = phase.end ? new Date(phase.end).getTime() : Infinity;

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
      );
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
      );
    } else {
      return <p className="text-gray-400">Phase Ended</p>;
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
              <p>Max Per Wallet: {collection.phases.phases[currentPhase]?.max_per_wallet}</p>
            </div>
            {phase && (
              <div className="mb-6">
                <h3 className="text-lg md:text-xl font-semibold mb-2">
                  Current Phase: {phase.name}
                  {isPhaseActive(phase) && (
                    <span className="ml-2 text-sm bg-[#0154fa] text-white px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                </h3>
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
              disabled={isButtonDisabled || isMinting || isFetchingMintedCount}
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
            {whitelistsNotLoaded && (
              <p className="text-red-500">Whitelists not yet loaded for this phase.</p>
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
