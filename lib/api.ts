const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
import { processProjectImages } from "./image-utils";

/** Build the URL for the backend image proxy — handles IPFS, caching, fallbacks server-side */
export function nftImageUrl(slug: string, tokenId: number): string {
  return `${API_URL}/api/images/nft/${slug}/${tokenId}`;
}

export interface MintPhase {
  _id: string;
  name: string;
  status: "completed" | "active" | "upcoming";
  price: number;
  maxPerWallet: number;
  supply: number;
  minted: number;
  startDate: string;
  endDate: string;
}

export interface SampleNFT {
  _id: string;
  tokenId: number;
  name: string;
  image: string;
  rarity: string;
  mintedBy: string;
  mintedAt: string;
}

export interface SubnetInfo {
  id: number;
  name: string;
  alphaToken: string;
  alphaPrice: number;
  miners: number;
  validators: number;
  dailyEmissions: number;
}

export interface Project {
  _id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  chain: string;
  status: "live" | "upcoming" | "ended";
  minted: number;
  supply: number;
  currency: string;
  participants: number;
  mintPrice: number;
  maxPerWallet: number;
  startDate: string;
  endDate: string;
  twitter?: string;
  discord?: string;
  website?: string;
  gradient: string;
  logoColors: [string, string];
  highlights: string[];
  artist: string;
  rarity: string[];
  utilities: string[];
  logoWide: string;
  logoSquare: string;
  phases: MintPhase[];
  sampleNFTs: SampleNFT[];
  totalTaoRaised?: number;
  contractAddress?: string | null;
  chainId?: number | null;
  subnet: SubnetInfo;
  featured?: boolean;
}

export interface MintResult {
  success: boolean;
  tokenIds: number[];
  totalCost: number;
  phase: string;
  mintEvent: string;
}

export interface AllowlistResult {
  wallet: string;
  allowed: boolean;
  maxAllowance?: number;
}

export interface MintHistoryEvent {
  _id: string;
  wallet: string;
  phase: string;
  quantity: number;
  priceEach: number;
  totalCost: number;
  tokenIds: number[];
  createdAt: string;
}

export interface PlatformStats {
  totalMinted: number;
  activeDrops: number;
  collectors: number;
}

// ─── Stats ───────────────────────────────────────────────────

export async function fetchStats(): Promise<PlatformStats> {
  const res = await fetch(`${API_URL}/api/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

// ─── Projects ────────────────────────────────────────────────

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${API_URL}/api/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  const response = await res.json();
  const projects = response.data || response;
  return projects.map((project: any) => {
    const processed = processProjectImages(project);
    // Convert string fields to numbers where needed
    return {
      ...processed,
      mintPrice: parseFloat(processed.mintPrice) || 0,
      totalTaoRaised: processed.totalTaoRaised ? parseFloat(processed.totalTaoRaised) : undefined,
    };
  });
}

export async function fetchProject(slug: string): Promise<Project | null> {
  try {
    const res = await fetch(`${API_URL}/api/projects/${slug}`);
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const response = await res.json();
    const project = response.data || response;
    return processProjectImages(project);
  } catch {
    return null;
  }
}

// ─── Minting ─────────────────────────────────────────────────

export async function mintNFT(
  slug: string,
  wallet: string,
  quantity: number
): Promise<MintResult> {
  const res = await fetch(`${API_URL}/api/mint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, wallet, quantity }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Mint failed");
  return data;
}

export async function fetchMintHistory(
  slug: string,
  wallet: string
): Promise<MintHistoryEvent[]> {
  const res = await fetch(`${API_URL}/api/mint/history/${slug}/${wallet}`);
  if (!res.ok) throw new Error("Failed to fetch mint history");
  return res.json();
}

