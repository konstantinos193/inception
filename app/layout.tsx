import "./globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ClientProviders } from "@/components/client-providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Elevate | NFT Launchpad on Bittensor",
  description: "Discover, launch, and collect NFTs on Bittensor EVM — where art meets decentralized AI.",
  icons: {
    icon: '/logo.webp',
    shortcut: '/logo.webp',
    apple: '/logo.webp',
  },
  openGraph: {
    type: 'website',
    url: 'https://elevateart.xyz',
    title: 'Elevate | NFT Launchpad on Bittensor',
    description: 'Discover, launch, and collect NFTs on Bittensor EVM — where art meets decentralized AI.',
    siteName: 'Elevate',
    images: [
      {
        url: '/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'Elevate — NFT Launchpad on Bittensor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elevate | NFT Launchpad on Bittensor',
    description: 'Discover, launch, and collect NFTs on Bittensor EVM — where art meets decentralized AI.',
    images: ['/og-image.webp'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
        <body className={inter.className} style={{ backgroundColor: '#000000' }}>
          <ClientProviders>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </ClientProviders>
        </body>
      </html>
  )
}
