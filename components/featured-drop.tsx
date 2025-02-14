import { motion } from "framer-motion"
import Link from "next/link"

const featuredDrop = {
  id: 1,
  name: "Cosmic Apes",
  artist: "Stella Nova",
  image: "/placeholder.svg?height=600&width=800",
}

export default function FeaturedDrop() {
  return (
    <section className="mb-32 px-6">
      <h2 className="text-3xl font-bold mb-8 text-center text-[#0154fa]">Featured Drop</h2>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative aspect-[4/3] max-w-4xl mx-auto overflow-hidden rounded-lg"
      >
        <img
          src={featuredDrop.image || "/placeholder.svg"}
          alt={featuredDrop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-90"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <h3 className="text-4xl font-bold text-white mb-2">{featuredDrop.name}</h3>
          <p className="text-xl text-gray-300 mb-4">by {featuredDrop.artist}</p>
          <Link
            href={`/mint/${featuredDrop.id}`}
            className="inline-block bg-[#0154fa] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#0143d1] transition-colors shadow-lg hover:shadow-[#0154fa]/50"
          >
            Mint Now
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

