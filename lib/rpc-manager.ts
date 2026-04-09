/**
 * Frontend RPC Manager
 *
 * - Fetches the best provider from the backend health monitor
 * - Falls back to local priority order when backend is unreachable
 * - Reports provider failures back to the backend
 * - Exports viem fallback transports for wagmi config
 *
 * Provider list mirrors shared/rpc-providers.json — keep in sync.
 */

import { http, fallback, type Transport } from "viem"

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "" : "http://localhost:4000")

// ─── Provider definitions ────────────────────────────────────────────────────

export interface RpcProvider {
  id: string
  url: string
  name: string
  priority: number
  public: boolean
}

export interface ProviderStatus extends RpcProvider {
  healthy: boolean
  latency: number | null
  rateLimited: boolean
  rateLimitReset: number | null
  failCount: number
  lastCheck: string | null
  network: string
  type: string
}

export interface RpcStatus {
  providers: ProviderStatus[]
  best: {
    mainnet_evm: ProviderStatus | null
    mainnet_substrate: ProviderStatus | null
    testnet_evm: ProviderStatus | null
    testnet_substrate: ProviderStatus | null
  }
  lastUpdated: string
}

/** Mirror of shared/rpc-providers.json */
export const RPC_PROVIDERS = {
  mainnet: {
    evm: [
      { id: "opentensor-lite", url: "https://lite.chain.opentensor.ai", name: "OpenTensor Lite", priority: 1, public: true },
      { id: "nodies", url: "https://bittensor-lite-public.nodies.app", name: "Nodies Public", priority: 2, public: true },
      { id: "onfinality", url: "https://bittensor-finney.api.onfinality.io/public", name: "OnFinality Public", priority: 3, public: true },
      { id: "dwellir", url: "https://api-bittensor-mainnet.n.dwellir.com/024a8884-05e8-42af-928e-f93d4afc0a75", name: "Dwellir", priority: 4, public: false },
    ] as RpcProvider[],
    substrate: [
      { id: "opentensor-ws", url: "wss://entrypoint-finney.opentensor.ai:443", name: "OpenTensor WS", priority: 1, public: true },
      { id: "nodies-ws", url: "wss://bittensor-public.nodies.app", name: "Nodies WS", priority: 2, public: true },
      { id: "dwellir-ws", url: "wss://api-bittensor-mainnet.n.dwellir.com/024a8884-05e8-42af-928e-f93d4afc0a75", name: "Dwellir WS", priority: 3, public: false },
    ] as RpcProvider[],
  },
  testnet: {
    evm: [
      { id: "opentensor-test", url: "https://test.chain.opentensor.ai", name: "OpenTensor Testnet", priority: 1, public: true },
      { id: "nodies-test", url: "https://bittensor-testnet-public.nodies.app", name: "Nodies Testnet", priority: 2, public: true },
    ] as RpcProvider[],
    substrate: [
      { id: "opentensor-test-ws", url: "wss://test.finney.opentensor.ai:443", name: "OpenTensor Test WS", priority: 1, public: true },
    ] as RpcProvider[],
  },
} as const

// ─── Backend sync ─────────────────────────────────────────────────────────────

const CACHE_TTL = 30_000 // 30s

interface ProviderCache {
  provider: ProviderStatus
  timestamp: number
}

const _bestCache: Record<string, ProviderCache> = {}
let _statusCache: { data: RpcStatus; timestamp: number } | null = null

async function fetchBestFromBackend(
  network: string,
  type: string
): Promise<ProviderStatus | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/rpc/best?network=${network}&type=${type}`,
      { signal: AbortSignal.timeout(3000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.provider as ProviderStatus
  } catch {
    return null
  }
}

/** Returns the best provider for a given network + type, with backend sync and local fallback. */
export async function getBestProvider(
  network: "mainnet" | "testnet" = "mainnet",
  type: "evm" | "substrate" = "evm"
): Promise<RpcProvider> {
  const key = `${network}_${type}`
  const cached = _bestCache[key]
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.provider
  }

  const backendProvider = await fetchBestFromBackend(network, type)
  if (backendProvider) {
    _bestCache[key] = { provider: backendProvider, timestamp: Date.now() }
    return backendProvider
  }

  // Fallback: priority order from local list
  const providers = RPC_PROVIDERS[network][type as "evm"]
  return [...providers].sort((a, b) => a.priority - b.priority)[0]
}

/** Fetch full status snapshot from backend. */
export async function getRpcStatus(): Promise<RpcStatus | null> {
  if (_statusCache && Date.now() - _statusCache.timestamp < CACHE_TTL) {
    return _statusCache.data
  }
  try {
    const res = await fetch(`${API_BASE}/api/rpc/status`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as RpcStatus
    _statusCache = { data, timestamp: Date.now() }
    return data
  } catch {
    return null
  }
}

/** Report a provider failure to the backend so it adjusts routing. */
export async function reportProviderFailure(
  providerId: string,
  reason: "rate-limit" | "unreachable"
): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/rpc/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId, reason }),
      signal: AbortSignal.timeout(2000),
    })
  } catch {
    // Backend may be down — ignore
  }
}

// ─── Viem transports ─────────────────────────────────────────────────────────

/**
 * Creates a viem fallback transport for a Bittensor network.
 * Providers are ordered by priority; viem retries the next one on failure.
 * Pass `rank: true` to let viem auto-rank by latency (sends periodic pings).
 */
export function createBittensorTransport(
  network: "mainnet" | "testnet" = "mainnet",
  opts: { rank?: boolean } = {}
): Transport {
  const providers = [...RPC_PROVIDERS[network].evm].sort(
    (a, b) => a.priority - b.priority
  )
  return fallback(
    providers.map((p) => http(p.url)),
    { rank: opts.rank ?? false, retryCount: 2, retryDelay: 500 }
  )
}

/** Ordered list of EVM RPC URLs for a network (for use in defineChain). */
export function getRpcUrls(network: "mainnet" | "testnet" = "mainnet"): string[] {
  return [...RPC_PROVIDERS[network].evm]
    .sort((a, b) => a.priority - b.priority)
    .map((p) => p.url)
}
