"use client"

import { useEffect, useRef } from "react"

export function HexagonBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Draw hexagon pattern
    const drawHexagonPattern = () => {
      const hexSize = 40
      const hexHeight = hexSize * Math.sqrt(3)
      const rows = Math.ceil(canvas.height / hexHeight) + 1
      const cols = Math.ceil(canvas.width / (hexSize * 1.5)) + 1

      ctx.strokeStyle = "rgba(255, 165, 0, 0.05)"
      ctx.lineWidth = 1

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * hexSize * 1.5
          const y = row * hexHeight + (col % 2 === 0 ? 0 : hexHeight / 2)

          drawHexagon(x, y, hexSize)
        }
      }
    }

    // Draw a single hexagon
    const drawHexagon = (x: number, y: number, size: number) => {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i
        const hx = x + size * Math.cos(angle)
        const hy = y + size * Math.sin(angle)

        if (i === 0) {
          ctx.moveTo(hx, hy)
        } else {
          ctx.lineTo(hx, hy)
        }
      }
      ctx.closePath()
      ctx.stroke()
    }

    // Initial draw
    drawHexagonPattern()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" style={{ opacity: 0.6 }} />
}

