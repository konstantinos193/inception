"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface WebSocketMessage {
  type: "connected" | "project_update" | "mint_event"
  slug: string
  data?: any
  timestamp: number
}

interface UseWebSocketOptions {
  slug: string
  onProjectUpdate?: (data: any) => void
  onMintEvent?: (data: any) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

export function useWebSocket({
  slug,
  onProjectUpdate,
  onMintEvent,
  onConnect,
  onDisconnect,
  onError,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [connectionMethod, setConnectionMethod] = useState<'websocket' | 'polling' | 'disconnected'>('disconnected')
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 3 // Reduced for faster fallback
  const pollingInterval = 5000 // 5 seconds

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
    const wsUrl = `${apiUrl.replace("https://", "wss://").replace("http://", "ws://")}/ws?slug=${slug}`
    
    try {
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log(`WebSocket connected for project: ${slug}`)
        setIsConnected(true)
        setConnectionMethod('websocket')
        reconnectAttempts.current = 0
        onConnect?.()
      }

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          setLastMessage(message)

          switch (message.type) {
            case "connected":
              console.log(`WebSocket confirmed connection for project: ${message.slug}`)
              break
            case "project_update":
              console.log(`Received project update for ${message.slug}:`, message.data)
              onProjectUpdate?.(message.data)
              break
            case "mint_event":
              console.log(`Received mint event for ${message.slug}:`, message.data)
              onMintEvent?.(message.data)
              break
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error)
        }
      }

      wsRef.current.onclose = (event) => {
        console.log(`WebSocket disconnected for project: ${slug}, code: ${event.code}`)
        setIsConnected(false)
        wsRef.current = null
        onDisconnect?.()

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, delay)
        }
      }

      wsRef.current.onerror = (error) => {
        console.error(`WebSocket error for project ${slug}:`, error)
        setConnectionMethod('disconnected')
        
        // If WebSocket fails, fall back to HTTP polling
        if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.log(`WebSocket failed after ${maxReconnectAttempts} attempts, falling back to HTTP polling`)
          startPolling()
        } else {
          onError?.(error)
        }
      }
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
      onError?.(error as Event)
    }
  }, [slug, onConnect, onDisconnect, onError, onProjectUpdate, onMintEvent])

  const startPolling = useCallback(async () => {
    setConnectionMethod('polling')
    setIsConnected(true)
    console.log(`Starting HTTP polling for project: ${slug}`)
    
    const poll = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        const response = await fetch(`${apiUrl}/api/projects/${slug}/updates`)
        
        if (response.ok) {
          const data = await response.json()
          if (data && data.length > 0) {
            data.forEach((update: any) => {
              const message: WebSocketMessage = {
                type: update.type,
                slug,
                data: update.data,
                timestamp: update.timestamp || Date.now()
              }
              setLastMessage(message)
              
              if (update.type === 'project_update') {
                onProjectUpdate?.(update.data)
              } else if (update.type === 'mint_event') {
                onMintEvent?.(update.data)
              }
            })
          }
        }
      } catch (error) {
        console.error('HTTP polling error:', error)
      }
    }
    
    // Initial poll
    poll()
    
    // Set up recurring polling
    pollingIntervalRef.current = setInterval(poll, pollingInterval)
    
    onConnect?.()
  }, [slug, onConnect, onProjectUpdate, onMintEvent])

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnected")
      wsRef.current = null
    }

    setIsConnected(false)
    setConnectionMethod('disconnected')
    onDisconnect?.()
  }, [onDisconnect])

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn("WebSocket not connected, cannot send message")
    }
  }, [])

  // Auto-connect when slug changes
  useEffect(() => {
    if (slug) {
      // Try WebSocket first, fallback to polling if it fails
      connect()
      
      // Set a timeout to fall back to polling if WebSocket doesn't connect
      const fallbackTimeout = setTimeout(() => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          console.log('WebSocket connection timeout, falling back to HTTP polling')
          startPolling()
        }
      }, 5000) // 5 second timeout
      
      return () => {
        clearTimeout(fallbackTimeout)
        disconnect()
      }
    }
  }, [slug, connect, disconnect, startPolling])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    connectionMethod,
  }
}
