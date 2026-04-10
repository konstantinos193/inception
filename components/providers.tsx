"use client"

import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createAppKit } from "@reown/appkit/react"
import { wagmiConfig, wagmiAdapter, bittensor, projectId } from "@/lib/wagmi"

const queryClient = new QueryClient()

// Handle wallet provider conflicts
if (typeof window !== 'undefined') {
  // Prevent multiple wallet extensions from conflicting
  let originalEthereum = window.ethereum
  Object.defineProperty(window, 'ethereum', {
    set: function(value) {
      if (!originalEthereum) {
        originalEthereum = value
      }
    },
    get: function() {
      return originalEthereum
    },
    configurable: true
  })
}

try {
  createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [bittensor],
  defaultNetwork: bittensor,
  metadata: {
    name: "Elevate",
    description: "A Pre-Sale Ordinals & Runes Launchpad on Bittensor",
    url: "https://elevate.chunkiesgaming.com",
    icons: ["https://elevate.chunkiesgaming.com/logo.png"],
  },
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#ffffff",
    "--w3m-color-mix": "#000000",
    "--w3m-color-mix-strength": 30,
    "--w3m-border-radius-master": "4px",
    "--w3m-font-family": "system-ui, sans-serif",
  },
})
} catch (error) {
  console.warn("Wallet initialization failed:", error)
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
