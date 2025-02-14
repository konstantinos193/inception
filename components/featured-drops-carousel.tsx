"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export default function FeaturedDropsCarousel() {
  const [featuredDrops, setFeaturedDrops] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchFeaturedDrops = async () => {
      try {
        const response = await fetch('/api/featuredDrops')
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        setFeaturedDrops(data)
      } catch (error) {
        console.error('Error fetching featured drops:', error)
      }
    }

    fetchFeaturedDrops()
  }, [])

  // Handle empty state
  if (featuredDrops.length === 0) {
    return (
      <section className="mb-32 px-6 py-12 bg-gray-800 relative overflow-hidden">
        <h2 className="text-4xl font-bold mb-8 text-center text-[#0154fa]">Featured Drops</h2>
        <div className="text-center text-white">
          <p className="text-xl">Oops! It looks like there are no collections yet.</p>
          <p className="text-lg">Maybe they are still in the cosmic void!</p>
        </div>
      </section>
    )
  }

  // Ensure currentIndex is valid
  const currentDrop = featuredDrops[currentIndex] || {}

  return (
    <section className="mb-32 px-6 py-12 bg-gray-800 relative overflow-hidden">
      <h2 className="text-4xl font-bold mb-8 text-center text-[#0154fa]">Featured Drops</h2>
      <div className="max-w-6xl mx-auto relative h-[400px] md:h-[600px]">
        <AnimatePresence initial={false}>
          {featuredDrops.length === 1 ? (
            // Static display for a single featured drop
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={currentDrop.image || "/placeholder.svg"}
                  alt={currentDrop.name || "Loading..."}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
                  <h3 className="text-xl md:text-4xl font-bold text-white mb-2">{currentDrop.name || "Loading..."}</h3>
                  <p className="text-lg md:text-xl text-gray-300 mb-4">by {currentDrop.artist || "Loading..."}</p>
                  <p className="text-xl md:text-2xl font-semibold text-[#0154fa] mb-6">{currentDrop.price || "Loading..."} APE</p>
                  <Link
                    href={`/mint/${currentDrop.id}`}
                    className="inline-block bg-[#0154fa] text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-[#0143d1] transition-colors shadow-lg hover:shadow-[#0154fa]/50"
                  >
                    Mint Now
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            // Animated display for multiple featured drops
            <motion.div
              key={currentIndex}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={currentDrop.image || "/placeholder.svg"}
                  alt={currentDrop.name || "Loading..."}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
                  <h3 className="text-xl md:text-4xl font-bold text-white mb-2">{currentDrop.name || "Loading..."}</h3>
                  <p className="text-lg md:text-xl text-gray-300 mb-4">by {currentDrop.artist || "Loading..."}</p>
                  <p className="text-xl md:text-2xl font-semibold text-[#0154fa] mb-6">{currentDrop.price || "Loading..."} APE</p>
                  <Link
                    href={`/mint/${currentDrop.id}`}
                    className="inline-block bg-[#0154fa] text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-[#0143d1] transition-colors shadow-lg hover:shadow-[#0154fa]/50"
                  >
                    Mint Now
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {featuredDrops.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${index === currentIndex ? "bg-[#0154fa]" : "bg-gray-400"}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

