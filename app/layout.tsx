import "./globals.css"
import { IBM_Plex_Sans, IBM_Plex_Mono, Barlow_Condensed, Goldman } from "next/font/google"
import type React from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ClientProviders } from "@/components/client-providers"
import { ThemeProvider } from "@/components/theme-provider"

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
})
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
})
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700", "800"],
  style: ["normal"],
  variable: "--font-barlow",
})
const goldman = Goldman({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-goldman",
})

export const metadata = {
  title: {
    default: "Elevate | Premium NFT Launchpad on Bittensor EVM",
    template: "%s | Elevate"
  },
  description: "Curated excellence meets blockchain innovation. The premium NFT launchpad on Bittensor EVM - where verified creators launch exceptional collections.",
  keywords: [
    'NFT',
    'digital art',
    'Bittensor EVM',
    'blockchain',
    'cryptocurrency',
    'NFT launchpad',
    'launch NFT',
    'mint NFT',
    'TAO',
    'Elevate',
    'curated',
    'verified',
    'premium',
    'Web3'
  ],
  authors: [{ name: 'Elevate Launchpad' }],
  creator: 'Elevate Launchpad',
  publisher: 'Elevate Launchpad',
  category: 'technology',
  classification: 'website',
  referrer: 'origin-when-cross-origin',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://elevateart.xyz',
    title: 'Elevate | Premium NFT Launchpad on Bittensor EVM',
    description: 'Curated excellence meets blockchain innovation. The premium NFT launchpad on Bittensor EVM - where verified creators launch exceptional collections.',
    siteName: 'Elevate Launchpad',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Elevate Launchpad - Premium NFT Launching on Bittensor EVM',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elevate | Premium NFT Launchpad on Bittensor EVM',
    description: 'Curated excellence meets blockchain innovation. The premium NFT launchpad on Bittensor EVM - where verified creators launch exceptional collections.',
    images: {
      url: '/og-image.png',
      alt: 'Elevate Launchpad - Premium NFT Launching on Bittensor EVM',
    },
    creator: '@ElevateArtXYZ',
    site: '@ElevateArtXYZ',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: 'https://elevateart.xyz',
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  other: {
    'theme-color': '#000000',
    'msapplication-TileColor': '#000000',
    'msapplication-config': '/browserconfig.xml',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${barlowCondensed.variable} ${goldman.variable} ${ibmPlexSans.className}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ClientProviders>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  )
}
