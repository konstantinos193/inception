'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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

// First, create a simplified version of the Ether logo component
const EtherLogo = () => (
  <svg width="16" height="16" viewBox="0 0 123 123" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25.79 58.4149C25.7901 57.7357 25.9244 57.0633 26.1851 56.4361C26.4458 55.809 26.8278 55.2396 27.3092 54.7605C27.7907 54.2814 28.3619 53.9021 28.9903 53.6444C29.6187 53.3867 30.2918 53.2557 30.971 53.2589L39.561 53.2869C40.9305 53.2869 42.244 53.831 43.2124 54.7994C44.1809 55.7678 44.725 57.0813 44.725 58.4509V90.9309C45.692 90.6439 46.934 90.3379 48.293 90.0179C49.237 89.7962 50.0783 89.262 50.6805 88.5019C51.2826 87.7418 51.6102 86.8006 51.61 85.8309V45.5409C51.61 44.1712 52.154 42.8576 53.1224 41.889C54.0908 40.9204 55.4043 40.3762 56.774 40.3759H65.381C66.7506 40.3762 68.0641 40.9204 69.0325 41.889C70.0009 42.8576 70.545 44.1712 70.545 45.5409V82.9339C70.545 82.9339 72.7 82.0619 74.799 81.1759C75.5787 80.8462 76.2441 80.2941 76.7122 79.5886C77.1803 78.8832 77.4302 78.0555 77.431 77.2089V32.6309C77.431 31.2615 77.9749 29.9481 78.9431 28.9797C79.9113 28.0113 81.2245 27.4672 82.5939 27.4669H91.201C92.5706 27.4669 93.884 28.0109 94.8525 28.9794C95.8209 29.9478 96.365 31.2613 96.365 32.6309V69.3399C103.827 63.9319 111.389 57.4279 117.39 49.6069C118.261 48.4717 118.837 47.1386 119.067 45.7267C119.297 44.3148 119.174 42.8678 118.709 41.5149C115.931 33.5227 111.516 26.1983 105.745 20.0105C99.974 13.8228 92.9749 8.90785 85.1955 5.58032C77.4161 2.2528 69.0277 0.585938 60.5671 0.686416C52.1065 0.786893 43.7601 2.6525 36.062 6.16383C28.3638 9.67517 21.4834 14.7549 15.8611 21.078C10.2388 27.401 5.99842 34.8282 3.41131 42.8842C0.824207 50.9401 -0.0526487 59.4474 0.836851 67.8617C1.72635 76.276 4.36263 84.4119 8.57696 91.7489C9.31111 93.0145 10.3912 94.0444 11.6903 94.7175C12.9894 95.3906 14.4536 95.679 15.911 95.5489C17.539 95.4059 19.566 95.2029 21.976 94.9199C23.0251 94.8008 23.9937 94.2999 24.6972 93.5126C25.4008 92.7253 25.7901 91.7067 25.791 90.6509L25.79 58.4149Z" fill="#9CA3AF"/>
    <path d="M25.6021 110.51C34.6744 117.11 45.3959 121.072 56.5802 121.957C67.7646 122.841 78.9757 120.615 88.9731 115.523C98.9705 110.431 107.364 102.673 113.226 93.1068C119.087 83.5405 122.188 72.539 122.185 61.3197C122.185 59.9197 122.12 58.5347 122.027 57.1577C99.808 90.2957 58.7831 105.788 25.604 110.505" fill="#D1D5DB"/>
  </svg>
);

