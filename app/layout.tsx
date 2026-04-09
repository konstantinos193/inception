import "./globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ClientProviders } from "@/components/client-providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Elevate",
  description: "A Pre-Sale Ordinals & Runes Launchpad",
  icons: {
    icon: '/logo.webp',
    shortcut: '/logo.webp',
    apple: '/logo.webp',
  },
  openGraph: {
    type: 'website',
    url: 'https://elevate.xyz',
    title: 'Elevate',
    description: 'A Pre-Sale Ordinals & Runes Launchpad',
    siteName: 'Elevate',
    images: [
      {
        url: '/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'Elevate Launchpad',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elevate',
    description: 'A Pre-Sale Ordinals & Runes Launchpad',
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
