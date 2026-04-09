import { defineChain, http } from "viem"
import { sepolia } from "viem/chains"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { createBittensorTransport } from "./rpc-manager"

export { sepolia }

export const bittensor = defineChain({
  id: 964,
  name: "Bittensor",
  nativeCurrency: {
    name: "TAO",
    symbol: "TAO",
    decimals: 9,
  },
  rpcUrls: {
    default: { http: ["https://lite.chain.opentensor.ai", "https://bittensor-lite-public.nodies.app"] },
  },
  blockExplorers: {
    default: {
      name: "TaoStats",
      url: "https://taostats.io",
    },
  },
  testnet: false,
})

export const bittensorTestnet = defineChain({
  id: 945,
  name: "Bittensor Testnet",
  nativeCurrency: {
    name: "TAO",
    symbol: "tTAO",
    decimals: 9,
  },
  rpcUrls: {
    default: { http: ["https://test.chain.opentensor.ai", "https://bittensor-testnet-public.nodies.app"] },
  },
  blockExplorers: {
    default: {
      name: "TaoStats Testnet",
      url: "https://test.taostats.io",
    },
  },
  testnet: true,
})

// Hardhat local network for development
export const hardhatLocal = defineChain({
  id: 31337,
  name: "Hardhat",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
  testnet: true,
})

export const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  "b8a1daa2bb4f8b9a8d3e2f1c0e9d7b6a"

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [sepolia, bittensor, bittensorTestnet, hardhatLocal],
  transports: {
    [bittensor.id]: http("https://lite.chain.opentensor.ai"),
    [bittensorTestnet.id]: http("https://test.chain.opentensor.ai"),
    [hardhatLocal.id]: http("http://127.0.0.1:8545"),
  },
})

export const wagmiConfig = wagmiAdapter.wagmiConfig

// Note: Enhanced transports with backend RPC providers are initialized in rpc-manager.ts
// The fallback HTTP transports above will be used if backend is unreachable
