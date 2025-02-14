"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion"
import Link from "next/link"
import Countdown from "react-countdown"
import { supabase } from '../lib/supabaseClient'; // Adjusted path

export default function UpcomingDropsGrid() {
  const [upcomingDrops, setUpcomingDrops] = useState([]);

  useEffect(() => {
    const fetchUpcomingDrops = async () => {
      try {
        const { data, error } = await supabase
          .from('upcoming_drops') // Replace with your actual table name
          .select('*')
          .order('launchDate', { ascending: true }); // Order by launch date

        if (error) {
          throw new Error(error.message);
        }

        setUpcomingDrops(data);
      } catch (error) {
        console.error('Error fetching upcoming drops:', error);
      }
    };

    fetchUpcomingDrops();
  }, []);

  return (
    <section className="px-6 mb-32">
      <h2 className="text-4xl font-bold mb-8 text-center text-[#0154fa]">Upcoming Drops</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {upcomingDrops.length === 0 ? (
          <div className="text-center text-white">
            <p>No upcoming drops available at the moment.</p>
          </div>
        ) : (
          upcomingDrops.map((drop, index) => (
            <motion.div
              key={drop.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/mint/${drop.id}`} className="block group">
                <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg cursor-pointer">
                  <img
                    src={drop.image || "/placeholder.svg"}
                    alt={drop.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-xl font-semibold text-white">{drop.name}</h3>
                    <p className="text-gray-300">by {drop.artist}</p>
                    <p className="text-[#0154fa] font-semibold mt-2">{drop.price} ETH</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="text-xl font-semibold text-white">{drop.name}</h3>
                  <p className="text-gray-400">by {drop.artist}</p>
                  <p className="text-[#0154fa] font-semibold">{drop.price} ETH</p>
                  <div className="text-gray-300">
                    <Countdown
                      date={drop.launchDate}
                      renderer={({ days, hours, minutes, seconds }) => (
                        <span>
                          Launches in: {days}d {hours}h {minutes}m {seconds}s
                        </span>
                      )}
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </section>
  )
}

