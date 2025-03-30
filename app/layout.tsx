import "./globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import Head from 'next/head'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Inception",
  description: "A Pre-Sale Ordinals & Runes Launchpad",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    url: 'https://inception.xyz',
    title: 'Inception',
    description: 'A Pre-Sale Ordinals & Runes Launchpad',
    siteName: 'Inception',
    images: [
      {
        url: 'https://i.postimg.cc/Jhz58dnq/image.png',
        width: 1200,
        height: 630,
        alt: 'Inception Launchpad',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inception',
    description: 'A Pre-Sale Ordinals & Runes Launchpad',
    images: ['https://i.postimg.cc/Jhz58dnq/image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://inception.xyz" />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://inception.xyz" />
        <meta property="og:title" content="Inception" />
        <meta property="og:description" content="A Pre-Sale Ordinals & Runes Launchpad" />
        <meta property="og:image" content="https://i.postimg.cc/Jhz58dnq/image.png" />
        <meta property="og:site_name" content="Inception" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Inception" />
        <meta name="twitter:description" content="A Pre-Sale Ordinals & Runes Launchpad" />
        <meta name="twitter:image" content="https://i.postimg.cc/Jhz58dnq/image.png" />
      </Head>
      <html lang="en">
        <body className={inter.className} style={{ backgroundColor: '#000000' }}>
          {children}
        </body>
      </html>
    </>
  )
}
