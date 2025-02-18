import DreamLayers from "@/components/dream-layers"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 text-gray-100 py-40">
        <DreamLayers />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h1 className="text-4xl font-bold mb-8 text-center text-[#0154fa]">Privacy Policy</h1>
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-[#0154fa]">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an account, make a purchase, or
                contact us for support. This may include your name, email address, wallet address, and transaction
                history.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-[#0154fa]">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to operate and improve our platform, process transactions, provide
                customer support, and communicate with you about new drops and platform updates.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-[#0154fa]">3. Information Sharing and Disclosure</h2>
              <p>
                We do not sell your personal information. We may share your information with third-party service providers
                who perform services on our behalf, such as payment processing and data analysis.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-[#0154fa]">4. Blockchain Transactions</h2>
              <p>
                Please note that transactions on the blockchain are public. While we do not publicly associate blockchain
                transactions with individual users, the nature of blockchain technology means that transaction data is
                publicly available.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-[#0154fa]">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect the security of your personal
                information. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-[#0154fa]">6. Your Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, such as the
                right to access, correct, or delete your data. Please contact us to exercise these rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-[#0154fa]">7. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new
                policy on this page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-[#0154fa]">8. Contact Us</h2>
              <p>If you have any questions about this privacy policy, please contact us at our X account or Discord server.</p>
            </section>

            <p className="mt-8 text-sm text-gray-400">Last updated: 2/18/2025</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

