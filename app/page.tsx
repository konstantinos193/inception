"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import FeaturedDropsCarousel from "@/components/featured-drops-carousel";
import UpcomingDropsGrid from "@/components/upcoming-drops-grid";
import DreamLayers from "@/components/dream-layers";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const [isLoading, setIsLoading] = useState(true);

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 45]);

  // Simulate loading with useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds loading simulation

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 backdrop-blur-lg flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#0154fa] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 text-lg">Loading dreams...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <Header />

      {/* DreamLayers */}
      <DreamLayers className="pointer-events-none" />

      {/* Main Content */}
      <main className="flex-grow pt-24 z-10" ref={containerRef}>
        {/* Hero Section */}
        <motion.section
          style={{ opacity, scale, rotateX }}
          className="mb-32 perspective-1000"
        >
          <h1 className="text-4xl md:text-7xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[#0154fa] to-[#00ffff]">
            Build Your Dreams
          </h1>
          <p className="text-lg md:text-xl text-center text-gray-400 max-w-2xl mx-auto">
            Explore layers of imagination
          </p>
        </motion.section>

        {/* Featured Drops Carousel */}
        <FeaturedDropsCarousel />

        {/* Upcoming Drops Grid */}
        <UpcomingDropsGrid />

        {/* Call-to-Action Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-[#0154fa]">
              Launch Your Dream with Us
            </h2>
            <p className="text-lg md:text-xl mb-8">
              Are you an artist with a vision that pushes the boundaries of reality? Join us in creating the next
              generation of mind-bending NFTs.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a
                href="https://discord.gg/WVXzaXwcXr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#0154fa] text-white px-6 py-3 rounded-full font-semibold text-lg hover:bg-[#0143d1] transition-colors shadow-lg hover:shadow-[#0154fa]/50"
              >
                Open a Ticket in Our Discord
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
