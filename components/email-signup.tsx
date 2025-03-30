"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function EmailSignup() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setMessage("Please enter your email address")
      return
    }

    setIsSubmitting(true)
    setMessage("")

    // This is a placeholder for your actual email signup logic
    // You would typically send this to an API endpoint
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setMessage("Thank you for signing up! We'll keep you updated.")
      setEmail("")
    } catch (error) {
      setMessage("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <h3 className="text-lg md:text-xl mb-4 font-medium">Get notified when we launch</h3>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-900 border-gray-700 focus:border-amber-500"
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
        >
          {isSubmitting ? "Submitting..." : "Notify Me"}
        </Button>
      </form>

      {message && (
        <p className={`mt-2 text-sm ${message.includes("Thank you") ? "text-green-500" : "text-red-500"}`}>{message}</p>
      )}
    </div>
  )
}

