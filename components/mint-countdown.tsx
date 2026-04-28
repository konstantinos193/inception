"use client"

import { useEffect, useState } from "react"
import { ethers } from "ethers"

// RPC URL for Bittensor network
const RPC_URL = "https://lite.chain.opentensor.ai"

// Contract ABI for phase data
const CONTRACT_ABI = [
    "function getActivePhaseIndex() view returns (int256)",
    "function phases(uint256) view returns (tuple(string name, uint64 startTime, uint64 endTime, uint256 price, uint32 maxPerWallet, uint32 maxSupply, uint32 minted, address signer, bool paused))",
    "function totalMinted() view returns (uint256)",
    "function maxSupply() view returns (uint256)",
    "function globalMaxPerWallet() view returns (uint256)"
]

interface MintPhase {
    name: string
    startTime: bigint
    endTime: bigint
    price: bigint
    maxPerWallet: number
    maxSupply: number
    minted: number
    signer: string
    paused: boolean
}

interface MintCountdownProps {
    contractAddress: string
}

export function MintCountdown({ contractAddress }: MintCountdownProps) {
    const [phase, setPhase] = useState<MintPhase | null>(null)
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })
    const [mintStatus, setMintStatus] = useState<'loading' | 'upcoming' | 'live' | 'ended'>('loading')
    const [totalMinted, setTotalMinted] = useState(0)
    const [maxSupply, setMaxSupply] = useState(0)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchPhaseData = async () => {
            try {
                const provider = new ethers.JsonRpcProvider(RPC_URL)
                const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider)

                // Get active phase
                const activePhaseIndex = await contract.getActivePhaseIndex()
                
                if (activePhaseIndex === -1) {
                    // No active phase, check for upcoming phases
                    const totalPhases = await contract.phases?.length || 0
                    if (totalPhases > 0) {
                        // Get first phase (upcoming)
                        const phaseData = await contract.phases(0)
                        setPhase({
                            name: phaseData.name,
                            startTime: phaseData.startTime,
                            endTime: phaseData.endTime,
                            price: phaseData.price,
                            maxPerWallet: phaseData.maxPerWallet,
                            maxSupply: phaseData.maxSupply,
                            minted: phaseData.minted,
                            signer: phaseData.signer,
                            paused: phaseData.paused
                        })
                        setMintStatus('upcoming')
                    } else {
                        setMintStatus('ended')
                        setError('No mint phases configured')
                    }
                } else {
                    // Active phase found
                    const phaseData = await contract.phases(activePhaseIndex)
                    const phaseObj = {
                        name: phaseData.name,
                        startTime: phaseData.startTime,
                        endTime: phaseData.endTime,
                        price: phaseData.price,
                        maxPerWallet: phaseData.maxPerWallet,
                        maxSupply: phaseData.maxSupply,
                        minted: phaseData.minted,
                        signer: phaseData.signer,
                        paused: phaseData.paused
                    }
                    setPhase(phaseObj)
                    
                    // Check if phase is live or ended
                    const now = Math.floor(Date.now() / 1000)
                    const endTime = Number(phaseData.endTime)
                    
                    if (phaseData.paused) {
                        setMintStatus('upcoming')
                    } else if (endTime > 0 && now > endTime) {
                        setMintStatus('ended')
                    } else {
                        setMintStatus('live')
                    }
                }

                // Get supply info
                const [total, max] = await Promise.all([
                    contract.totalMinted(),
                    contract.maxSupply()
                ])
                setTotalMinted(Number(total))
                setMaxSupply(Number(max))

            } catch (err) {
                console.error('Error fetching phase data:', err)
                setError('Failed to load mint data')
                setMintStatus('ended')
            }
        }

        fetchPhaseData()
        const interval = setInterval(fetchPhaseData, 10000) // Refresh every 10 seconds
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (!phase || mintStatus !== 'upcoming') return

        const interval = setInterval(() => {
            const now = Math.floor(Date.now() / 1000)
            const startTime = Number(phase.startTime)
            const difference = startTime - now

            if (difference <= 0) {
                setMintStatus('live')
                clearInterval(interval)
                return
            }

            const d = Math.floor(difference / (60 * 60 * 24))
            const h = Math.floor((difference % (60 * 60 * 24)) / (60 * 60))
            const m = Math.floor((difference % (60 * 60)) / 60)
            const s = Math.floor(difference % 60)

            setTimeLeft({ days: d, hours: h, minutes: m, seconds: s })
        }, 1000)

        return () => clearInterval(interval)
    }, [phase, mintStatus])

    if (mintStatus === 'loading') {
        return (
            <div className="w-full text-center">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded mb-4"></div>
                    <div className="grid grid-cols-4 gap-2">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="h-20 bg-gray-700 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-full text-center">
                <div className="text-red-500">{error}</div>
            </div>
        )
    }

    if (mintStatus === 'live') {
        return (
            <div className="w-full">
                <h3 className="text-center text-2xl mb-4 text-green-400 font-bold">🔥 MINT LIVE 🔥</h3>
                <div className="text-center mb-4">
                    <span className="text-gray-400">Phase: </span>
                    <span className="text-white font-semibold">{phase?.name}</span>
                </div>
                <div className="text-center mb-4">
                    <span className="text-gray-400">Price: </span>
                    <span className="text-white font-semibold">
                        {phase ? ethers.formatEther(phase.price) : '0'} TAO
                    </span>
                </div>
                <div className="text-center">
                    <span className="text-gray-400">Progress: </span>
                    <span className="text-white font-semibold">
                        {totalMinted} / {maxSupply} minted
                    </span>
                </div>
            </div>
        )
    }

    if (mintStatus === 'ended') {
        return (
            <div className="w-full text-center">
                <h3 className="text-center text-2xl mb-4 text-gray-400">MINT ENDED</h3>
                <div className="text-center">
                    <span className="text-gray-400">Total Minted: </span>
                    <span className="text-white font-semibold">{totalMinted} / {maxSupply}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full">
            <h3 className="text-center text-xl mb-6 text-gray-400">
                {phase?.name || "MINT"} Starts In
            </h3>
            <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-xl mx-auto">
                <TimeUnit value={timeLeft.days} label="DAYS" />
                <TimeUnit value={timeLeft.hours} label="HOURS" />
                <TimeUnit value={timeLeft.minutes} label="MINUTES" />
                <TimeUnit value={timeLeft.seconds} label="SECONDS" />
            </div>
            {phase && (
                <div className="text-center mt-6">
                    <div className="text-gray-400">
                        <span>Price: </span>
                        <span className="text-white font-semibold">{ethers.formatEther(phase.price)} TAO</span>
                    </div>
                    <div className="text-gray-400 mt-2">
                        <span>Max per wallet: </span>
                        <span className="text-white font-semibold">
                            {phase.maxPerWallet > 0 ? phase.maxPerWallet : '50'} tokens
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}

interface TimeUnitProps {
    value: number
    label: string
}

function TimeUnit({ value, label }: TimeUnitProps) {
    return (
        <div className="flex flex-col items-center">
            <div className="w-full aspect-square bg-black bg-opacity-50 border border-orange-500/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent"></div>
                <span className="text-2xl md:text-4xl font-bold text-white relative z-10">
                    {value.toString().padStart(2, "0")}
                </span>
            </div>
            <span className="text-xs mt-2 text-gray-400">{label}</span>
        </div>
    )
}
