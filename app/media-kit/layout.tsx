import type React from "react"
import { Navbar } from "@/components/navbar"
import { ClientProviders } from "@/components/client-providers"
import { ThemeProvider } from "@/components/theme-provider"

export default function MediaKitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="dark">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ClientProviders>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  )
}
