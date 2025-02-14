import { motion } from "framer-motion"
import Link from "next/link"

const featuredDrops = [
  { id: 1, name: "Cosmic Apes", image: "/placeholder.svg?height=400&width=400" },
  { id: 2, name: "Digital Dreamers", image: "/placeholder.svg?height=400&width=400" },
  { id: 3, name: "Neon Nights", image: "/placeholder.svg?height=400&width=400" },
]

export default function FeaturedDrops() {
  return (
    <div className="flex justify-center items-center h-[50vh] my-20">
      <div className="relative w-[600px] h-[400px]">
        {featuredDrops.map((drop, index) => (
          <motion.div
            key={drop.id}
            className="absolute w-[300px] h-[300px] rounded-full overflow-hidden"
            style={{
              left: `${index * 150}px`,
              zIndex: 3 - index,
            }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: index * 0.2 }}
          >
            <Link href={`/mint/${drop.id}`} className="block w-full h-full relative group">
              <img src={drop.image || "/placeholder.svg"} alt={drop.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white">{drop.name}</h3>
                  <p className="text-sm text-blue-300">Featured Drop</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

