"use client"

import { useAppKit, useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react"
import { bittensor } from "@/lib/wagmi"

export function ConnectButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()

  const isCorrectNetwork = isConnected && chainId === bittensor.id

  if (!isConnected) {
    return (
      <button
        onClick={() => open({ view: "Connect" })}
        className="px-3 py-1.5 text-xs font-medium bg-white text-black rounded-full hover:bg-gray-100 transition-colors sm:px-4 sm:text-sm"
      >
        <span className="hidden sm:inline">Connect Wallet</span>
        <span className="sm:hidden">Connect</span>
      </button>
    )
  }

  if (!isCorrectNetwork) {
    return (
      <button
        onClick={() => open({ view: "Account" })}
        className="px-3 py-1.5 text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full hover:bg-yellow-500/30 transition-colors sm:px-4 sm:text-sm"
      >
        <span className="hidden sm:inline">Wrong Network</span>
        <span className="sm:hidden">Wrong Net</span>
      </button>
    )
  }

  return (
    <button
      onClick={() => open({ view: "Account" })}
      className="px-3 py-1.5 text-xs font-medium bg-transparent text-white border border-white/20 rounded-full hover:bg-white/10 transition-colors font-mono sm:px-4 sm:text-sm"
    >
      {address?.slice(0, 4)}...{address?.slice(-2)}
    </button>
  )
}
