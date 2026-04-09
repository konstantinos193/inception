/**
 * contracts.ts
 *
 * TaoNFT ABI + helper to resolve a collection's contract address.
 * deployed.json is written by contracts/scripts/deploy.ts after each deploy.
 */

// ── ABI ───────────────────────────────────────────────────────────────────────

export const TAO_NFT_ABI = [
  // ── Read ──────────────────────────────────────────────────────────────────
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function maxSupply() view returns (uint256)",
  "function totalMinted() view returns (uint256)",
  "function reservedSupply() view returns (uint256)",
  "function reservedMinted() view returns (uint256)",
  "function globalMaxPerWallet() view returns (uint256)",
  "function revealed() view returns (bool)",
  "function metadataFrozen() view returns (bool)",
  "function baseTokenURI() view returns (string)",
  "function unrevealedURI() view returns (string)",
  "function platformFeeRecipient() view returns (address)",
  "function platformFeeBps() view returns (uint96)",
  "function paused() view returns (bool)",

  "function totalPhases() view returns (uint256)",
  "function getPhase(uint256 index) view returns (tuple(string name, uint64 startTime, uint64 endTime, uint256 price, uint32 maxPerWallet, uint32 maxSupply, uint32 minted, bytes32 merkleRoot, bool paused))",
  "function getAllPhases() view returns (tuple(string name, uint64 startTime, uint64 endTime, uint256 price, uint32 maxPerWallet, uint32 maxSupply, uint32 minted, bytes32 merkleRoot, bool paused)[])",
  "function getActivePhaseIndex() view returns (int256)",
  "function mintableInPhase(uint256 phaseIndex) view returns (uint256)",
  "function phaseMints(address wallet, uint256 phaseIndex) view returns (uint256)",
  "function totalMints(address wallet) view returns (uint256)",
  "function walletPhaseMintsOf(address wallet, uint256 phaseIndex) view returns (uint256)",

  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function royaltyInfo(uint256 tokenId, uint256 salePrice) view returns (address receiver, uint256 royaltyAmount)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",

  // ── Write (public) ────────────────────────────────────────────────────────
  "function mint(uint256 phaseIndex, uint256 quantity, bytes32[] merkleProof, uint256 maxAllowance) payable",

  // ── Write (owner) ─────────────────────────────────────────────────────────
  "function addPhase(string name, uint64 startTime, uint64 endTime, uint256 price, uint32 maxPerWallet, uint32 maxSupply, bytes32 merkleRoot)",
  "function updatePhase(uint256 phaseIndex, string name, uint64 startTime, uint64 endTime, uint256 price, uint32 maxPerWallet, uint32 maxSupply, bytes32 merkleRoot)",
  "function setPhasePaused(uint256 phaseIndex, bool paused)",
  "function updateMerkleRoot(uint256 phaseIndex, bytes32 merkleRoot)",
  "function reveal(string baseURI)",
  "function setBaseURI(string baseURI)",
  "function setUnrevealedURI(string uri)",
  "function freezeMetadata()",
  "function setDefaultRoyalty(address receiver, uint96 feeNumerator)",
  "function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator)",
  "function deleteDefaultRoyalty()",
  "function ownerMint(address to, uint256 quantity)",
  "function ownerMintBatch(address[] recipients, uint256[] quantities)",
  "function pause()",
  "function unpause()",
"function setGlobalMaxPerWallet(uint256 max)",
  "function updateReservedSupply(uint256 reserved)",

  // ── Events ────────────────────────────────────────────────────────────────
  "event Minted(address indexed to, uint256 indexed phaseIndex, uint256 quantity, uint256 totalCost, uint256 firstTokenId)",
  "event PhaseAdded(uint256 indexed phaseIndex, string name, uint256 price, uint64 startTime, uint64 endTime)",
  "event PhaseUpdated(uint256 indexed phaseIndex)",
  "event Revealed(string newBaseURI)",
  "event MetadataFrozen()",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OnChainPhase {
  name:          string;
  startTime:     bigint;
  endTime:       bigint;
  price:         bigint;
  maxPerWallet:  number;
  maxSupply:     number;
  minted:        number;
  merkleRoot:    `0x${string}`;
  paused:        boolean;
}

// ── Address resolution ────────────────────────────────────────────────────────

let _deployed: Record<string, string> | null = null;

/** Returns the deployed NFT contract address for a given slug, or null. */
export function getContractAddress(slug: string): `0x${string}` | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const data = require("./deployed.json");
    if (!_deployed) {
      _deployed = {};
      for (const col of (data.collections ?? [])) {
        _deployed[col.slug] = col.address;
      }
    }
    return (_deployed[slug] ?? null) as `0x${string}` | null;
  } catch {
    return null;
  }
}

/** Returns the chain ID that the contract was deployed on, or null. */
export function getDeployedChainId(slug: string): number | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const data = require("./deployed.json");
    const col = (data.collections ?? []).find((c: { slug: string }) => c.slug === slug);
    if (!col) return null;
    return data.chainId ? Number(data.chainId) : null;
  } catch {
    return null;
  }
}

/** Returns the full collection record from deployed.json for a slug. */
export function getDeployedCollection(slug: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const data = require("./deployed.json");
    return (data.collections ?? []).find((c: { slug: string }) => c.slug === slug) ?? null;
  } catch {
    return null;
  }
}

/** Get phase allowlist from deployed.json (for generating merkle proofs client-side). */
export function getPhaseAllowlist(slug: string, phaseIndex: number): string[] {
  const col = getDeployedCollection(slug);
  if (!col) return [];
  return col.phases?.[phaseIndex]?.allowlist ?? [];
}