const MeLogo = () => (
  <svg width="28" height="16" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.5949 5.09192L25.5453 7.38358C25.7686 7.64098 25.9666 7.85271 26.0467 7.97311C26.63 8.55281 26.957 9.33628 26.9566 10.1527C26.9018 11.1158 26.2741 11.7718 25.6928 12.4734L24.3279 14.0759L23.616 14.9062C23.5904 14.9349 23.574 14.9702 23.5686 15.008C23.5632 15.0458 23.5692 15.0842 23.5858 15.1187C23.6024 15.1531 23.6288 15.182 23.6619 15.2018C23.695 15.2216 23.7332 15.2314 23.7718 15.2301H30.887C31.9738 15.2301 33.3429 16.1434 33.2629 17.53C33.2607 18.1603 33.0056 18.7641 32.5534 19.2097C32.1012 19.6554 31.4885 19.9067 30.849 19.9089H19.7067C18.9737 19.9089 17.0021 19.9878 16.4503 18.3064C16.3329 17.955 16.3169 17.5785 16.404 17.2187C16.5644 16.6866 16.8181 16.1864 17.1538 15.7407C17.7141 14.9104 18.3207 14.0801 18.9189 13.2747C19.6898 12.2202 20.4818 11.1989 21.2611 10.1236C21.2888 10.0886 21.3038 10.0455 21.3038 10.0011C21.3038 9.95678 21.2888 9.91368 21.2611 9.87868L18.4302 6.55742C18.4118 6.53334 18.3879 6.51381 18.3605 6.50037C18.3331 6.48692 18.3029 6.47992 18.2723 6.47992C18.2416 6.47992 18.2114 6.48692 18.184 6.50037C18.1566 6.51381 18.1327 6.53334 18.1143 6.55742C17.356 7.56625 14.0365 12.0333 13.3287 12.9384C12.621 13.8434 10.877 13.8932 9.9123 12.9384L5.48484 8.55848C5.45655 8.53051 5.42048 8.51145 5.38119 8.50372C5.3419 8.49599 5.30117 8.49994 5.26416 8.51506C5.22715 8.53019 5.19553 8.5558 5.17332 8.58866C5.15111 8.62152 5.1393 8.66015 5.1394 8.69963V17.1232C5.14982 17.7209 4.97021 18.3069 4.62573 18.799C4.28125 19.2911 3.78917 19.6647 3.21844 19.8674C2.85377 19.9924 2.46403 20.0298 2.08173 19.9763C1.69943 19.9228 1.33565 19.78 1.02071 19.5598C0.70578 19.3396 0.448823 19.0484 0.271268 18.7105C0.0937132 18.3726 0.000705322 17.9977 0 17.6172V2.47228C0.0253814 1.92649 0.224654 1.40247 0.569503 0.974675C0.914352 0.546881 1.38723 0.237072 1.92096 0.0892728C2.37877 -0.0309286 2.8607 -0.0297259 3.31789 0.0927586C3.77508 0.215243 4.1913 0.454656 4.52436 0.786737L11.332 7.50398C11.3523 7.52438 11.377 7.54012 11.4042 7.55008C11.4315 7.56003 11.4606 7.56396 11.4895 7.56158C11.5185 7.55921 11.5465 7.55058 11.5717 7.53632C11.5969 7.52206 11.6186 7.50252 11.6353 7.47907L16.4714 0.882224C16.6948 0.614417 16.975 0.397995 17.2923 0.248114C17.6096 0.0982325 17.9562 0.0185155 18.3081 0.0145452H30.887C31.2312 0.0151045 31.5714 0.0880957 31.8847 0.228638C32.198 0.369181 32.4773 0.574035 32.7038 0.829499C32.9303 1.08496 33.0988 1.38515 33.1982 1.70998C33.2975 2.03481 33.3253 2.37679 33.2797 2.71307C33.1911 3.2964 32.8908 3.82825 32.4345 4.20997C31.9782 4.59169 31.3969 4.79737 30.7985 4.78885H23.755C23.7196 4.7897 23.6851 4.79989 23.655 4.81835C23.625 4.83681 23.6005 4.86287 23.5842 4.89382C23.5678 4.92477 23.5602 4.95947 23.5621 4.99431C23.564 5.02915 23.5753 5.06286 23.5949 5.09192Z" fill="#9CA3AF"/>
  </svg>
);

