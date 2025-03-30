import Image from "next/image"
import { HexagonBackground } from "@/components/hexagon-background"
import { NotifyForm } from "@/components/notify-form"
import { Bitcoin, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <HexagonBackground />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-4xl mx-auto w-full">
          {/* Logo and Title Section */}
          <div className="flex flex-col items-center mb-16">
            <div className="relative w-32 h-32 md:w-40 md:h-40 mb-8">
              <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl"></div>
              <Image src="/logo.png" alt="Inception Logo" fill className="object-contain relative z-10" priority />
            </div>

            <h1 className="text-6xl md:text-8xl font-bold text-center tracking-tighter mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500">
                INCEPTION
              </span>
            </h1>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium">
                <Bitcoin className="w-4 h-4 mr-2" />
                <span>Bitcoin Revolution</span>
              </div>

              <h2 className="text-2xl md:text-4xl font-bold leading-tight">
                The 1st ever Ordinals & Runes pre-sale launchpad
              </h2>

              <p className="text-lg text-gray-300">
                Coming soon to make creators lives easier. This is the beginning of the Bitcoin Revolution.
              </p>

              <div className="pt-4 space-y-4">
                <div className="flex items-center">
                  <a 
                    href="https://x.com/Inceptionlaunch" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-full bg-[#1DA1F2]/10 border border-[#1DA1F2]/20 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>Follow on X</span>
                  </a>
                </div>
                <p className="text-sm text-gray-400">
                  For updates and announcements, follow us on X
                </p>
              </div>
            </div>

            <div className="relative h-[400px] hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/5 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 backdrop-blur-sm"></div>
                <div className="absolute inset-0 bg-black/40"></div>

                <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 mb-6 relative">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4091.27 4091.73" className="w-full h-full">
                      <g>
                        <path fill="#F7931A" fillRule="nonzero" d="M4030.06 2540.77c-273.24,1096.01 -1383.32,1763.02 -2479.46,1489.71 -1095.68,-273.24 -1762.69,-1383.39 -1489.33,-2479.31 273.12,-1096.13 1383.2,-1763.19 2479,-1489.95 1096.06,273.24 1763.03,1383.51 1489.76,2479.57l0.02 -0.02z"/>
                        <path fill="white" fillRule="nonzero" d="M2947.77 1754.38c40.72,-272.26 -166.56,-418.61 -450,-516.24l91.95 -368.8 -224.5 -55.94 -89.51 359.09c-59.02,-14.72 -119.63,-28.59 -179.87,-42.34l90.16 -361.46 -224.36 -55.94 -92 368.68c-48.84,-11.12 -96.81,-22.11 -143.35,-33.69l0.26 -1.16 -309.59 -77.31 -59.72 239.78c0,0 166.56,38.18 163.05,40.53 90.91,22.69 107.35,82.87 104.62,130.57l-104.74 420.15c6.26,1.59 14.38,3.89 23.34,7.49 -7.49,-1.86 -15.46,-3.89 -23.73,-5.87l-146.81 588.57c-11.11,27.62 -39.31,69.07 -102.87,53.33 2.25,3.26 -163.17,-40.72 -163.17,-40.72l-111.46 256.98 292.15 72.83c54.35,13.63 107.61,27.89 160.06,41.3l-92.9 373.03 224.24 55.94 92 -369.07c61.26,16.63 120.71,31.97 178.91,46.43l-91.69 367.33 224.51 55.94 92.89 -372.33c382.82,72.45 670.67,43.24 791.83,-303.02 97.63,-278.78 -4.86,-439.58 -206.26,-544.44 146.69,-33.83 257.18,-130.31 286.64,-329.61l-0.07 -0.05zm-512.93 719.26c-69.38,278.78 -538.76,128.08 -690.94,90.29l123.28 -494.2c152.17,37.99 640.17,113.17 567.67,403.91zm69.43 -723.3c-63.29,253.58 -453.96,124.75 -580.69,93.16l111.77 -448.21c126.73,31.59 534.85,90.55 468.94,355.05l-0.02 0z"/>
                      </g>
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold mb-4">Pre-Sale Launchpad</h3>

                  <div className="space-y-4 text-left w-full">
                    {["Ordinals", "Runes", "Bitcoin Assets"].map((item, i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center mr-3">
                          <ArrowRight className="w-3 h-3 text-orange-400" />
                        </div>
                        <span className="text-gray-200">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-orange-500/10 blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-amber-500/10 blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

