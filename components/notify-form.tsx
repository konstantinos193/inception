"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Check } from "lucide-react"

export function NotifyForm() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return

    setIsSubmitting(true)

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsSuccess(true)
      setEmail("")
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex items-center space-x-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
        <Check className="w-5 h-5 flex-shrink-0" />
        <p>Thank you! We'll notify you when we launch.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-grow">
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-black/20 backdrop-blur-sm border-gray-800 focus:border-orange-500 h-12"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
      >
        {isSubmitting ? (
          "Submitting..."
        ) : (
          <>
            Get Notified <ArrowRight className="ml-2 w-4 h-4" />
          </>
        )}
      </Button>
    </form>
  )
}

