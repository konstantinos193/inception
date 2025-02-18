import Link from "next/link"
import DreamLayers from "@/components/dream-layers"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 text-gray-100 py-32">
        <DreamLayers />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-[#0154fa]">About Inception NFT</h1>
          <div className="space-y-6 text-lg md:text-xl">
            <p>
              Inception NFT is a revolutionary platform that brings the mind-bending concepts of dream exploration to the
              world of digital collectibles. Inspired by the iconic film "Inception," our platform offers a unique and
              immersive experience for NFT enthusiasts and dreamers alike.
            </p>
            <p>
              Our collections feature artwork from talented artists who push the boundaries of imagination, creating
              surreal landscapes, impossible structures, and captivating dreamscapes. Each NFT represents a fragment of a
              dream, a piece of a world beyond our conscious reality.
            </p>
            <p>
              At Inception NFT, we believe in the power of ideas and the infinite possibilities of the mind. Our platform
              is not just a marketplace; it's a gateway to exploring the depths of creativity and the subconscious.
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold text-[#0154fa] mt-8 mb-4">Our Mission</h2>
            <p>
              We aim to create a community of dreamers, artists, and collectors who appreciate the beauty of the surreal
              and the power of imagination. Through our platform, we seek to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Showcase groundbreaking digital art that challenges perception</li>
              <li>Support artists in bringing their wildest dreams to life</li>
              <li>Provide collectors with unique, thought-provoking pieces</li>
              <li>Push the boundaries of what's possible in the NFT space</li>
            </ul>
            <h2 className="text-2xl md:text-3xl font-semibold text-[#0154fa] mt-8 mb-4">Join Us in the Dream</h2>
            <p>
              Whether you're an artist with a vision, a collector seeking the extraordinary, or simply a dreamer
              fascinated by the concept of Inception, we invite you to join us on this incredible journey. Explore our
              collections, mint your own piece of the dream, and become part of a community that values creativity,
              innovation, and the power of the subconscious.
            </p>
            <div className="mt-8 text-center">
              <Link
                href="/explore"
                className="inline-block bg-[#0154fa] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#0143d1] transition-colors"
              >
                Start Exploring
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

