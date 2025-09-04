import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import ClientLayout from "@/components/ClientLayout"

const inter = Inter({ subsets: ["latin"] })
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "NEO FOCUS - Productivity & Mindfulness App",
  description:
    "A comprehensive productivity and mindfulness application with focus timers, journaling, habit tracking, and goal management.",
  keywords: ["productivity", "focus", "mindfulness", "journal", "habits", "goals", "timer"],
  authors: [{ name: "NEO FOCUS Team" }],
  creator: "NEO FOCUS",
  publisher: "NEO FOCUS",
  icons: {
    icon: '/favicon.ico',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: false,
    follow: false,
  },
    generator: 'v0.dev'
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${poppins.variable} antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
