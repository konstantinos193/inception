import { motion } from "framer-motion"
import Link from "next/link"

const drops = [
  { id: 2, name: "Digital Dreamers", artist: "Pixel Prophet", image: "/placeholder.svg?height=400&width=400" },
  { id: 3, name: "Neon Nights", artist: "Glow Master", image: "/placeholder.svg?height=400&width=400" },
  { id: 4, name: "Quantum Quokkas", artist: "Down Under Digital", image: "/placeholder.svg?height=400&width=400" },
  { id: 5, name: "Ethereal Echoes", artist: "Whisper Weaver", image: "/placeholder.svg?height=400&width=400" },
]

export default function DropGrid() {
  return (
    <section className="px-6 mb-32">
      <h2 className="text-3xl font-bold mb-8 text-center text-[#0154fa]">Upcoming Drops</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {drops.map((drop, index) => (
          <motion.div
            key={drop.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link href={`/mint/${drop.id}`} className="block group">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <img
                  src={drop.image || "/placeholder.svg"}
                  alt={drop.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gray-900 bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-[#0154fa] text-lg font-semibold">Mint Now</span>
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">{drop.name}</h3>
              <p className="text-gray-400">by {drop.artist}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

