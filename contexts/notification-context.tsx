"use client"

import { createContext, useContext, type ReactNode, useEffect } from "react"

interface NotificationContextType {
  showNotification: (title: string, message: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Request notification permission on mount
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(console.error)
    }
  }, [])

  const showNotification = (title: string, message: string) => {
    try {
      // Try Electron notification first
      if (typeof window !== "undefined" && window.electronAPI?.showNotification) {
        window.electronAPI.showNotification(title, message)
        return
      }

      // Fallback to web notification
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification(title, {
          body: message,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: "aura-focus",
          requireInteraction: false,
        })
      } else {
        // Fallback to console log for development
        console.log(`Notification: ${title} - ${message}`)
      }
    } catch (error) {
      console.error("Failed to show notification:", error)
    }
  }

  const value = {
    showNotification,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
