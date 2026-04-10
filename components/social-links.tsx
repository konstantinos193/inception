import type React from "react"
import { X, MessageCircle } from "lucide-react"

export function SocialLinks() {
  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg mb-4">Follow our journey</h3>
      <div className="flex space-x-6">
        <SocialLink href="https://x.com/elevatelaunch" icon={<X className="h-5 w-5" />} label="X" />
        <SocialLink href="https://discord.gg/CcPpjUvNQj" icon={<MessageCircle className="h-5 w-5" />} label="Discord" />
      </div>
    </div>
  )
}

interface SocialLinkProps {
  href: string
  icon: React.ReactNode
  label: string
}

function SocialLink({ href, icon, label }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-amber-500 transition-colors duration-200"
      aria-label={label}
    >
      {icon}
    </a>
  )
}

