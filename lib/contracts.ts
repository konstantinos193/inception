/**
 * contracts.ts
 *
 * TaoNFT ABI + helper to resolve a collection's contract address.
 * deployed.json is written by contracts/scripts/deploy.ts after each deploy.
 */

// ── ABI ───────────────────────────────────────────────────────────────────────

export const TAO_NFT_ABI = [
  // ── Read ──────────────────────────────────────────────────────────────────
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }]
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }]
  },
  {
    type: "function",
    name: "maxSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "totalMinted",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "reservedSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "reservedMinted",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "globalMaxPerWallet",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "revealed",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }]
  },
  {
    type: "function",
    name: "metadataFrozen",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }]
  },
  {
    type: "function",
    name: "baseTokenURI",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }]
  },
  {
    type: "function",
    name: "unrevealedURI",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }]
  },
  {
    type: "function",
    name: "platformFeeRecipient",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }]
  },
  {
    type: "function",
    name: "platformFeeBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint96" }]
  },
  {
    type: "function",
    name: "paused",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }]
  },
  {
    type: "function",
    name: "transfersLocked",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }]
  },
  {
    type: "function",
    name: "mintRecipient",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }]
  },

  {
    type: "function",
    name: "totalPhases",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "getPhase",
    stateMutability: "view",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [{
      type: "tuple",
      components: [
        { name: "name", type: "string" },
        { name: "startTime", type: "uint64" },
        { name: "endTime", type: "uint64" },
        { name: "price", type: "uint256" },
        { name: "maxPerWallet", type: "uint32" },
        { name: "maxSupply", type: "uint32" },
        { name: "minted", type: "uint32" },
        { name: "signer", type: "address" },
        { name: "paused", type: "bool" }
      ]
    }]
  },
  {
    type: "function",
    name: "getAllPhases",
    stateMutability: "view",
    inputs: [],
    outputs: [{
      type: "tuple[]",
      components: [
        { name: "name", type: "string" },
        { name: "startTime", type: "uint64" },
        { name: "endTime", type: "uint64" },
        { name: "price", type: "uint256" },
        { name: "maxPerWallet", type: "uint32" },
        { name: "maxSupply", type: "uint32" },
        { name: "minted", type: "uint32" },
        { name: "signer", type: "address" },
        { name: "paused", type: "bool" }
      ]
    }]
  },
  {
    type: "function",
    name: "getActivePhaseIndex",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "int256" }]
  },
  {
    type: "function",
    name: "mintableInPhase",
    stateMutability: "view",
    inputs: [{ name: "phaseIndex", type: "uint256" }],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "phaseMints",
    stateMutability: "view",
    inputs: [
      { name: "wallet", type: "address" },
      { name: "phaseIndex", type: "uint256" }
    ],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "totalMints",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "walletPhaseMintsOf",
    stateMutability: "view",
    inputs: [
      { name: "wallet", type: "address" },
      { name: "phaseIndex", type: "uint256" }
    ],
    outputs: [{ type: "uint256" }]
  },

  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "string" }]
  },
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "address" }]
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }]
  },
  {
    type: "function",
    name: "royaltyInfo",
    stateMutability: "view",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "salePrice", type: "uint256" }
    ],
    outputs: [
      { name: "receiver", type: "address" },
      { name: "royaltyAmount", type: "uint256" }
    ]
  },
  {
    type: "function",
    name: "supportsInterface",
    stateMutability: "view",
    inputs: [{ name: "interfaceId", type: "bytes4" }],
    outputs: [{ type: "bool" }]
  },

  // Write (public)
  {
    type: "function",
    name: "mint",
    stateMutability: "payable",
    inputs: [
      { name: "phaseIndex", type: "uint256" },
      { name: "quantity", type: "uint256" },
      { name: "signature", type: "bytes" },
      { name: "maxAllowance", type: "uint256" }
    ],
    outputs: []
  },

  // Write (owner)
  {
    type: "function",
    name: "addPhase",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "startTime", type: "uint64" },
      { name: "endTime", type: "uint64" },
      { name: "price", type: "uint256" },
      { name: "maxPerWallet", type: "uint32" },
      { name: "maxSupply", type: "uint32" },
      { name: "signer", type: "address" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "updatePhase",
    stateMutability: "nonpayable",
    inputs: [
      { name: "phaseIndex", type: "uint256" },
      { name: "name", type: "string" },
      { name: "startTime", type: "uint64" },
      { name: "endTime", type: "uint64" },
      { name: "price", type: "uint256" },
      { name: "maxPerWallet", type: "uint32" },
      { name: "maxSupply", type: "uint32" },
      { name: "signer", type: "address" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "setPhasePaused",
    stateMutability: "nonpayable",
    inputs: [
      { name: "phaseIndex", type: "uint256" },
      { name: "paused", type: "bool" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "setPhaseSignerAddress",
    stateMutability: "nonpayable",
    inputs: [
      { name: "phaseIndex", type: "uint256" },
      { name: "signer", type: "address" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "setGlobalMaxPerWallet",
    stateMutability: "nonpayable",
    inputs: [{ name: "max", type: "uint256" }],
    outputs: []
  },
  {
    type: "function",
    name: "updateReservedSupply",
    stateMutability: "nonpayable",
    inputs: [{ name: "reserved", type: "uint256" }],
    outputs: []
  },
  {
    type: "function",
    name: "pause",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "unpause",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "unlockTransfers",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "setMintRecipient",
    stateMutability: "nonpayable",
    inputs: [{ name: "recipient", type: "address" }],
    outputs: []
  },
  {
    type: "function",
    name: "reveal",
    stateMutability: "nonpayable",
    inputs: [{ name: "newBaseURI", type: "string" }],
    outputs: []
  },
  {
    type: "function",
    name: "setBaseURI",
    stateMutability: "nonpayable",
    inputs: [{ name: "newBaseURI", type: "string" }],
    outputs: []
  },
  {
    type: "function",
    name: "setUnrevealedURI",
    stateMutability: "nonpayable",
    inputs: [{ name: "uri", type: "string" }],
    outputs: []
  },
  {
    type: "function",
    name: "freezeMetadata",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "setDefaultRoyalty",
    stateMutability: "nonpayable",
    inputs: [
      { name: "receiver", type: "address" },
      { name: "feeNumerator", type: "uint96" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "setTokenRoyalty",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "feeNumerator", type: "uint96" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "deleteDefaultRoyalty",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "ownerMint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "quantity", type: "uint256" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "ownerMintBatch",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipients", type: "address[]" },
      { name: "quantities", type: "uint256[]" }
    ],
    outputs: []
  },

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
  name:         string;
  startTime:    bigint;
  endTime:      bigint;
  price:        bigint;
  maxPerWallet: number;
  maxSupply:    number;
  minted:       number;
  signer:       `0x${string}`;  // address(0) = public phase
  paused:       boolean;
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
