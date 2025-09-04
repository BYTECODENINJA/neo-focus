"use client"

import { createContext, useContext, type ReactNode } from "react"
import confetti from "canvas-confetti"

export interface Achievement {
  id: string
  type: string
  title: string
  description: string
  icon?: string
  earnedDate?: string
  createdAt: string
}

interface AchievementContextType {
  achievements: Achievement[]
  setAchievements: (achievements: Achievement[]) => void
  addAchievement: (achievement: Omit<Achievement, "id" | "earnedAt">) => void
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined)

export function AchievementProvider({
  children,
  achievements,
  setAchievements,
}: {
  children: ReactNode
  achievements: Achievement[]
  setAchievements: (achievements: Achievement[]) => void
}) {
  const addAchievement = (newAchievement: Omit<Achievement, "id" | "earnedDate">) => {
    const achievement: Achievement = {
      ...newAchievement,
      id: Date.now().toString(),
       earnedDate: new Date().toISOString(),
    }

    setAchievements([achievement, ...(achievements || [])])

    // Trigger celebration
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"],
    })

    // Show desktop notification if available (Electron support can be added later)
    if (typeof window !== "undefined" && window.electronAPI) {
      // Desktop notification will be implemented when Electron is properly configured
      console.log(`Achievement Unlocked: ${achievement.title} - ${achievement.description}`)
    }
  }

  return (
    <AchievementContext.Provider value={{ achievements, setAchievements, addAchievement }}>
      {children}
    </AchievementContext.Provider>
  )
}

export function useAchievements() {
  const context = useContext(AchievementContext)
  if (context === undefined) {
    throw new Error("useAchievements must be used within an AchievementProvider")
  }
  return context
}
