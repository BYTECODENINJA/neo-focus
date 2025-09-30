import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TimerProvider } from "@/contexts/timer-context"
import { AchievementProvider } from "@/contexts/achievement-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "AURA Focus - Productivity & Mindfulness App",
  description:
    "A comprehensive productivity and mindfulness application with focus timers, journaling, habit tracking, and goal management.",
  keywords: ["productivity", "focus", "mindfulness", "journal", "habits", "goals", "timer"],
  authors: [{ name: "AURA Focus Team" }],
  creator: "AURA Focus",
  publisher: "AURA Focus",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: false,
    follow: false,
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Tenor+Sans&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} ${poppins.variable} antialiased tenor-sans-regular`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NotificationProvider>
            <AchievementProvider>
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
      </body>
    </html>
  )
}
