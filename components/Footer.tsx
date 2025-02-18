"use client"

import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faDiscord } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 py-8 z-50 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Desktop Version */}
        <div className="hidden md:flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="flex items-center mb-4">
              <img src="/logo.png" alt="Inception NFT Logo" className="h-16 mr-2" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/faq" className="hover:text-[#0154fa]">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-[#0154fa]">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-[#0154fa]">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div className="flex space-x-4">
              <a href="https://x.com/Inceptionlaunch" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0154fa]">
                <FontAwesomeIcon icon={faXTwitter} className="h-5 w-5" />
              </a>
              <a href="https://discord.gg/apeeliteclub" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0154fa]">
                <FontAwesomeIcon icon={faDiscord} className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-4 text-center">
            <p>&copy; 2025 Inception NFT. All rights reserved.</p>
          </div>
        </div>

        {/* Mobile Version */}
        <div className="block md:hidden px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src="/logo.png" alt="Inception NFT Logo" className="h-16" />
            </div>
            <div className="flex space-x-4">
              <a href="https://x.com/Inceptionlaunch" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0154fa]">
                <FontAwesomeIcon icon={faXTwitter} className="h-5 w-5" />
              </a>
              <a href="https://discord.gg/apeeliteclub" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0154fa]">
                <FontAwesomeIcon icon={faDiscord} className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="text-center mt-4">
            <p>&copy; 2025 Inception NFT. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
} 