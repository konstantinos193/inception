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
  const [phaseWhitelistStatus, setPhaseWhitelistStatus] = useState<{[key: string]: boolean}>({});

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
        const firstPhase = collection.phases.phases[0];
        const firstPhaseStartTime = new Date(firstPhase.start).getTime();
        const secondPhaseStartTime = firstPhaseStartTime + (24 * 60 * 60 * 1000);
        
        // If we're past the second phase start time, set current phase to 1 (GTD phase)
        if (now >= secondPhaseStartTime) {
            setCurrentPhase(1);
            setPricePerNFT(collection.phases.phases[1].price);
        }
        // If we're past the first phase start time but before second phase, set to 0 (Public phase)
        else if (now >= firstPhaseStartTime) {
            setCurrentPhase(0);
            setPricePerNFT(collection.phases.phases[0].price);
        }
        // If we're before the first phase, set to 0 but it will be inactive
        else {
            setCurrentPhase(0);
            setPricePerNFT(collection.phases.phases[0].price);
        }
    }
}, [collection]);

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

  useEffect(() => {
    if (!collection?.phases?.phases) return;
    
    const newStatus = {};
    collection.phases.phases.forEach((phase, index) => {
      if (phase.is_whitelist && (!phase.whitelists || phase.whitelists.length === 0)) {
        newStatus[index] = true;
      }
    });
    setWhitelistsNotLoaded(Object.values(newStatus).some(status => status));
    setPhaseWhitelistStatus(newStatus);
  }, [collection?.phases?.phases]);

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
    console.log('Connected to network:', {
      name: network.name,
      chainId: Number(network.chainId), // Convert to Number
    });
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
      
      // Debugging: Log the raw data structure
      console.log('Raw collection data:', JSON.stringify(data, null, 2));
      
      // Check if data has the correct structure
      if (!data || !data.id) {
        console.error('Invalid collection data:', data);
        toast.error('Invalid collection data');
        setCollection(null);
        return;
      }

      // Ensure phases exists and has the correct structure
      if (!data.phases) {
        data.phases = { phases: [] }; // Initialize if missing
      } else if (Array.isArray(data.phases)) {
        // If phases is an array, convert to expected structure
        data.phases = { phases: data.phases };
      }

      // Ensure phases array exists
      if (!Array.isArray(data.phases.phases)) {
        data.phases.phases = [];
      }

      // Log the processed data
      console.log('Processed collection data:', data);
      
      // Set the collection with the processed data
      setCollection(data);

      // Rest of your existing code...
      const provider = await ensureWalletConnected();

      if (data.contract_address) {
        const contractAddress = data.contract_address;
        const contract = await fetchContract(contractAddress, provider);
        console.log('[DEBUG] Contract address:', contractAddress);
      } else {
        console.warn('Contract address is null');
        toast('Contract not yet created.');
      }

    } catch (error) {
      console.error('[DEBUG] Error fetching collection:', error);
      toast.error('Failed to load collection data');
      setCollection(null);
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

    if (!phase.is_whitelist) return true; // Public phase, no whitelist check

    // Check if whitelists are loaded
    if (!phase.whitelists || phase.whitelists.length === 0) {
      return false; // Not whitelisted since we don't have the list
    }

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
    // Ensure currentPhase is within bounds
    if (!collection?.phases || !Array.isArray(collection.phases.phases) || currentPhase < 0 || currentPhase >= collection.phases.phases.length) {
        console.warn('Invalid currentPhase:', currentPhase);
        return true; // Disable minting if currentPhase is invalid
    }

    const phase = collection.phases.phases[currentPhase];

    // Check if the phase has started
    const now = Date.now();
    const startTime = phase.start ? new Date(phase.start).getTime() : 0; // Allow null start time
    if (startTime > now) return true; // Phase not started

    // Check if the wallet has minted the maximum allowed
    if (mintedCountForWallet >= phase.max_per_wallet) {
        console.log('Minting disabled: Max per wallet minted');
        return true;
    }

    // Check if the total supply has been reached
    if (totalMinted >= phase.supply) return true; // This will trigger the "Sold Out" state

    // Check if the user is whitelisted for a whitelist phase
    if (phase.is_whitelist && !isWhitelistedForCurrentPhase()) return true; // Not whitelisted

    return false;
  };

  const getMintButtonText = () => {
    if (!address) return "Please Connect Wallet";
    if (isFetchingMintedCount) return "Loading...";
    if (!collection?.phases?.phases?.[currentPhase]) return "Loading...";
    const phase = collection.phases.phases[currentPhase];

    // Check if the total supply has been reached
    if (totalMinted >= phase.supply) {
      return "Sold Out"; // Indicate that the phase is sold out
    }

    if (mintedCountForWallet >= collection.max_per_wallet) {
      return "Max Per Wallet Minted";
    }

    if (isMinting) return "Minting...";
    if (phase.isWhitelist && !isWhitelistedForCurrentPhase()) return "Not Whitelisted for this Phase";
    if (new Date(phase.start).getTime() > Date.now()) return "Minting Not Yet Started";
    return `Mint ${quantity} NFT${quantity > 1 ? "s" : ""}`;
  };

  const isPhaseActive = (phase) => {
    const now = Date.now();
    
    // For first phase (Public)
    if (phase.id === "1") {
        const startTime = new Date(phase.start).getTime();
        const isSoldOut = totalMinted >= phase.supply;
        return now >= startTime && !isSoldOut;
    }
    
    // For second phase (GTD)
    if (phase.id === "2") {
        const firstPhase = collection.phases.phases[0];
        const firstPhaseSoldOut = totalMinted >= firstPhase.supply;
        
        if (firstPhaseSoldOut) {
            // If first phase is sold out, check if we're within the duration period
            const phaseStartTime = now; // Phase starts immediately when first sells out
            const phaseEndTime = phaseStartTime + (phase.duration * 60 * 60 * 1000);
            return now < phaseEndTime;
        }
        return false; // Not active if first phase hasn't sold out
    }
    
    return false;
  }

  const isPhaseUpcoming = (phase) => {
    return Date.now() < new Date(phase.start).getTime()
  }

  const renderCountdown = (phase) => {
    const now = Date.now();
    
    if (phase.id === "1") {
        const startTime = new Date(phase.start).getTime();
        const isSoldOut = totalMinted >= phase.supply;
        
        if (isSoldOut) {
            return <p className="text-gray-400">Phase Ended - Sold Out</p>;
        }
        
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
        }
        
        return <p className="text-gray-400">Active until sold out</p>;
    }
    
    if (phase.id === "2") {
        const firstPhase = collection.phases.phases[0];
        const firstPhaseSoldOut = totalMinted >= firstPhase.supply;
        
        if (!firstPhaseSoldOut) {
            return (
                <div>
                    <p className="text-gray-400 mb-2">Starts when first phase sells out</p>
                </div>
            );
        }
        
        // If first phase is sold out, show duration countdown
        const phaseStartTime = now;
        const phaseEndTime = phaseStartTime + (phase.duration * 60 * 60 * 1000);
        return (
            <div>
                <p className="text-gray-400 mb-2">Ends in:</p>
                <Countdown
                    date={phaseEndTime}
                    renderer={({ days, hours, minutes, seconds }) => (
                        <span className="text-xl font-bold text-[#0154fa]">
                            {days}d {hours}h {minutes}m {seconds}s
                        </span>
                    )}
                />
            </div>
        );
    }
    
    return <p className="text-gray-400">Phase status unknown</p>;
  }

  const getEligibilityText = (phase: any, walletAddress: string | null) => {
    if (!walletAddress) return "Connect Wallet"
    if (!phase.is_whitelist) return "Public"

    // If whitelists is null, it means they haven't been loaded into Supabase yet
    if (phase.whitelists === null) {
      return "Whitelists Not Yet Loaded"; // Changed message
    }

    // If whitelists array is empty (but not null), then we're still loading
    if (Array.isArray(phase.whitelists) && phase.whitelists.length === 0) {
      return "Loading Whitelist...";
    }

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
    return <div className="min-h-screen bg-gray-900 text-gray-100 py-20 text-center">Collection not found or loading issues. Please try again later.</div>
  }

  // Ensure phases array exists and has items before rendering
  const hasPhases = collection.phases?.phases && Array.isArray(collection.phases.phases) && collection.phases.phases.length > 0;

  if (!hasPhases) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">No Phases Available</h2>
        <p>This collection is still being configured. Please check back later.</p>
      </div>
    );
  }

  // Check if the current phase is upcoming
  const phase = collection.phases.phases?.[currentPhase];
  const isUpcomingPhase = phase && new Date(phase.start).getTime() > Date.now();

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
            {isUpcomingPhase ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold">Upcoming Phase</h2>
                <Countdown
                  date={new Date(phase.start)}
                  renderer={({ days, hours, minutes, seconds }) => (
                    <p className="text-gray-400">
                      The first phase starts in: {days}d {hours}h {minutes}m {seconds}s
                    </p>
                  )}
                />
              </div>
            ) : (
              <>
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
                  disabled={isButtonDisabled || isMinting || isFetchingMintedCount || totalMinted >= phase.supply}
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
              </>
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
                  {!phase.name.toLowerCase().includes('public') && phase.is_whitelist && (
                    <span className={`px-2 py-1 rounded text-sm ${
                      getEligibilityText(phase, address) === "Eligible"
                        ? "bg-green-500 text-white"
                        : getEligibilityText(phase, address) === "Connect Wallet"
                        ? "bg-yellow-500 text-white"
                        : getEligibilityText(phase, address) === "Loading Whitelist..."
                        ? "bg-yellow-500 text-white"
                        : getEligibilityText(phase, address) === "Whitelists Not Yet Loaded"
                        ? "bg-gray-500 text-white"
                        : "bg-red-500 text-white"
                    }`}>
                      {getEligibilityText(phase, address)}
                    </span>
                  )}
                </div>
                <p className="text-gray-400">Price: {phase.price === 0 ? "FREE" : `${phase.price} APE`}</p>
                <p className="text-gray-400">
                  {phase.is_whitelist ? "Whitelist Only" : "Public Sale"}
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
