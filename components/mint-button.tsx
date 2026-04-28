"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"

// RPC URL for Bittensor network
const RPC_URL = "https://lite.chain.opentensor.ai"

// Contract ABI for minting
const CONTRACT_ABI = [
    "function getActivePhaseIndex() view returns (int256)",
    "function phases(uint256) view returns (tuple(string name, uint64 startTime, uint64 endTime, uint256 price, uint32 maxPerWallet, uint32 maxSupply, uint32 minted, address signer, bool paused))",
    "function totalMinted() view returns (uint256)",
    "function maxSupply() view returns (uint256)",
    "function globalMaxPerWallet() view returns (uint256)",
    "function mint(uint256 phaseIndex, uint256 quantity, bytes calldata signature, uint256 maxAllowance) external payable",
    "function phaseMintsOf(address _wallet, uint256 _phaseIndex) view returns (uint256)",
    "function totalMints(address) view returns (uint256)"
]

interface MintButtonProps {
    contractAddress: string
    onMintSuccess?: (tokenIds: number[]) => void
}

export function MintButton({ contractAddress, onMintSuccess }: MintButtonProps) {
    const [isConnected, setIsConnected] = useState(false)
    const [account, setAccount] = useState<string | null>(null)
    const [mintQuantity, setMintQuantity] = useState(1)
    const [isMinting, setIsMinting] = useState(false)
    const [mintStatus, setMintStatus] = useState<'loading' | 'upcoming' | 'live' | 'ended'>('loading')
    const [phase, setPhase] = useState<any>(null)
    const [walletMints, setWalletMints] = useState(0)
    const [totalMinted, setTotalMinted] = useState(0)
    const [maxSupply, setMaxSupply] = useState(0)
    const [error, setError] = useState<string | null>(null)

    // Check wallet connection
    useEffect(() => {
        const checkConnection = async () => {
            if (typeof window !== 'undefined' && (window as any).ethereum) {
                try {
                    const accounts = await (window as any).ethereum.request({ 
                        method: 'eth_accounts' 
                    })
                    if (accounts.length > 0) {
                        setAccount(accounts[0])
                        setIsConnected(true)
                    }
                } catch (error) {
                    console.error('Error checking accounts:', error)
                }
            }
        }

        checkConnection()
        
        if (typeof window !== 'undefined' && (window as any).ethereum) {
            (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0])
                    setIsConnected(true)
                } else {
                    setAccount(null)
                    setIsConnected(false)
                }
            })
        }
    }, [])

    // Fetch contract data
    useEffect(() => {
        const fetchData = async () => {
            if (!contractAddress) return

            try {
                const provider = new ethers.JsonRpcProvider(RPC_URL)
                const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider)

                // Get active phase
                const activePhaseIndex = await contract.getActivePhaseIndex()
                
                if (activePhaseIndex === -1) {
                    setMintStatus('upcoming')
                    return
                }

                const phaseData = await contract.phases(activePhaseIndex)
                setPhase(phaseData)

                // Check if phase is live
                const now = Math.floor(Date.now() / 1000)
                const endTime = Number(phaseData.endTime)
                
                if (phaseData.paused) {
                    setMintStatus('upcoming')
                } else if (endTime > 0 && now > endTime) {
                    setMintStatus('ended')
                } else {
                    setMintStatus('live')
                }

                // Get supply info
                const [total, max] = await Promise.all([
                    contract.totalMinted(),
                    contract.maxSupply()
                ])
                setTotalMinted(Number(total))
                setMaxSupply(Number(max))

                // Get wallet mints if connected
                if (isConnected && account) {
                    const [phaseMints, totalMints] = await Promise.all([
                        contract.phaseMintsOf(account, activePhaseIndex),
                        contract.totalMints(account)
                    ])
                    setWalletMints(Number(phaseMints))
                }

            } catch (error) {
                console.error('Error fetching contract data:', error)
                setError('Failed to load mint data')
            }
        }

        fetchData()
        const interval = setInterval(fetchData, 10000)
        return () => clearInterval(interval)
    }, [contractAddress, isConnected, account])

    const connectWallet = async () => {
        if (typeof window === 'undefined' || !(window as any).ethereum) {
            setError('MetaMask or compatible wallet required')
            return
        }

        try {
            const accounts = await (window as any).ethereum.request({
                method: 'eth_requestAccounts'
            })
            
            if (accounts.length > 0) {
                setAccount(accounts[0])
                setIsConnected(true)
                setError(null)
            }
        } catch (error: any) {
            setError(error.message || 'Failed to connect wallet')
        }
    }

    const mint = async () => {
        if (!isConnected || !account || !phase || mintStatus !== 'live') return

        setIsMinting(true)
        setError(null)

        try {
            const provider = new ethers.BrowserProvider((window as any).ethereum)
            const signer = await provider.getSigner()
            const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer)

            // Calculate total cost (price + percentage platform fee)
            const pricePerToken = phase.price
            const platformFeeBps = 16 // 0.16% from deploy script
            const platformFeePerToken = (pricePerToken * BigInt(platformFeeBps)) / BigInt(10000)
            const totalCostPerToken = pricePerToken + platformFeePerToken
            const totalCost = totalCostPerToken * BigInt(mintQuantity)

            // Get active phase index
            const activePhaseIndex = await contract.getActivePhaseIndex()

            // Execute mint (public phase, no signature needed)
            const tx = await contract.mint(
                activePhaseIndex,
                mintQuantity,
                "0x", // Empty signature for public phase
                0 // No max allowance needed for public phase
            , {
                value: totalCost
            })

            console.log('Mint transaction submitted:', tx.hash)
            
            const receipt = await tx.wait()
            
            // Extract token IDs from the transaction
            const firstTokenId = Number(receipt.logs[0]?.topics[3] || 1)
            const tokenIds = Array.from(
                { length: mintQuantity }, 
                (_, i) => firstTokenId + i
            )

            setIsMinting(false)
            onMintSuccess?.(tokenIds)

        } catch (error: any) {
            console.error('Mint error:', error)
            setError(error.message || 'Mint failed')
            setIsMinting(false)
        }
    }

    const getMaxMintable = () => {
        if (!phase) return 0
        
        const maxPerPhase = phase.maxPerWallet > 0 ? phase.maxPerWallet : 50
        const remaining = Math.max(0, maxPerPhase - walletMints)
        
        // Also check remaining supply
        const remainingSupply = maxSupply - totalMinted
        
        return Math.min(remaining, remainingSupply)
    }

    const getButtonText = () => {
        if (!isConnected) return "Connect Wallet"
        if (mintStatus === 'loading') return "Loading..."
        if (mintStatus === 'upcoming') return "Mint Not Started"
        if (mintStatus === 'ended') return "Mint Ended"
        if (isMinting) return "Minting..."
        return `Mint ${mintQuantity} Taoist${mintQuantity > 1 ? 's' : ''}`
    }

    const getButtonDisabled = () => {
        if (!isConnected) return false
        if (mintStatus !== 'live') return true
        if (isMinting) return true
        if (getMaxMintable() === 0) return true
        return false
    }

    return (
        <div className="w-full max-w-md mx-auto">
            {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Mint Status Info */}
            {mintStatus === 'live' && phase && (
                <div className="mb-4 text-center space-y-2">
                    <div className="text-gray-400">
                        Price: <span className="text-white font-semibold">
                            {ethers.formatEther(phase.price)} TAO
                        </span>
                    </div>
                    <div className="text-gray-400">
                        You've minted: <span className="text-white font-semibold">
                            {walletMints} / {phase.maxPerWallet > 0 ? phase.maxPerWallet : 50}
                        </span>
                    </div>
                    <div className="text-gray-400">
                        Progress: <span className="text-white font-semibold">
                            {totalMinted} / {maxSupply}
                        </span>
                    </div>
                </div>
            )}

            {/* Quantity Selector */}
            {isConnected && mintStatus === 'live' && getMaxMintable() > 0 && (
                <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-2">Quantity</label>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setMintQuantity(Math.max(1, mintQuantity - 1))}
                            disabled={mintQuantity <= 1}
                            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
                        >
                            -
                        </button>
                        <span className="text-white font-semibold px-4">{mintQuantity}</span>
                        <button
                            onClick={() => setMintQuantity(Math.min(getMaxMintable(), mintQuantity + 1))}
                            disabled={mintQuantity >= getMaxMintable()}
                            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
                        >
                            +
                        </button>
                    </div>
                </div>
            )}

            {/* Main Mint Button */}
            <button
                onClick={isConnected ? mint : connectWallet}
                disabled={getButtonDisabled()}
                className="w-full py-3 px-6 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {getButtonText()}
            </button>

            {/* Help Text */}
            {isConnected && mintStatus === 'live' && getMaxMintable() === 0 && (
                <p className="text-center text-gray-400 text-sm mt-2">
                    You've reached the mint limit for this phase
                </p>
            )}
        </div>
    )
}
