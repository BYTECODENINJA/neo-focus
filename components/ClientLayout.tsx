"use client"

import { useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { TimerProvider } from "@/contexts/timer-context"
import { AchievementProvider, type Achievement } from "@/contexts/achievement-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { Toaster } from "sonner"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [achievements, setAchievements] = useState<Achievement[]>([])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <NotificationProvider>
        <AchievementProvider achievements={achievements} setAchievements={setAchievements}>
          <TimerProvider>
            <div className="min-h-screen bg-background text-foreground">{children}</div>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "hsl(var(--card))",
                  color: "hsl(var(--card-foreground))",
                  border: "1px solid hsl(var(--border))",
                },
              }}
            />
          </TimerProvider>
        </AchievementProvider>
      </NotificationProvider>
    </ThemeProvider>
  )
} 