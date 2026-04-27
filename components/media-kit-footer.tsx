"use client"

import Image from "next/image"

export function MediaKitFooter() {
  return (
    <div className="max-w-6xl mx-auto px-6" style={{ marginTop: '6rem', paddingTop: '2rem', borderTop: '1px solid rgba(245,243,239,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {/* Left side: Logo mark + ELEVATE text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Image 
          src="/logo-mark.png" 
          alt="ELEVATE" 
          width={28} 
          height={28}
          style={{ width: '28px', height: 'auto' }}
        />
        <span style={{ fontFamily: 'var(--font-goldman)', fontSize: '1rem', fontWeight: 700, color: '#F5F3EF', letterSpacing: '0.06em' }}>
          ELEVATE
        </span>
      </div>

      {/* Right side: Version info */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#6B7280', textAlign: 'right', lineHeight: 1.8 }}>
        Brand Guidelines v1.0 — Draft<br />
        For internal use only · Subject to revision<br />
        Bittensor EVM NFT Launchpad
      </div>
    </div>
  )
}
