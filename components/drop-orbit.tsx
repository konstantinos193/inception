import { motion } from "framer-motion"
import Link from "next/link"

const drops = [
  { id: 4, name: "Pixel Punks", image: "/placeholder.svg?height=150&width=150" },
  { id: 5, name: "Ethereal Echoes", image: "/placeholder.svg?height=150&width=150" },
  { id: 6, name: "Cybernetic Cats", image: "/placeholder.svg?height=150&width=150" },
  { id: 7, name: "Astro Avatars", image: "/placeholder.svg?height=150&width=150" },
  { id: 8, name: "Quantum Quokkas", image: "/placeholder.svg?height=150&width=150" },
  { id: 9, name: "Mystic Moons", image: "/placeholder.svg?height=150&width=150" },
]

export default function DropOrbit() {
  return (
    <div className="relative h-[600px] my-20">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 bg-[#0154fa] rounded-full glow"></div>
      </div>
      {drops.map((drop, index) => (
        <motion.div
          key={drop.id}
          className="absolute top-1/2 left-1/2 w-[150px] h-[150px]"
          initial={{ scale: 0, x: "-50%", y: "-50%" }}
          animate={{
            scale: 1,
            x: "-50%",
            y: "-50%",
            rotate: [0, 360],
            transition: {
              rotate: {
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              },
              scale: { duration: 1, delay: index * 0.2 },
            },
          }}
          style={{
            transformOrigin: "center center",
          }}
        >
          <Link
            href={`/mint/${drop.id}`}
            className="block w-full h-full rounded-full overflow-hidden border-2 border-[#0154fa] glow"
            style={{
              transform: `rotate(${index * 60}deg) translateX(200px) rotate(-${index * 60}deg)`,
            }}
          >
            <img src={drop.image || "/placeholder.svg"} alt={drop.name} className="w-full h-full object-cover" />
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

