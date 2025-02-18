import "./globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import Head from 'next/head'
import { ProfileProvider } from '@/context/ProfileContext'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Inception",
  description: "Dive into a world of dreams with our Inception-inspired NFT collections",
    generator: 'v0.dev'
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
      </Head>
      <html lang="en">
        <body className={`${inter.className} dream-bg`}>{children}</body>
      </html>
    </ProfileProvider>
  )
}



import './globals.css'