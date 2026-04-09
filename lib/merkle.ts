 /**
 * merkle.ts  (client-side)
 *
 * Generates and verifies Merkle proofs for TaoNFT allowlist phases.
 * Leaf = keccak256(abi.encodePacked(address, maxAllowance))
 *
 * Mirrors contracts/scripts/generate-merkle.ts.
 */

import { keccak256, encodePacked } from "viem";

/** A tiny MerkleTree without an external dependency. */
class MerkleTree {
  private readonly layers: `0x${string}`[][];

  constructor(leaves: `0x${string}`[]) {
    const sorted = [...leaves].sort();
    this.layers = [sorted];
    while (this.layers[this.layers.length - 1].length > 1) {
      this.layers.push(this.nextLayer(this.layers[this.layers.length - 1]));
    }
  }

  private nextLayer(layer: `0x${string}`[]): `0x${string}`[] {
    const next: `0x${string}`[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      if (i + 1 === layer.length) {
        next.push(layer[i]);
      } else {
        next.push(hashPair(layer[i], layer[i + 1]));
      }
    }
    return next;
  }

  get root(): `0x${string}` {
    return this.layers[this.layers.length - 1][0] ?? "0x";
  }

  getProof(leaf: `0x${string}`): `0x${string}`[] {
    const proof: `0x${string}`[] = [];
    let idx = this.layers[0].indexOf(leaf);
    if (idx === -1) return [];
    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i];
      const sibling = idx % 2 === 0 ? layer[idx + 1] : layer[idx - 1];
      if (sibling) proof.push(sibling);
      idx = Math.floor(idx / 2);
    }
    return proof;
  }

  verify(proof: `0x${string}`[], leaf: `0x${string}`): boolean {
    let hash = leaf;
    for (const node of proof) {
      hash = hashPair(hash, node);
    }
    return hash === this.root;
  }
}

function hashPair(a: `0x${string}`, b: `0x${string}`): `0x${string}` {
  const [lo, hi] = a < b ? [a, b] : [b, a];
  return keccak256(`0x${lo.slice(2)}${hi.slice(2)}`);
}

function makeLeaf(wallet: string, maxAllowance: number): `0x${string}` {
  return keccak256(encodePacked(
    ["address", "uint256"],
    [wallet.toLowerCase() as `0x${string}`, BigInt(maxAllowance)]
  ));
}

/** Build a MerkleTree from a list of addresses. */
export function buildTree(wallets: string[], maxAllowance = 0): MerkleTree {
  const leaves = wallets.map((w) => makeLeaf(w, maxAllowance));
  return new MerkleTree(leaves);
}

/** Get proof for a wallet. Returns [] if wallet not in allowlist. */
export function getMerkleProof(
  wallets: string[],
  wallet: string,
  maxAllowance = 0
): `0x${string}`[] {
  if (wallets.length === 0) return [];
  const tree  = buildTree(wallets, maxAllowance);
  const leaf  = makeLeaf(wallet, maxAllowance);
  return tree.getProof(leaf);
}

/** Check if wallet is in the allowlist by verifying against an on-chain root. */
export function isInAllowlist(
  wallets: string[],
  wallet: string,
  onChainRoot: `0x${string}`,
  maxAllowance = 0
): boolean {
  if (onChainRoot === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    return true; // public phase
  }
  if (wallets.length === 0) return false;
  const tree  = buildTree(wallets, maxAllowance);
  const leaf  = makeLeaf(wallet, maxAllowance);
  const proof = tree.getProof(leaf);
  return tree.verify(proof, leaf) && tree.root === onChainRoot;
}
