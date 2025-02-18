"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from '@/lib/supabaseClient'
import DreamLayers from "@/components/dream-layers"
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ExplorePage() {
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('upcoming') // 'upcoming' or 'past'

  useEffect(() => {
    const fetchCollections = async () => {
      const { data, error } = await supabase
        .from('nft_collections')
        .select('*')
        
      if (error) {
        console.error('Error fetching collections:', error)
      } else {
        // Parse the phases and sort collections
        const parsedCollections = data.map(collection => ({
          ...collection,
          phases: collection.phases?.phases || []
        }))

        setCollections(parsedCollections)
      }
      setLoading(false)
    }

    fetchCollections()
  }, [])

  const isCollectionLive = (collection: any) => {
    if (!collection.phases || collection.phases.length === 0) return false
    const lastPhase = collection.phases[collection.phases.length - 1]
    return new Date(lastPhase.end).getTime() > Date.now()
  }

  const filteredCollections = collections.filter(collection => 
    filter === 'upcoming' ? isCollectionLive(collection) : !isCollectionLive(collection)
  )

  if (loading) return <div>Loading...</div>

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 text-gray-100 py-32">
        <DreamLayers />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">Explore Drops</h1>
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'upcoming' 
                  ? 'bg-[#0154fa] text-white' 
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'past' 
                  ? 'bg-[#0154fa] text-white' 
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              Past Drops
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((collection) => {
              const nextPhase = collection.phases.find((phase: any) => 
                new Date(phase.start).getTime() > Date.now()
              )
              const currentPhase = collection.phases.find((phase: any) => {
                const now = Date.now()
                return now >= new Date(phase.start).getTime() && now < new Date(phase.end).getTime()
              })
              const lastPhase = collection.phases[collection.phases.length - 1]

              return (
                <Link 
                  key={collection.id} 
                  href={`/mint/${collection.id}`}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform duration-200"
                >
                  <img
                    src={collection.image || "/placeholder.svg"}
                    alt={collection.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-2">{collection.name}</h2>
                    <p className="text-gray-400 mb-4">by {collection.artist}</p>
                    
                    {filter === 'upcoming' ? (
                      currentPhase ? (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm inline-block">
                          Live: {currentPhase.name}
                        </div>
                      ) : nextPhase ? (
                        <div className="bg-[#0154fa] text-white px-3 py-1 rounded-full text-sm inline-block">
                          Next: {nextPhase.name}
                        </div>
                      ) : (
                        <div className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm inline-block">
                          Coming Soon
                        </div>
                      )
                    ) : (
                      <div className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm inline-block">
                        Ended: {new Date(lastPhase.end).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          {filteredCollections.length === 0 && (
            <div className="text-center text-gray-400 mt-12">
              No {filter} drops found.
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

