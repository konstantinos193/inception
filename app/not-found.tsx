"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background dark:bg-[#0F1113]">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-20">
        <Image
          src="/grid-bg.png"
          alt="Grid background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background dark:via-[#0F1113]/50 dark:to-[#0F1113]" />

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        {/* Logo mark */}
        <div className="mb-8 flex justify-center animate-float">
          <div className="relative">
            <div className="absolute inset-0 bg-[#4C9FFC] blur-3xl opacity-20 rounded-full" />
            <Image
              src="/logo-mark.png"
              alt="Elevate Logo"
              width={120}
              height={120}
              className="relative"
            />
          </div>
        </div>

        {/* 404 Number */}
        <div className="relative mb-6">
          <h1 className="text-[12rem] md:text-[16rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#4C9FFC] to-transparent leading-none opacity-80">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[12rem] md:text-[16rem] font-bold text-[#4C9FFC] leading-none opacity-10 blur-sm">
              404
            </span>
          </div>
        </div>

        {/* Message */}
        <h2 className="font-barlow text-3xl md:text-4xl font-bold text-[#F5F3EF] mb-4 tracking-wide">
          Page Not Found
        </h2>
        <p className="text-[#6B7280] text-lg md:text-xl max-w-md mx-auto mb-12 font-mono">
          The page you're looking for has drifted into the void.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="group relative px-8 py-4 bg-[#4C9FFC] text-[#0F1113] font-barlow font-bold text-sm tracking-wider uppercase rounded hover:bg-[#4C9FFC]/90 transition-all duration-300 flex items-center gap-3"
          >
            <Home className="w-4 h-4" />
            Return Home
            <span className="absolute inset-0 rounded ring-2 ring-[#4C9FFC]/50 ring-offset-2 ring-offset-[#0F1113] opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="px-8 py-4 border border-[#3A4048] text-[#F5F3EF] font-barlow font-bold text-sm tracking-wider uppercase rounded hover:border-[#4C9FFC] hover:text-[#4C9FFC] transition-all duration-300 flex items-center gap-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Decorative elements */}
        <div className="mt-16 flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#4C9FFC] animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-[#4C9FFC]/50 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 rounded-full bg-[#4C9FFC]/25 animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[#4C9FFC]/20 rounded-tl-lg" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#4C9FFC]/20 rounded-br-lg" />
    </div>
  )
}
