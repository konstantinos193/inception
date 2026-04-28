"use client"

import Image from "next/image"
import { useState, useRef, useEffect } from "react"

interface MediaRendererProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  unoptimized?: boolean
  sizes?: string
  fill?: boolean
  style?: React.CSSProperties
  onLoad?: () => void
  onError?: () => void
}

export function MediaRenderer({
  src,
  alt,
  className = "",
  priority = false,
  unoptimized = true,
  sizes = "100vw",
  fill = true,
  style,
  onLoad,
  onError,
}: MediaRendererProps) {
  const [mediaType, setMediaType] = useState<"image" | "video" | "gif" | "audio" | "html">("image")
  const [isLoaded, setIsLoaded] = useState(false)
  const [showFallback, setShowFallback] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Detect media type based on file extension
  useEffect(() => {
    if (!src) return

    const extension = src.split('.').pop()?.toLowerCase()
    
    if (extension === 'mp4' || extension === 'webm' || extension === 'mov') {
      setMediaType("video")
    } else if (extension === 'gif') {
      setMediaType("gif")
    } else if (extension === 'mp3' || extension === 'wav' || extension === 'ogg' || extension === 'm4a') {
      setMediaType("audio")
    } else if (extension === 'html' || extension === 'htm') {
      setMediaType("html")
    } else {
      setMediaType("image")
    }
  }, [src])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setShowFallback(true)
    onError?.()
  }

  // Show fallback after 3 seconds if image hasn't loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoaded) {
        setShowFallback(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [isLoaded])

  const handleVideoLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleAudioLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  if (mediaType === "video") {
    return (
      <video
        ref={videoRef}
        className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={style}
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={handleVideoLoad}
        onError={handleError}
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/webm" />
        <source src={src} type="video/quicktime" />
        Your browser does not support the video tag.
      </video>
    )
  }

  if (mediaType === "gif") {
    return (
      <img
        src={src}
        alt={alt}
        className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={style}
        onLoad={handleLoad}
        onError={handleError}
      />
    )
  }

  if (mediaType === "audio") {
    return (
      <div className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} style={style}>
        <audio
          ref={audioRef}
          controls
          preload="metadata"
          onLoadedData={handleAudioLoad}
          onError={handleError}
          className="w-full h-full"
        >
          <source src={src} type="audio/mpeg" />
          <source src={src} type="audio/wav" />
          <source src={src} type="audio/ogg" />
          <source src={src} type="audio/mp4" />
          Your browser does not support the audio element.
        </audio>
      </div>
    )
  }

  if (mediaType === "html") {
    return (
      <div className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} style={style}>
        <iframe
          src={src}
          className="w-full h-full border-0"
          onLoad={handleLoad}
          onError={handleError}
          title={alt || "HTML content"}
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    )
  }

  // Default to Next.js Image for static images
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={`${className} ${!isLoaded && !showFallback ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized}
      style={style}
      onLoad={handleLoad}
      onError={handleError}
    />
  )
}
