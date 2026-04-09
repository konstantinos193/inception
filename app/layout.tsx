import "./globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ClientProviders } from "@/components/client-providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "TAO EVM NFT Launchpad",
  description: "A TAO EVM NFT Launchpad for Digital Collectibles",
  icons: {
    icon: '/logo.webp',
    shortcut: '/logo.webp',
    apple: '/logo.webp',
  },
  openGraph: {
    type: 'website',
    url: 'https://tao-evm-nft-launchpad.xyz',
    title: 'TAO EVM NFT Launchpad',
    description: 'A TAO EVM NFT Launchpad for Digital Collectibles',
    siteName: 'TAO EVM NFT Launchpad',
    images: [
      {
        url: '/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'TAO EVM NFT Launchpad',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TAO EVM NFT Launchpad',
    description: 'A TAO EVM NFT Launchpad for Digital Collectibles',
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
