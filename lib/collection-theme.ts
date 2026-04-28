// ─── Collection Theme System ─────────────────────────────────────
// Each collection can define its own visual theme.
// In production this would come from an API / DB. For now, mock data.

export interface CollectionTheme {
  // Primary accent color (hex)
  primary: string
  // Secondary accent color (hex)
  secondary: string
  // Background gradient for the page body
  bodyGradient: string
  // Hero section gradient overlay
  heroGradient: string
  // Card border color (with alpha)
  cardBorder: string
  // Card background
  cardBg: string
  // Accent glow color (for shadows, rings)
  glow: string
  // Progress bar color (tailwind gradient classes)
  progressBar: string
  // Mint button gradient (tailwind classes)
  mintButton: string
  mintButtonHover: string
  // Badge accent
  badgeAccent: string
  badgeText: string
  // Stat icon colors (tailwind classes per stat)
  statColors: [string, string, string, string]
  // Countdown box style
  countdownBorder: string
  countdownBg: string
  countdownGlow: string
  // Timeline active dot
  timelineDotActive: string
  timelineDotCompleted: string
  timelineLine: string
  // Phase card active border
  phaseActiveBorder: string
  phaseActiveBg: string
  phaseCompletedBorder: string
  phaseCompletedBg: string
  // Subnet card gradient
  subnetGradient: string
  // Text accent (for links, labels)
  textAccent: string
  textAccentHover: string
  // Separator
  separator: string
}

