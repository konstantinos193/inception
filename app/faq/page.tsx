import DreamLayers from "@/components/dream-layers"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function FAQPage() {
  const faqs = [
    {
      question: "What is Inception NFT?",
      answer:
        "Inception NFT is a revolutionary launchpad for NFT collections inspired by the concept of dreams and subconscious exploration. We provide a platform for artists to create and launch unique, mind-bending NFT collections.",
    },
    {
      question: "How do I mint an NFT?",
      answer:
        "To mint an NFT, connect your wallet, navigate to the collection you're interested in, and click the 'Mint' button. Follow the prompts to complete the transaction. Make sure you have enough APE in your wallet to cover the mint price and gas fees.",
    },
    {
      question: "What wallets are supported?",
      answer:
        "We support MetaMask. More wallet integrations may be added in the future.",
    },
    {
      question: "How are royalties distributed?",
      answer:
        "Royalties are typically set by the artist or collection creator. The standard royalty is 5-10% of secondary sales, but this can vary by collection. Check each collection's details for specific royalty information.",
    },
    {
      question: "What blockchain does Inception NFT use?",
      answer:
        "Inception NFT currently operates on the Apechain. We may explore additional blockchain integrations in the future.",
    },
    {
      question: "How can I create my own NFT collection on Inception NFT?",
      answer:
        "To launch your own collection, please reach out to us through our X. We'll guide you through the process and help bring your dream-inspired NFTs to life.",
    },
    {
      question: "Are there any fees for using Inception NFT?",
      answer:
        "There are no fees for browsing or connecting your wallet. Minting fees vary by collection and include gas fees. We take a small percentage of primary sales to maintain and improve the platform.",
    },
    {
      question: "How do I stay updated on new drops?",
      answer:
        "Follow us on X, join our Discord server, to stay informed about upcoming drops and platform updates.",
    },
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 text-gray-100 py-40">
        <DreamLayers />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h1 className="text-4xl font-bold mb-8 text-center text-[#0154fa]">Frequently Asked Questions</h1>
          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-[#0154fa]">{faq.question}</h2>
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

