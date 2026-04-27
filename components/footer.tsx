"use client"

import Link from "next/link"
import Image from "next/image"
import { useDiscordInvite } from "../hooks/useDiscordInvite"

export function Footer() {
  const { inviteUrl } = useDiscordInvite();

  return (
    <footer className="bg-transparent">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="border-t-2 mb-10 border-[var(--electric-blue)] dark:border-white" />
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/">
              <Image src="/logo-dark.png" alt="Elevate" width={140} height={40} className="h-10 w-auto hidden dark:block" />
              <Image src="/logo-light.png" alt="Elevate" width={140} height={40} className="h-10 w-auto block dark:hidden" />
            </Link>
          </div>

          {/* Right: Follow Us + Quick Links */}
          <div className="flex flex-col gap-6 items-start md:items-end">
            {/* Follow Us */}
            <div className="flex flex-col items-start md:items-end gap-3">
              <span className="text-xs font-bold tracking-widest uppercase text-gray-500 dark:text-white">Follow Us:</span>
              <div className="flex gap-2">
                <a href="https://x.com/elevatelaunch" target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors"
                  style={{ color: "var(--electric-blue)", border: "1.5px solid var(--electric-blue)" }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href={inviteUrl} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors"
                  style={{ color: "var(--electric-blue)", border: "1.5px solid var(--electric-blue)" }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col items-start md:items-end gap-3">
              <span className="text-xs font-bold tracking-widest uppercase text-gray-500 dark:text-white">Quick Links</span>
              <div className="flex gap-6">
                <Link href="/about" className="text-gray-400 dark:text-white hover:opacity-70 transition-opacity text-sm">About Us</Link>
                <Link href="/media-kit" className="text-gray-400 dark:text-white hover:opacity-70 transition-opacity text-sm">Media Kit</Link>
                <Link href="/collections" className="text-gray-400 dark:text-white hover:opacity-70 transition-opacity text-sm">Collections</Link>
                <a href={inviteUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 dark:text-white hover:opacity-70 transition-opacity text-sm">Launch with Us</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t-2 border-[var(--electric-blue)] dark:border-white flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
          <span className="text-gray-400 dark:text-white">
            © 2026{" "}
            <Link href="/" className="text-[#4A9EFF] hover:text-[#6DB3FF] transition-colors">ELEVATE</Link>
            . All rights reserved.
          </span>
          <div className="flex gap-6">
            <Link href="/docs" className="text-gray-400 dark:text-white hover:opacity-70 transition-opacity">Documentation</Link>
            <Link href="/privacy" className="text-gray-400 dark:text-white hover:opacity-70 transition-opacity">Privacy</Link>
            <Link href="/terms" className="text-gray-400 dark:text-white hover:opacity-70 transition-opacity">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
