"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, ExternalLink, Wallet, BookOpen, MessageCircle, Shield, Zap, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Docs() {
  const [activeSection, setActiveSection] = useState("getting-started")

  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: BookOpen,
      content: "Welcome to Elevate - your gateway to discovering and collecting exceptional NFTs on the Bittensor ecosystem. Our platform makes it simple to explore, purchase, and manage digital art with confidence."
    },
    {
      id: "wallet-connection",
      title: "How to Connect Your Wallet",
      icon: Wallet,
      steps: [
        "Click the 'Connect Wallet' button in the top navigation",
        "Choose your preferred wallet provider (MetaMask, WalletConnect, etc.)",
        "Approve the connection request in your wallet",
        "Ensure you're connected to the correct network (Bittensor EVM)",
        "You're ready to start exploring and minting!"
      ]
    },
    {
      id: "minting-nfts",
      title: "Minting NFTs",
      icon: Zap,
      content: "Once your wallet is connected, you can mint NFTs from available collections. Each collection may have different requirements, pricing tiers, and minting phases. Always verify you're on the official contract address before proceeding.",
      tips: [
        "Check the collection details and pricing before minting",
        "Ensure you have sufficient funds in your wallet",
        "Some collections require allowlist spots for early access",
        "Gas fees vary based on network congestion"
      ]
    },
    {
      id: "support",
      title: "Support",
      icon: MessageCircle,
      content: "Need help? We're here for you. Our community and support team are ready to assist with any questions or issues you may encounter.",
      links: [
        { title: "Discord Community", description: "Join our active community for real-time help", url: "#" },
        { title: "Help Center", description: "Browse our comprehensive FAQ", url: "#" },
        { title: "Contact Support", description: "Get direct help from our team", url: "#" }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="ml-2 text-white font-semibold">Elevate</span>
            </Link>

            {/* Center Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/collections" className="text-gray-400 hover:text-white transition-colors">
                Collections
              </Link>
              <Link href="/docs" className="text-white font-medium">
                Docs
              </Link>
            </div>

            {/* Wallet Address Display */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-300">0x1234...5678</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Documentation
            </h1>
            <p className="text-gray-400 text-lg">
              Everything you need to know to get started with Elevate
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3">
              <nav className="sticky top-24 space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        activeSection === section.id
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{section.title}</span>
                      {activeSection === section.id && (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-9">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <div
                    key={section.id}
                    className={`${activeSection === section.id ? "block" : "hidden"}`}
                  >
                    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-800 mb-8">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-purple-400" />
                          </div>
                          <h2 className="text-3xl font-bold">{section.title}</h2>
                        </div>

                        {section.content && (
                          <p className="text-gray-300 text-lg leading-relaxed mb-6">
                            {section.content}
                          </p>
                        )}

                        {section.steps && (
                          <div className="space-y-4 mb-6">
                            {section.steps.map((step, index) => (
                              <div key={index} className="flex items-start gap-4">
                                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-purple-400 text-sm font-semibold">
                                    {index + 1}
                                  </span>
                                </div>
                                <p className="text-gray-300">{step}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {section.tips && (
                          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 mb-3">
                              <Shield className="w-5 h-5 text-yellow-400" />
                              <h3 className="text-yellow-400 font-semibold">Important Tips</h3>
                            </div>
                            <ul className="space-y-2">
                              {section.tips.map((tip, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-gray-300 text-sm">{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {section.links && (
                          <div className="grid md:grid-cols-3 gap-4">
                            {section.links.map((link, index) => (
                              <a
                                key={index}
                                href={link.url}
                                className="block p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <ExternalLink className="w-4 h-4 text-purple-400" />
                                  <ArrowRight className="w-4 h-4 text-gray-400" />
                                </div>
                                <h4 className="text-white font-semibold mb-1">{link.title}</h4>
                                <p className="text-gray-400 text-sm">{link.description}</p>
                              </a>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    {section.id === "getting-started" && (
                      <div className="grid md:grid-cols-2 gap-6">
                        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-purple-400" />
                              </div>
                              <h3 className="text-xl font-semibold">Join Community</h3>
                            </div>
                            <p className="text-gray-300 mb-4">
                              Connect with fellow collectors and artists in our vibrant community
                            </p>
                            <Button className="w-full bg-purple-500 hover:bg-purple-600">
                              Join Discord
                            </Button>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <Zap className="w-5 h-5 text-blue-400" />
                              </div>
                              <h3 className="text-xl font-semibold">Start Minting</h3>
                            </div>
                            <p className="text-gray-300 mb-4">
                              Explore featured collections and start your NFT journey
                            </p>
                            <Button className="w-full bg-blue-500 hover:bg-blue-600">
                              Browse Collections
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer CTA */}
          <div className="mt-16 text-center py-12 border-t border-gray-800">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-gray-400 mb-6">
              Our support team is here to help you 24/7
            </p>
            <div className="flex justify-center gap-4">
              <Button className="bg-purple-500 hover:bg-purple-600">
                Contact Support
              </Button>
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-white/5">
                View FAQ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