export async function fetchRecentlyMinted(slug: string, wallet?: string): Promise<SampleNFT[]> {
  // If wallet is provided, get on-chain NFTs owned by that wallet
  if (wallet) {
    const res = await fetch(`${API_URL}/api/contracts/${slug}/owned/${wallet}`);
    if (!res.ok) throw new Error("Failed to fetch on-chain NFTs");
    const data = await res.json();
    
    if (!data.deployed || !data.nfts) return [];
    
    // Transform on-chain NFT data to SampleNFT format
    return data.nfts.map((nft: any, index: number) => ({
      _id: `${nft.tokenId}`,
      tokenId: nft.tokenId,
      name: nft.name,
      image: nft.image || null,
      rarity: "Common", // Default rarity since on-chain might not have this
      mintedBy: wallet,
      mintedAt: new Date().toISOString() // We don't have mint timestamp from on-chain
    }));
  }
  
  // If no wallet, get all recently minted NFTs (off-chain fallback)
  // Try local Next.js API route first, then fallback to external backend
  try {
    const localRes = await fetch(`/api/mint/recent/${slug}`);
    if (localRes.ok) {
      const data = await localRes.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (localError) {
    console.log("Local API route failed, trying external backend:", localError);
  }

  // Fallback to external backend
  const res = await fetch(`${API_URL}/api/mint/recent/${slug}`);
  if (!res.ok) throw new Error("Failed to fetch recently minted NFTs");
  return res.json();
}

// ─── Allowlist ───────────────────────────────────────────────

export async function checkAllowlist(
  slug: string,
  wallet: string
): Promise<AllowlistResult> {
  const res = await fetch(`${API_URL}/api/allowlist/${slug}/${wallet}`);
  if (!res.ok) throw new Error("Failed to check allowlist");
  return res.json();
}

// ─── On-Chain Status (via backend RPC) ──────────────────────────

export interface BackendPhase {
  index: number
  name: string
  status: "active" | "upcoming" | "completed"
  price: string
  maxPerWallet: number
  maxSupply: number
  minted: number
  signer: `0x${string}`   // address(0) = public; else ECDSA signer
  startTime: number
  endTime: number
  paused: boolean
}

export interface OnChainStatus {
  deployed: boolean
  contractAddress?: string
  chainId?: number
  onChain?: {
    totalMinted: number
    maxSupply: number
    totalPhases: number
    transfersLocked: boolean
    owner: `0x${string}`
    royaltyReceiver: `0x${string}`
    royaltyBps: number   // out of 10000, e.g. 500 = 5%
    phases: BackendPhase[]
  }
}

export async function fetchOnChainStatus(slug: string): Promise<OnChainStatus> {
  const maxRetries = 3;
  const baseDelay = 1000;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${API_URL}/api/sync/${slug}/status`)
      
      if (res.status === 503 || res.status >= 500) {
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        return { deployed: false }
      }
      
      if (!res.ok) return { deployed: false }
      return res.json()
    } catch (error) {
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      return { deployed: false }
    }
  }
  
  return { deployed: false }
}

// ─── Contracts ───────────────────────────────────────────────────

export async function fetchContractAddress(slug: string): Promise<{
  contractAddress: string | null;
  chainId: number | null;
}> {
  const res = await fetch(`${API_URL}/api/contracts/${slug}`);
  if (!res.ok) return { contractAddress: null, chainId: null };
  return res.json();
}

export async function fetchSignature(
  slug: string,
  phaseIndex: number,
  wallet: string
): Promise<{ signature: `0x${string}` | null; allowed: boolean; maxAllowance: number }> {
  const res = await fetch(`${API_URL}/api/contracts/${slug}/signature/${phaseIndex}/${wallet}`);
  if (!res.ok) return { signature: null, allowed: false, maxAllowance: 0 };
  return res.json();
}

export async function fetchWalletPhaseMints(
  slug: string,
  phaseIndex: number,
  wallet: string
): Promise<number> {
  try {
    const res = await fetch(`${API_URL}/api/contracts/${slug}/wallet-mints/${phaseIndex}/${wallet}`);
    if (!res.ok) return 0;
    const data = await res.json();
    return data.minted ?? 0;
  } catch {
    return 0;
  }
}

export async function recordOnChainMint(params: {
  slug: string;
  wallet: string;
  txHash: string;
  quantity: number;
  phaseIndex: number;
  phaseName: string;
  priceEach: number;
  tokenIds?: number[];
}): Promise<void> {
  await fetch(`${API_URL}/api/onchain-mint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).catch(() => {}); // fire-and-forget, don't block UI
}

// Backend transaction confirmation
export interface TransactionConfirmationResult {
  success: boolean;
  receipt: {
    status: "success" | "reverted";
    blockNumber: bigint;
    blockHash: string;
    transactionHash: string;
    gasUsed: string;
    effectiveGasPrice?: string;
    logs: any[];
    type: string;
  };
  tokenIds: number[];
  confirmed: boolean;
  confirmations: number;
  error?: string;
  code?: string;
}

export async function confirmTransactionViaBackend(params: {
  txHash: string;
  chainId: number;
  network?: string;
  confirmations?: number;
  timeout?: number;
}): Promise<TransactionConfirmationResult> {
  // HTTP-level timeout: backend timeout + 10s buffer so the backend can respond with its own timeout error
  const httpTimeout = (params.timeout || 60000) + 10000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), httpTimeout);

  try {
    const res = await fetch(`${API_URL}/api/transaction-confirmation/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Transaction confirmation failed");
    return data;
  } finally {
    clearTimeout(timer);
  }
}

// Fire-and-forget: submit txHash + mint metadata to backend for background confirmation
// Returns immediately — backend confirms and records the mint asynchronously
export async function submitMintForConfirmation(params: {
  txHash: string;
  chainId: number;
  slug: string;
  wallet: string;
  quantity: number;
  phaseIndex: number;
  phaseName: string;
  priceEach: number;
}): Promise<{ success: boolean; status: string }> {
  try {
    const res = await fetch(`${API_URL}/api/transaction-confirmation/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch {
    // Fire-and-forget — don't block the UI even if this fails
    return { success: false, status: "submit_failed" };
  }
}

export async function getTransactionStatus(params: {
  txHash: string;
  chainId: number;
  network?: string;
}): Promise<{ success: boolean; status: string; confirmed: boolean; error?: string }> {
  const queryParams = new URLSearchParams({
    chainId: params.chainId.toString(),
    network: params.network || "mainnet",
  });
  
  const res = await fetch(`${API_URL}/api/transaction-confirmation/status/${params.txHash}?${queryParams}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Status check failed");
  return data;
}

// TAO Wallet API types
export interface WalletInfo {
  address: string;
  balance: string;
  balanceTao: string;
  name?: string;
  isConnected: boolean;
  network: string;
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  from?: string;
  to?: string;
  amount?: string;
  status?: string;
  blockNumber?: number;
  error?: string;
}

export interface NetworkInfo {
  name: string;
  network: string;
  chainId: string;
  rpcEndpoint: string;
  ss58Format: number;
  tokenDecimals: number;
  tokenSymbol: string;
  blockTime: number;
  currentBlock: number;
}

export interface Validator {
  hotkey: string;
  name: string;
  stake: string;
  stakeTao: string;
  commission: number;
  active: boolean;
}

// TAO Wallet API functions
export async function fetchWalletBalance(address: string): Promise<WalletInfo> {
  const res = await fetch(`${API_URL}/api/wallet/balance/${address}`);
  if (!res.ok) throw new Error("Failed to fetch wallet balance");
  const data = await res.json();
  return data.data;
}

export async function fetchWalletInfo(address: string): Promise<WalletInfo> {
  const res = await fetch(`${API_URL}/api/wallet/info/${address}`);
  if (!res.ok) throw new Error("Failed to fetch wallet info");
  const data = await res.json();
  return data.data;
}

export async function sendTAOTransaction(
  from: string,
  to: string,
  amount: string
): Promise<TransactionResult> {
  const res = await fetch(`${API_URL}/api/wallet/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, amount }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Transaction failed");
  return data.data;
}

export async function stakeToValidator(
  hotkey: string,
  amount: string
): Promise<TransactionResult> {
  const res = await fetch(`${API_URL}/api/wallet/stake`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hotkey, amount }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Staking failed");
  return data.data;
}

export async function fetchNetworkInfo(): Promise<NetworkInfo> {
  const res = await fetch(`${API_URL}/api/wallet/network`);
  if (!res.ok) throw new Error("Failed to fetch network info");
  const data = await res.json();
  return data.data;
}

export async function fetchValidators(): Promise<Validator[]> {
  const res = await fetch(`${API_URL}/api/wallet/validators`);
  if (!res.ok) throw new Error("Failed to fetch validators");
  const data = await res.json();
  return data.data;
}

// Rarity API types
export interface RarityData {
  token_id: number;
  rarity_score: number;
  rarity_rank: number;
  rarity_tier: string;
  trait_rarities: Record<string, {
    value: string;
    frequency: number;
    rarity: number;
    rarityPercent: string;
  }>;
  created_at: string;
}

export interface RarityStats {
  distribution: Array<{
    rarity_tier: string;
    count: number;
    percentage: number;
  }>;
  statistics: {
    total: number;
    averageScore: number;
    minScore: number;
    maxScore: number;
    medianScore: number;
  };
  topNFTs: Array<{
    token_id: number;
    rarity_score: number;
    rarity_rank: number;
    rarity_tier: string;
  }>;
}

export interface NFTRarity {
  nft: RarityData;
  collectionStats: {
    total: number;
    averageScore: number;
    minScore: number;
    maxScore: number;
    percentile: string;
  };
}

// Rarity API functions
export async function fetchRarityData(slug: string, options?: {
  limit?: number;
  offset?: number;
  sortBy?: 'rarity_rank' | 'rarity_score' | 'token_id' | 'rarity_tier';
  order?: 'asc' | 'desc';
}): Promise<{ nfts: RarityData[]; pagination: any }> {
  const params = new URLSearchParams({
    limit: (options?.limit || 50).toString(),
    offset: (options?.offset || 0).toString(),
    sortBy: options?.sortBy || 'rarity_rank',
    order: options?.order || 'asc'
  });

  const res = await fetch(`${API_URL}/api/rarity/${slug}?${params}`);
  if (!res.ok) throw new Error("Failed to fetch rarity data");
  return res.json();
}

export async function fetchNFTRarity(slug: string, tokenId: number): Promise<NFTRarity> {
  const res = await fetch(`${API_URL}/api/rarity/${slug}/${tokenId}`);
  if (!res.ok) throw new Error("Failed to fetch NFT rarity");
  return res.json();
}

export async function fetchRarityStats(slug: string): Promise<RarityStats> {
  const maxRetries = 3;
  const baseDelay = 1000;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${API_URL}/api/rarity/${slug}/stats`);
      
      if (res.status === 503 || res.status >= 500) {
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      if (!res.ok) throw new Error("Failed to fetch rarity stats");
      return res.json();
    } catch (error) {
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  
  throw new Error("Failed to fetch rarity stats after retries");
}

export async function calculateRarity(slug: string): Promise<{ message: string; status: string }> {
  const res = await fetch(`${API_URL}/api/rarity/${slug}/calculate`, {
    method: "POST"
  });
  if (!res.ok) throw new Error("Failed to calculate rarity");
  return res.json();
}
