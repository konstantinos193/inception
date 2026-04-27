import { MediaKitFooter } from "@/components/media-kit-footer"

export default function MediaKitPage() {
  return (
    <div className="brandbook-wrap" style={{ paddingTop: '5rem', paddingBottom: '6rem' }}>
      <div className="sec-meta">
        <span className="sec-num">00</span>
        <span className="sec-name">MEDIA KIT</span>
      </div>
      
      <h1 style={{ fontFamily: 'var(--font-barlow)', fontSize: '3.5rem', fontWeight: 800, lineHeight: 0.95, marginBottom: '2rem', color: '#F5F3EF' }}>MEDIA KIT</h1>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: 'rgba(245,243,239,0.5)', lineHeight: 1.75, maxWidth: '50ch', marginBottom: '3rem' }}>
        Download official Elevate assets for press and promotional use. All assets are provided in high-resolution formats suitable for both digital and print applications.
      </p>
      
      <div className="fnote">
        ⚠ Assets coming soon — This section is under development. Check back later for downloadable brand assets.
      </div>
      <MediaKitFooter />
    </div>
  )
}
