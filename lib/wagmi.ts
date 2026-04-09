import { defineChain, http } from "viem"
import { sepolia } from "viem/chains"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { createBittensorTransport, getRpcUrls } from "./rpc-manager"

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
    default: { http: getRpcUrls("mainnet") },
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
    default: { http: getRpcUrls("testnet") },
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
    [bittensor.id]: createBittensorTransport("mainnet"),
    [bittensorTestnet.id]: createBittensorTransport("testnet"),
    [hardhatLocal.id]: http("http://127.0.0.1:8545"),
  },
})

export const wagmiConfig = wagmiAdapter.wagmiConfig
