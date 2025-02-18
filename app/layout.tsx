import "./globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import Head from 'next/head'
import { ProfileProvider } from '@/context/ProfileContext'


const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Inception",
  description: "Where Dreams Become Digital Reality",
  openGraph: {
    type: 'website',
    url: 'https://inception.wtf',
    title: 'Inception',
    description: 'Where Dreams Become Digital Reality',
    siteName: 'Inception',
    images: [
      {
        url: 'https://i.postimg.cc/ZRXgrvGX/Untitled-design-42.png',
        width: 1200,
        height: 630,
        alt: 'Inception Launchpad',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inception',
    description: 'Where Dreams Become Digital Reality',
    images: ['https://i.postimg.cc/ZRXgrvGX/Untitled-design-42.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProfileProvider>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://inception.wtf" />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://inception.wtf" />
        <meta property="og:title" content="Inception" />
        <meta property="og:description" content="Where Dreams Become Digital Reality" />
        <meta property="og:image" content="https://i.postimg.cc/ZRXgrvGX/Untitled-design-42.png" />
        <meta property="og:site_name" content="Inception" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Inception" />
        <meta name="twitter:description" content="Where Dreams Become Digital Reality" />
        <meta name="twitter:image" content="https://i.postimg.cc/ZRXgrvGX/Untitled-design-42.png" />
      </Head>
      <html lang="en">
        <body className={`${inter.className} dream-bg`}>
          {children}
        </body>
      </html>
    </ProfileProvider>
  )
}

import './globals.css'