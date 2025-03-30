"use client"

import { useEffect, useState } from "react"

export function CountdownTimer() {
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    // Set launch date to 30 days from now
    const launchDate = new Date()
    launchDate.setDate(launchDate.getDate() + 30)

    const interval = setInterval(() => {
      const now = new Date()
      const difference = launchDate.getTime() - now.getTime()

      const d = Math.floor(difference / (1000 * 60 * 60 * 24))
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((difference % (1000 * 60)) / 1000)

      setDays(d)
      setHours(h)
      setMinutes(m)
      setSeconds(s)

      if (difference <= 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full">
      <h3 className="text-center text-xl mb-6 text-gray-400">Launching In</h3>
      <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-xl mx-auto">
        <TimeUnit value={days} label="DAYS" />
        <TimeUnit value={hours} label="HOURS" />
        <TimeUnit value={minutes} label="MINUTES" />
        <TimeUnit value={seconds} label="SECONDS" />
      </div>
    </div>
  )
}

interface TimeUnitProps {
  value: number
  label: string
}

function TimeUnit({ value, label }: TimeUnitProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full aspect-square bg-black bg-opacity-50 border border-orange-500/20 rounded-lg flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent"></div>
        <span className="text-2xl md:text-4xl font-bold text-white relative z-10">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs mt-2 text-gray-400">{label}</span>
    </div>
  )
}

