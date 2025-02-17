import DreamLayers from "@/components/dream-layers"
import Link from "next/link"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-20">
      <DreamLayers />
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <Link 
          href="/" 
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors mb-8 inline-block"
        >
          ← Return to Homepage
        </Link>
        <h1 className="text-4xl font-bold mb-8 text-center text-[#0154fa]">Terms of Service</h1>
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#0154fa]">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Inception NFT platform, you agree to be bound by these Terms of Service. If you
              do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#0154fa]">2. Description of Service</h2>
            <p>
              Inception NFT provides a platform for the creation, sale, and trading of non-fungible tokens (NFTs)
              inspired by the concept of dreams and subconscious exploration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#0154fa]">3. User Responsibilities</h2>
            <p>
              Users are responsible for maintaining the security of their wallets and for all activities that occur
              under their account. Users must not violate any laws or regulations in their use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#0154fa]">4. Intellectual Property</h2>
            <p>
              All content on the Inception NFT platform, including but not limited to text, graphics, logos, and
              software, is the property of Inception NFT or its content suppliers and is protected by copyright laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#0154fa]">5. NFT Ownership and Rights</h2>
            <p>
              Ownership of an NFT from Inception NFT grants the right to use, copy, and display the NFT for personal,
              non-commercial use. It does not grant ownership of the underlying intellectual property.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#0154fa]">6. Limitation of Liability</h2>
            <p>
              Inception NFT shall not be liable for any indirect, incidental, special, consequential or punitive damages
              resulting from your use of or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#0154fa]">7. Modifications to Service</h2>
            <p>
              Inception NFT reserves the right to modify or discontinue, temporarily or permanently, the service with or
              without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#0154fa]">8. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without
              regard to its conflict of law provisions.
            </p>
          </section>

          <p className="mt-8 text-sm text-gray-400">Last updated: 2/17/2025</p>
        </div>
      </div>
    </div>
  )
}

