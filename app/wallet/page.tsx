"use client"

import Link from "next/link"
import { useAppKit } from "@reown/appkit/react"
import { ArrowLeft, Wallet as WalletIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WalletPage() {
  const { open } = useAppKit()

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center space-x-2 mb-2">
            <WalletIcon className="h-6 w-6 text-white" />
            <h1 className="text-3xl font-bold">TAO Wallet</h1>
          </div>
          <p className="text-gray-400">
            Connect your wallet to interact with the Bittensor network
          </p>
        </div>
        <Button onClick={() => open()} className="w-full">
          Connect Wallet
        </Button>
      </div>
    </div>
  )
}
