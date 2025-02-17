"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { useMediaQuery } from 'react-responsive';

export default function Header() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    // Check if MetaMask is installed
    if (window.ethereum) {
      setIsMetaMaskInstalled(true);
    }
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const address = accounts[0];
        setWalletAddress(address);

        // Switch to ApeChain network
        await switchNetwork();
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x8173", // Hexadecimal for 33139
            chainName: "ApeChain",
            rpcUrls: ["https://apechain.calderachain.xyz/http"],
            nativeCurrency: {
              name: "APE",
              symbol: "APE",
              decimals: 18,
            },
            blockExplorerUrls: ["https://apechain.calderaexplorer.xyz/"],
          },
        ],
      });
    } catch (error) {
      console.error("Error switching network:", error);
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 p-4 bg-gray-900 bg-opacity-100 backdrop-blur-md pointer-events-auto">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Inception NFT Logo" className="h-16 mr-2" />
          </Link>
          
          {/* Desktop Navigation Links */}
          {!isMobile && (
            <div className="flex items-center space-x-6">
              <Link href="/explore" className="text-gray-300 hover:text-[#0154fa] transition-colors">
                Explore
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-[#0154fa] transition-colors">
                About
              </Link>
              <button
                onClick={toggleDropdown}
                className="px-4 py-2 bg-[#0154fa] text-white rounded-full hover:bg-[#0143d1] transition-colors"
              >
                {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
              </button>
              {walletAddress && dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                  <Link href="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-200" onClick={() => setDropdownOpen(false)}>
                    Profile
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Hamburger Menu Button for Mobile */}
          {isMobile && (
            <button onClick={toggleMenu} className="text-white">
              {menuOpen ? '✖' : '☰'} {/* Hamburger icon */}
            </button>
          )}
        </nav>
      </header>

      {/* Sliding Menu for Mobile */}
      {isMobile && (
        <div className={`menu ${menuOpen ? 'open' : ''}`}>
          <h2 className="text-lg font-bold text-white">Menu</h2>
          <button onClick={toggleMenu} className="absolute top-2 right-2 text-white">
            &times; {/* Close icon */}
          </button>
          <div className="mt-4">
            <Link href="/explore" className="block py-2 hover:text-[#0154fa] transition-colors">
              Explore
            </Link>
            <Link href="/about" className="block py-2 hover:text-[#0154fa] transition-colors">
              About
            </Link>
            <button
              onClick={toggleDropdown}
              className="mt-4 px-4 py-2 bg-[#0154fa] text-white rounded-full hover:bg-[#0143d1] transition-colors"
            >
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
            </button>
          </div>
        </div>
      )}

      {/* Popup for MetaMask installation status */}
      {isMetaMaskInstalled && showPopup && (
        <div className="fixed top-20 right-4 bg-white p-4 rounded shadow-lg z-50">
          <div className="flex items-center">
            <img src="/metamask-logo.png" alt="MetaMask" className="h-8 mr-2" />
            <span className="text-green-600">MetaMask is installed!</span>
            <button onClick={handlePopupClose} className="ml-auto text-gray-500 hover:text-gray-700">
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}