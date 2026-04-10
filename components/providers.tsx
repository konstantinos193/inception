"use client"

import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createAppKit } from "@reown/appkit/react"
import { wagmiConfig, wagmiAdapter, bittensor, projectId } from "@/lib/wagmi"

const queryClient = new QueryClient()

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [bittensor],
  defaultNetwork: bittensor,
  metadata: {
    name: "Elevate",
    description: "TAO EVM NFT Launchpad — mint and collect on Bittensor",
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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
