"use client"

import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createAppKit } from "@reown/appkit/react"
import { wagmiConfig, wagmiAdapter, bittensor, projectId } from "@/lib/wagmi"

// Extend Window interface to include our custom property
declare global {
  interface Window {
    _ethereumOriginal?: any
  }
}

const queryClient = new QueryClient()

// Handle wallet provider conflicts
if (typeof window !== 'undefined') {
  // Store the first available provider and prevent conflicts
  if (!window.ethereum) {
    // Wait for the first provider to be available
    const checkProvider = () => {
      if (window.ethereum && !window._ethereumOriginal) {
        window._ethereumOriginal = window.ethereum
      }
    }
    
    // Check immediately and on interval
    checkProvider()
    const interval = setInterval(checkProvider, 100)
    
    // Clean up after 2 seconds
    setTimeout(() => clearInterval(interval), 2000)
  }
}

// Initialize wallet with delay to avoid conflicts
setTimeout(() => {
  try {
    createAppKit({
      adapters: [wagmiAdapter],
      projectId,
      networks: [bittensor],
      defaultNetwork: bittensor,
      metadata: {
        name: "Elevate",
        description: "A Pre-Sale Ordinals & Runes Launchpad on Bittensor",
        url: "https://elevateart.xyz",
        icons: ["/logo.webp"],
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
    // Fallback: continue without wallet initialization
  }
}, 100)

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
