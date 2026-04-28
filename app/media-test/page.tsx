"use client"

import { MediaRenderer } from "@/components/MediaRenderer"
import { useState } from "react"

const testMedia = [
  {
    type: "image",
    src: "https://picsum.photos/800/600",
    title: "Test Image (JPG)"
  },
  {
    type: "gif",
    src: "https://media.giphy.com/media/3o7TKUM1IgibQFVVa0/giphy.gif",
    title: "Test GIF"
  },
  {
    type: "video",
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "Test Video (MP4)"
  },
  {
    type: "audio",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    title: "Test Audio (MP3)"
  },
  {
    type: "html",
    src: "https://www.w3schools.com/html/",
    title: "Test HTML (iframe)"
  }
]

export default function MediaTestPage() {
  const [selectedMedia, setSelectedMedia] = useState(testMedia[0])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Media Renderer Test</h1>
        
        {/* Media type selector */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {testMedia.map((media, index) => (
            <button
              key={index}
              onClick={() => setSelectedMedia(media)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedMedia.type === media.type
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {media.title}
            </button>
          ))}
        </div>

        {/* Media display */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-2xl font-semibold mb-4">{selectedMedia.title}</h2>
          <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
            <MediaRenderer
              src={selectedMedia.src}
              alt={selectedMedia.title}
              fill
              className="object-contain"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Source: {selectedMedia.src}
          </p>
        </div>

        {/* Info section */}
        <div className="mt-8 bg-card rounded-xl p-6 border border-border">
          <h3 className="text-xl font-semibold mb-4">Supported Media Types</h3>
          <ul className="space-y-2 text-sm">
            <li><strong>Images:</strong> JPG, JPEG, PNG, GIF, WebP, SVG</li>
            <li><strong>Videos:</strong> MP4, WebM, MOV, AVI</li>
            <li><strong>Audio:</strong> MP3, WAV, OGG, M4A, AAC</li>
            <li><strong>HTML:</strong> HTML, HTM (rendered in iframe with sandbox)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
