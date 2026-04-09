"use client"

import { useState } from "react"
import { Share2, Link2, Check, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ShareButtonProps {
  title: string
  description: string
  url: string
  className?: string
}

export function ShareButton({ title, description, url, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} - ${description}`)}&url=${encodeURIComponent(url)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
  }

  const shareOnNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setShowOptions(!showOptions)}
        className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>

      {showOptions && (
        <Card className="absolute top-full mt-2 right-0 w-48 bg-black/90 border-purple-500/20 backdrop-blur-sm z-50">
          <CardContent className="p-2">
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={shareOnTwitter}
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-purple-500/10"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              
              {typeof navigator !== 'undefined' && navigator.share && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={shareOnNative}
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-purple-500/10"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-purple-500/10"
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                ) : (
                  <Link2 className="w-4 h-4 mr-2" />
                )}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  )
}
