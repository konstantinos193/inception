"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Home, Compass, Star, Menu } from "lucide-react"

export default function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <motion.button
        className="w-14 h-14 bg-[#0154fa] rounded-full flex items-center justify-center text-white shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu size={24} />
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-16 right-0 bg-gray-800 rounded-lg shadow-xl p-4 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <NavItem href="/" icon={<Home size={20} />} label="Home" />
            <NavItem href="/explore" icon={<Compass size={20} />} label="Explore" />
            <NavItem href="/featured" icon={<Star size={20} />} label="Featured" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NavItem({ href, icon, label }) {
  return (
    <Link href={href} className="flex items-center space-x-2 text-white hover:text-[#0154fa] transition-colors">
      {icon}
      <span>{label}</span>
    </Link>
  )
}