export default function MintPage({ params }: { params: { id: string } }) {
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
  const [forceUpdate, setForceUpdate] = useState(0);
  const [tempQuantity, setTempQuantity] = useState('1');
  const [isConnecting, setIsConnecting] = useState(false);
  const [tradingEnabled, setTradingEnabled] = useState(false);

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

  // Add this function to fetch trading status
  const fetchTradingStatus = async () => {
    try {
      if (!collection?.contract_address) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        collection.contract_address,
        MyNFTCollection.abi,
        provider
      );

      const isEnabled = await contract.tradingEnabled();
      setTradingEnabled(isEnabled);
      
      console.log('📊 Trading enabled status:', isEnabled);
    } catch (error) {
      console.error('Error fetching trading status:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCollection();
        await fetchTotalMinted();
        await fetchTradingStatus();
      } catch (error) {
        console.error('Error:', error);
      }
    };

    // Only fetch collection data if we don't have it
    if (!collection) {
      fetchData();
    }

    // Add an interval to refresh the total minted count
    const interval = setInterval(fetchTotalMinted, 5000); // Refresh every 5 seconds

    const timeout = setTimeout(() => {
      if (loading) {
        toast.error('Loading took too long. Please try again.');
        setLoading(false);
      }
    }, 10000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
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
        const secondPhase = collection.phases.phases[1];
        
        // Check if public phase is sold out
        if (totalMinted >= firstPhase.supply) {
            setCurrentPhase(1);
            setPricePerNFT(secondPhase.price);
            console.log('Switching to GTD phase, total minted:', totalMinted);
        } else {
            setCurrentPhase(0);
            setPricePerNFT(firstPhase.price);
            console.log('Staying in public phase, total minted:', totalMinted);
        }
    }
}, [collection, totalMinted]); // Make sure totalMinted is a dependency

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
    if (isConnecting) {
      console.log('Connection already in progress...');
      return;
    }

    try {
      setIsConnecting(true);
      
      if (!window.ethereum) {
        throw new Error('MetaMask not detected');
      }

      const provider = new BrowserProvider(window.ethereum);
      
      try {
        await provider.send('eth_requestAccounts', []);
      } catch (error: any) {
        if (error?.code === -32002) {
          toast.error('Please check your MetaMask - connection request pending');
          return;
        }
        throw error;
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      console.log('[DEBUG] Connected wallet:', address);
      setAddress(address);
      
      // Fetch minted count after successful connection
      await fetchMintedCount();

    } catch (error) {
      console.error('[DEBUG] Error connecting wallet:', error);
      toast.error(`Wallet connection failed: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const ensureWalletConnected = async () => {
    if (isConnecting) {
      throw new Error('Connection already in progress. Please wait.');
    }

    if (!window.ethereum) {
      throw new Error('Please install MetaMask!');
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      
      // Only request accounts if we don't have an address
      if (!address) {
        try {
          await provider.send("eth_requestAccounts", []);
        } catch (error: any) {
          if (error?.code === -32002) {
            throw new Error('Please check MetaMask - connection request pending');
          }
          throw error;
        }
      }

      const network = await provider.getNetwork();
      console.log('Connected to network:', {
        name: network.name,
        chainId: Number(network.chainId),
      });
      
      return provider;
    } catch (error) {
      console.error('[DEBUG] ensureWalletConnected error:', error);
      throw error;
    }
  };

  const fetchCollection = async (retryCount = 0) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/collections/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch collection');
      }
      
      const data = await response.json();
      console.log('Raw collection data:', JSON.stringify(data, null, 2));
      
      // Process and set collection data
      if (!data || !data.id) {
        throw new Error('Invalid collection data');
      }

      // Process phases
      if (!data.phases) {
        data.phases = { phases: [] };
      } else if (Array.isArray(data.phases)) {
        data.phases = { phases: data.phases };
      }

      if (!Array.isArray(data.phases.phases)) {
        data.phases.phases = [];
      }

      setCollection(data);
      console.log('Processed collection data:', data);

      // Remove the automatic wallet connection attempt
      // Only fetch contract data if we already have an address
      if (data.contract_address && address) {
        const provider = new BrowserProvider(window.ethereum);
        const contract = await fetchContract(data.contract_address, provider);
        console.log('[DEBUG] Contract initialized:', contract.address);
      }

    } catch (error) {
      console.error('[DEBUG] Error fetching collection:', error);
      if (retryCount < 3) {
        console.log(`Retrying fetch... Attempt ${retryCount + 1}`);
        return fetchCollection(retryCount + 1);
      }
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

  const getTotalSupply = useCallback(() => {
    if (!collection?.phases?.phases) return 0;
    return collection.phases.phases.reduce((total, phase) => total + phase.supply, 0);
  }, [collection]);

  const getProgressPercentage = () => {
    if (!collection?.phases?.phases?.[currentPhase]) return 0;
    const phase = collection.phases.phases[currentPhase];
    return (totalMinted / phase.supply) * 100;
  }

  const isWhitelistedForCurrentPhase = () => {
    if (!address || !collection?.phases?.phases?.[currentPhase]) {
        console.log('Whitelist check failed: No address or phase data');
        return false;
    }

    const phase = collection.phases.phases[currentPhase];
    console.log('Current phase:', phase);
    console.log('Is whitelist phase?', phase.is_whitelist);
    console.log('Whitelist addresses:', phase.whitelists);
    console.log('User address:', address.toLowerCase());
    
    if (!phase.whitelists || !Array.isArray(phase.whitelists)) {
        console.log('No whitelist array found');
        return false;
    }

    const isWhitelisted = phase.whitelists.includes(address.toLowerCase());
    console.log('Is user whitelisted?', isWhitelisted);
    
    return isWhitelisted;
  };

  const handleMint = async () => {
    try {
        // Ensure the wallet is connected
        if (!address) {
            await connectWallet();
            if (!address) {
                throw new Error('Please connect your wallet to proceed.');
            }
        }

        // Initialize the provider and contract
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
            collection.contract_address,
            MyNFTCollection.abi,
            signer
        );

        // Get the current phase
        const phase = collection.phases.phases[currentPhase];
        if (!phase) {
            throw new Error('Invalid phase');
        }

        // Convert price to Wei, handling free mints
        const priceInWei = phase.price === 0 ? 
            BigInt(0) : 
            parseEther(phase.price.toString());
        
        const totalValue = priceInWei * BigInt(quantity);

        console.log('Minting with params:', {
            quantity,
            priceInWei: priceInWei.toString(),
            totalValue: totalValue.toString()
        });

        // Send the mint transaction
        const tx = await contract.mint(quantity, priceInWei, {
            value: totalValue,
            gasLimit: 300000,
        });

        await tx.wait();
        await fetchTradingStatus();
        await fetchTotalMinted();
        await fetchMintedCount();
        
        toast.success('Successfully minted!');

    } catch (error) {
        console.error('[DEBUG] Minting error:', error);
        toast.error(error.message || 'Minting failed. Please try again.');
    }
  };

  const isMintingDisabled = () => {
    // Log wallet connection status
    console.log('Wallet status:', address ? 'Connected' : 'Not connected');
    if (!address) {
      console.log('🔴 Minting disabled: No wallet connected');
      return true;
    }

    // Check if collection and phases data is valid
    if (!collection?.phases || !Array.isArray(collection.phases.phases) || currentPhase < 0) {
      console.log('🔴 Minting disabled: Invalid phase data');
      return true;
    }

    const phase = collection.phases.phases[currentPhase];
    console.log('Current phase:', phase);

    // Check phase start time
    const now = Date.now();
    const startTime = phase.start ? new Date(phase.start).getTime() : 0;
    if (startTime > now) {
      const timeLeft = startTime - now;
      console.log(`🔴 Minting disabled: Phase starts in ${formatCountdown(timeLeft)}`);
      return true;
    }

    // Check whitelist status
    if (phase.is_whitelist) {
      const whitelistCheck = isWhitelistedForCurrentPhase();
      console.log('Whitelist check:', whitelistCheck ? '✅ Eligible' : '🔴 Not eligible');
      if (!whitelistCheck) {
        console.log('🔴 Minting disabled: Not whitelisted for this phase');
        return true;
      }
    }

    // Check max per wallet
    if (mintedCountForWallet >= phase.max_per_wallet) {
      console.log(`🔴 Minting disabled: Max per wallet (${phase.max_per_wallet}) reached`);
        console.log('Minting disabled: Max per wallet reached');
        return true;
    }

    if (totalMinted >= phase.supply) {
        console.log('Minting disabled: Supply reached');
        return true;
    }

    return false;
  };

  const formatCountdown = (timeLeft: number) => {
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const progressBar = useMemo(() => (
    <div className="w-full bg-gray-700 rounded-full h-4 mt-4">
      <div
        className="bg-[#0154fa] h-4 rounded-full"
        style={{ width: `${(totalMinted / getTotalSupply()) * 100}%` }}
      />
    </div>
  ), [totalMinted, getTotalSupply]);

  const getMintButtonText = () => {
    if (!collection?.phases?.phases?.[currentPhase]) return "Loading...";
    
    const phase = collection.phases.phases[currentPhase];
    const now = Date.now();
    const startTime = phase.start ? new Date(phase.start).getTime() : 0;

    // Check start time first
    if (startTime > now) {
      const timeLeft = startTime - now;
      return `Minting Starts in: ${formatCountdown(timeLeft)}`;
    }

    // Check if whitelists need to be loaded first
    if (phase.is_whitelist && phase.whitelists === null) {
      console.log('🔄 Whitelists not yet loaded');
      return "Whitelists Not Yet Loaded";
    }

    // Then check wallet connection
    if (!address) return "Connect Wallet";
    if (isFetchingMintedCount) return "Loading...";
    
    if (totalMinted >= phase.supply) {
      return "Sold Out";
    }

    if (mintedCountForWallet >= phase.max_per_wallet) {
      return "Max Per Wallet Minted";
    }

    if (isMinting) return "Minting...";
    
    if (phase.is_whitelist && !isWhitelistedForCurrentPhase()) {
      return "Not Whitelisted for this Phase";
    }
    
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
        
        // GTD phase is active if public phase is sold out
        return firstPhaseSoldOut;
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

  const getEligibilityText = (phase: any) => {
    // First check if whitelists need to be loaded
    if (phase.is_whitelist && phase.whitelists === null) {
      return "Whitelists Not Yet Loaded";
    }

    // Then check wallet connection
    if (!address) {
      return "Connect Wallet";
    }

    if (!phase.is_whitelist) {
      return "Public";
    }

    // If whitelists array is empty (but not null), then we're still loading
    if (Array.isArray(phase.whitelists) && phase.whitelists.length === 0) {
      return "Loading Whitelist...";
    }

    const isEligible = phase.whitelists
      .map((addr: string) => addr.toLowerCase())
      .includes(address.toLowerCase());

    return isEligible ? "Eligible" : "Not Eligible";
  };

  useEffect(() => {
    if (!collection?.phases?.phases?.[currentPhase]) return;
    
    const phase = collection.phases.phases[currentPhase];
    const startTime = phase.start ? new Date(phase.start).getTime() : 0;
    const now = Date.now();

    if (startTime > now) {
      const timer = setInterval(() => {
        setForceUpdate(prev => prev + 1); // Add this state to force re-render
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [collection, currentPhase]);

  const fetchTotalMinted = async () => {
    try {
      if (!collection?.contract_address) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        collection.contract_address,
        MyNFTCollection.abi,
        provider
      );

      // Use the contract's totalSupply function
      const totalMinted = await contract.totalSupply();
      setTotalMinted(Number(totalMinted));
      
      console.log('📊 Total minted from contract:', totalMinted.toString());
    } catch (error) {
      console.error('Error fetching total minted:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#0154fa] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 py-20 text-center">
        <button 
          onClick={() => fetchCollection()} 
          className="bg-[#0154fa] text-white px-4 py-2 rounded-md mt-4"
        >
          Retry Loading Collection
        </button>
      </div>
    );
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
    <div className="min-h-screen bg-gray-900 text-gray-100 py-12 md:py-20">
      <div className="absolute top-2 md:top-4 right-2 md:right-4 z-20">
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className={`bg-[#0154fa] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-md text-sm md:text-base ${
            isConnecting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isConnecting 
            ? "Connecting..." 
            : address 
              ? `${address.slice(0, 6)}...${address.slice(-4)}` 
              : "Connect Wallet"
          }
        </button>
      </div>
      <DreamLayers />
      <div className="max-w-6xl mx-auto px-3 md:px-4 relative z-10">
        <Link href="/" className="text-[#0154fa] hover:underline mb-4 md:mb-8 inline-block text-sm md:text-base">
          ← Back to Launchpad
        </Link>
        <div className="grid md:grid-cols-2 gap-6 md:gap-12">
          <div>
            <motion.img
              src={collection.image}
              alt={collection.name}
              className="w-full rounded-lg shadow-2xl mb-4 md:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            />
            <div className="mt-4 md:mt-6 flex justify-center space-x-4 md:space-x-6">
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
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h1 className="text-2xl md:text-4xl font-bold text-[#0154fa]">
                {collection.name}
              </h1>
              <div className="flex items-center gap-3">
                {/* Etherscan Button */}
                <a 
                  href={`https://apescan.io/address/${collection.contract_address}#code`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <div className="w-5 h-5">
                    <EtherLogo />
                  </div>
                </a>

                {/* ME Button */}
                <a 
                  href={`https://magiceden.io/collections/apechain/${collection.contract_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <div className="w-7 h-5">
                    <MeLogo />
                  </div>
                </a>

                {/* Mintify Button */}
                <a 
                  href={`https://mintify.xyz/nft/apechain/${collection.contract_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <div className="w-5 h-5">
                    <img 
                      src="/mintify.png" 
                      alt="Mintify" 
                      className="w-full h-full object-contain opacity-60"
                    />
                  </div>
                </a>
              </div>
            </div>
            <div className="flex items-center mb-4 md:mb-6">
              {collection.artist_image && (
                <img
                  src={collection.artist_image}
                  alt={collection.artist}
                  className="w-6 h-6 md:w-10 md:h-10 rounded-full mr-2 object-cover"
                />
              )}
              <p className="text-base md:text-xl">by {collection.artist}</p>
            </div>
            <p className="mb-4 md:mb-6 text-sm md:text-base">{collection.description}</p>
            <div className="bg-gray-800 p-4 md:p-6 rounded-lg mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Mint Details</h2>
              
              <p className="text-[#0154fa] text-lg md:text-xl mb-3 md:mb-4">
                {totalMinted} / {getTotalSupply()} NFTs Minted
              </p>
              
              {progressBar}

              <div className="bg-gray-900 rounded-lg p-3 md:p-4 mt-3 md:mt-4 mb-3 md:mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-400">Current Phase</span>
                  <span>{phase?.name || 'Public'}</span>
                </div>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-400">Price</span>
                  <span className="text-[#0154fa]">{phase?.price || 12} APE</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Max Per Wallet</span>
                  <span>{phase?.max_per_wallet || 5}</span>
                </div>
              </div>

              <div className="mt-3 md:mt-4">
                <p className="text-gray-400 mb-2 text-sm md:text-base">Amount to mint:</p>
                <input
                  type="text"
                  value={tempQuantity}
                  onChange={(e) => {
                    const input = e.target.value;
                    const value = parseInt(input);
                    const maxAllowed = phase?.max_per_wallet || 5;
                    
                    // Only allow numbers 1-5 (or max_per_wallet)
                    if (input === '' || (value >= 1 && value <= maxAllowed)) {
                      setTempQuantity(input);
                      if (!isNaN(value)) {
                        setQuantity(value);
                      }
                    }
                  }}
                  onBlur={() => {
                    const value = parseInt(tempQuantity);
                    const maxAllowed = phase?.max_per_wallet || 5;
                    
                    if (isNaN(value) || value < 1) {
                      setQuantity(1);
                      setTempQuantity('1');
                    } else if (value > maxAllowed) {
                      setQuantity(maxAllowed);
                      setTempQuantity(maxAllowed.toString());
                    }
                  }}
                  className="bg-gray-900 text-white px-3 py-2 rounded w-20 focus:outline-none focus:ring-1 focus:ring-[#0154fa] text-center"
                />

                <button
                  onClick={handleMint}
                  disabled={isButtonDisabled || isMinting || isFetchingMintedCount}
                  className="w-full bg-[#0154fa] text-white py-2.5 md:py-3 rounded font-semibold text-base md:text-lg disabled:opacity-50 mt-3"
                >
                  {getMintButtonText()}
                </button>
              </div>
            </div>

            {/* Add the trading status warning */}
            {!tradingEnabled && (
              <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 mb-4 md:mb-6">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 className="text-yellow-500 font-semibold mb-1">Trading Locked</h3>
                    <p className="text-yellow-100/70 text-sm">
                      Trading for this collection is currently locked and will be automatically enabled once the mint is completed. 
                      You won't be able to transfer or sell your NFTs until then.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 md:mt-12">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Mint Phases</h2>
          <div className="space-y-3 md:space-y-4">
            {Array.isArray(collection?.phases?.phases) && collection.phases.phases.map((phase, index) => (
              <div
                key={index}
                className={`bg-gray-800 p-3 md:p-4 rounded-lg shadow-md ${
                  isPhaseActive(phase) ? 'border-2 border-[#0154fa]' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg md:text-xl font-semibold text-[#0154fa]">
                    {phase.name}
                    {isPhaseActive(phase) && (
                      <span className="ml-2 text-xs md:text-sm bg-[#0154fa] text-white px-2 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </h3>
                  {!phase.name.toLowerCase().includes('public') && phase.is_whitelist && (
                    <span className={`px-2 py-1 rounded text-sm ${
                      getEligibilityText(phase) === "Whitelists Not Yet Loaded"
                        ? "bg-gray-600 text-white"
                        : getEligibilityText(phase) === "Connect Wallet"
                        ? "bg-[#f4c721] text-white"
                        : getEligibilityText(phase) === "Eligible"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}>
                      {getEligibilityText(phase)}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm md:text-base">
                  Price: {phase.price === 0 ? "FREE" : `${phase.price} APE`}
                </p>
                <p className="text-gray-400 text-sm md:text-base">
                  {phase.is_whitelist ? "Whitelist Only" : "Public Sale"}
                </p>
                <p className="text-gray-400 text-sm md:text-base mt-2">Supply: {phase.supply}</p>
                <div className="mt-4">
                  {renderCountdown(phase)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
