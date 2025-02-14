import './globals.css';
import { Inter } from 'next/font/google';
import type React from 'react';
import Head from 'next/head';
import Header from "@/components/Header"; // Import Header using the @ alias
import Footer from "@/components/Footer"; // Import Footer using the @ alias

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Inception',
  description: 'Where Dreams Become Digital Reality',
  generator: 'v0.dev',
  openGraph: {
    type: 'website',
    url: 'https://inception.wtf', // Replace with your actual URL
    title: 'Inception',
    description: 'Where Dreams Become Digital Reality',
    siteName: 'Inception', // Add site name
    images: [
      {
        url: 'https://i.postimg.cc/cCF24cL2/Untitled-design-37.png', // Replace with your actual OG image URL
        width: 1200,
        height: 630,
        alt: 'Inception',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inception',
    description: 'Where Dreams Become Digital Reality',
    images: ['https://i.postimg.cc/cCF24cL2/Untitled-design-37.png'], // Replace with your actual Twitter image URL
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Viewport for responsive design */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://inception.wtf" /> {/* Replace with your actual URL */}

        {/* Robots meta tag */}
        <meta name="robots" content="index, follow" />

        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://inception.wtf" /> {/* Replace with your actual URL */}
        <meta property="og:title" content="Inception" />
        <meta property="og:description" content="Where Dreams Become Digital Reality" />
        <meta property="og:image" content="https://i.postimg.cc/cCF24cL2/Untitled-design-37.png" /> {/* Replace with your actual OG image URL */}
        <meta property="og:site_name" content="Inception" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Inception" />
        <meta name="twitter:description" content="Where Dreams Become Digital Reality" />
        <meta name="twitter:image" content="https://i.postimg.cc/cCF24cL2/Untitled-design-37.png" /> {/* Replace with your actual Twitter image URL */}

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} dream-bg`}>
        <Header /> {/* Add Header component */}
        {children}
        <Footer /> {/* Add Footer component */}
      </body>
    </html>
  );
}