// ─── Mock Theme Database ────────────────────────────────────────
const themes: Record<string, CollectionTheme> = {
  "cosmic-creatures": {
    primary: "#9333ea",
    secondary: "#a855f7",
    bodyGradient: "from-black via-purple-950/10 to-black",
    heroGradient: "linear-gradient(135deg, #1a0533 0%, #2d0b6b 40%, #0f172a 100%)",
    cardBorder: "border-purple-500/20",
    cardBg: "bg-black/40",
    glow: "purple-500",
    progressBar: "from-purple-500 to-violet-500",
    mintButton: "from-purple-500 to-purple-600",
    mintButtonHover: "hover:from-purple-600 hover:to-purple-700",
    badgeAccent: "bg-purple-500/20 border-purple-500/30",
    badgeText: "text-purple-300",
    statColors: [
      "from-purple-500 to-violet-500",
      "from-blue-500 to-cyan-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-amber-500",
    ],
    countdownBorder: "border-purple-500/25",
    countdownBg: "from-purple-500/15 to-purple-900/20",
    countdownGlow: "shadow-purple-500/5",
    timelineDotActive: "border-green-400 bg-green-400/20 shadow-[0_0_8px_rgba(74,222,128,0.4)]",
    timelineDotCompleted: "border-purple-400 bg-purple-400",
    timelineLine: "bg-purple-500/20",
    phaseActiveBorder: "border-green-500/30",
    phaseActiveBg: "bg-green-500/5",
    phaseCompletedBorder: "border-purple-500/20",
    phaseCompletedBg: "bg-purple-500/5",
    subnetGradient: "from-purple-500/5 via-transparent to-cyan-500/5",
    textAccent: "text-purple-400",
    textAccentHover: "hover:text-purple-300",
    separator: "bg-purple-500/10",
  },

  "pixel-warriors": {
    primary: "#6366f1",
    secondary: "#818cf8",
    bodyGradient: "from-black via-indigo-950/10 to-black",
    heroGradient: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    cardBorder: "border-indigo-500/20",
    cardBg: "bg-black/40",
    glow: "indigo-500",
    progressBar: "from-indigo-500 to-blue-500",
    mintButton: "from-indigo-500 to-indigo-600",
    mintButtonHover: "hover:from-indigo-600 hover:to-indigo-700",
    badgeAccent: "bg-indigo-500/20 border-indigo-500/30",
    badgeText: "text-indigo-300",
    statColors: [
      "from-indigo-500 to-blue-500",
      "from-violet-500 to-purple-500",
      "from-emerald-500 to-teal-500",
      "from-amber-500 to-yellow-500",
    ],
    countdownBorder: "border-indigo-500/25",
    countdownBg: "from-indigo-500/15 to-indigo-900/20",
    countdownGlow: "shadow-indigo-500/5",
    timelineDotActive: "border-green-400 bg-green-400/20 shadow-[0_0_8px_rgba(74,222,128,0.4)]",
    timelineDotCompleted: "border-indigo-400 bg-indigo-400",
    timelineLine: "bg-indigo-500/20",
    phaseActiveBorder: "border-green-500/30",
    phaseActiveBg: "bg-green-500/5",
    phaseCompletedBorder: "border-indigo-500/20",
    phaseCompletedBg: "bg-indigo-500/5",
    subnetGradient: "from-indigo-500/5 via-transparent to-blue-500/5",
    textAccent: "text-indigo-400",
    textAccentHover: "hover:text-indigo-300",
    separator: "bg-indigo-500/10",
  },

  "abstract-minds": {
    primary: "#3b82f6",
    secondary: "#60a5fa",
    bodyGradient: "from-black via-blue-950/10 to-black",
    heroGradient: "linear-gradient(135deg, #0d1b2a 0%, #1b2d4f 50%, #0a0e1a 100%)",
    cardBorder: "border-blue-500/20",
    cardBg: "bg-black/40",
    glow: "blue-500",
    progressBar: "from-blue-500 to-cyan-500",
    mintButton: "from-blue-500 to-blue-600",
    mintButtonHover: "hover:from-blue-600 hover:to-blue-700",
    badgeAccent: "bg-blue-500/20 border-blue-500/30",
    badgeText: "text-blue-300",
    statColors: [
      "from-blue-500 to-cyan-500",
      "from-teal-500 to-emerald-500",
      "from-violet-500 to-purple-500",
      "from-rose-500 to-pink-500",
    ],
    countdownBorder: "border-blue-500/25",
    countdownBg: "from-blue-500/15 to-blue-900/20",
    countdownGlow: "shadow-blue-500/5",
    timelineDotActive: "border-green-400 bg-green-400/20 shadow-[0_0_8px_rgba(74,222,128,0.4)]",
    timelineDotCompleted: "border-blue-400 bg-blue-400",
    timelineLine: "bg-blue-500/20",
    phaseActiveBorder: "border-green-500/30",
    phaseActiveBg: "bg-green-500/5",
    phaseCompletedBorder: "border-blue-500/20",
    phaseCompletedBg: "bg-blue-500/5",
    subnetGradient: "from-blue-500/5 via-transparent to-teal-500/5",
    textAccent: "text-blue-400",
    textAccentHover: "hover:text-blue-300",
    separator: "bg-blue-500/10",
  },

  "neural-punks": {
    primary: "#ec4899",
    secondary: "#f472b6",
    bodyGradient: "from-black via-pink-950/10 to-black",
    heroGradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    cardBorder: "border-pink-500/20",
    cardBg: "bg-black/40",
    glow: "pink-500",
    progressBar: "from-pink-500 to-rose-500",
    mintButton: "from-pink-500 to-pink-600",
    mintButtonHover: "hover:from-pink-600 hover:to-pink-700",
    badgeAccent: "bg-pink-500/20 border-pink-500/30",
    badgeText: "text-pink-300",
    statColors: [
      "from-pink-500 to-rose-500",
      "from-fuchsia-500 to-purple-500",
      "from-cyan-500 to-blue-500",
      "from-orange-500 to-red-500",
    ],
    countdownBorder: "border-pink-500/25",
    countdownBg: "from-pink-500/15 to-pink-900/20",
    countdownGlow: "shadow-pink-500/5",
    timelineDotActive: "border-green-400 bg-green-400/20 shadow-[0_0_8px_rgba(74,222,128,0.4)]",
    timelineDotCompleted: "border-pink-400 bg-pink-400",
    timelineLine: "bg-pink-500/20",
    phaseActiveBorder: "border-green-500/30",
    phaseActiveBg: "bg-green-500/5",
    phaseCompletedBorder: "border-pink-500/20",
    phaseCompletedBg: "bg-pink-500/5",
    subnetGradient: "from-pink-500/5 via-transparent to-fuchsia-500/5",
    textAccent: "text-pink-400",
    textAccentHover: "hover:text-pink-300",
    separator: "bg-pink-500/10",
  },

  "taoists": {
    primary: "#3b82f6",
    secondary: "#60a5fa",
    bodyGradient: "from-black via-blue-950/10 to-black",
    heroGradient: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)",
    cardBorder: "border-blue-500/20",
    cardBg: "bg-black/40",
    glow: "blue-500",
    progressBar: "from-blue-500 to-cyan-500",
    mintButton: "from-blue-500 to-blue-600",
    mintButtonHover: "hover:from-blue-600 hover:to-blue-700",
    badgeAccent: "bg-blue-500/20 border-blue-500/30",
    badgeText: "text-blue-300",
    statColors: [
      "from-blue-500 to-cyan-500",
      "from-emerald-500 to-teal-500",
      "from-violet-500 to-purple-500",
      "from-amber-500 to-yellow-500",
    ],
    countdownBorder: "border-blue-500/25",
    countdownBg: "from-blue-500/15 to-blue-900/20",
    countdownGlow: "shadow-blue-500/5",
    timelineDotActive: "border-green-400 bg-green-400/20 shadow-[0_0_8px_rgba(74,222,128,0.4)]",
    timelineDotCompleted: "border-blue-400 bg-blue-400",
    timelineLine: "bg-blue-500/20",
    phaseActiveBorder: "border-green-500/30",
    phaseActiveBg: "bg-green-500/5",
    phaseCompletedBorder: "border-blue-500/20",
    phaseCompletedBg: "bg-blue-500/5",
    subnetGradient: "from-blue-500/5 via-transparent to-cyan-500/5",
    textAccent: "text-blue-400",
    textAccentHover: "hover:text-blue-300",
    separator: "bg-blue-500/10",
  },
}

// Default theme (purple) as fallback
const defaultTheme: CollectionTheme = themes["cosmic-creatures"]

// ─── Mock API ───────────────────────────────────────────────────
// Simulates fetching theme from a backend / DB
export async function fetchCollectionTheme(slug: string): Promise<CollectionTheme> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 50))
  return themes[slug] ?? defaultTheme
}

// Synchronous getter for SSR / immediate use
export function getCollectionTheme(slug: string): CollectionTheme {
  return themes[slug] ?? defaultTheme
}
