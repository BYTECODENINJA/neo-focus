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
      // Play notification sound
      if (typeof window !== "undefined" && "Audio" in window) {
        try {
          const audio = new Audio('/notification-sound.mp3');
          audio.play().catch(err => console.error("Error playing notification sound:", err));
        } catch (error) {
          console.error("Failed to play notification sound:", error);
        }
      }
      
      // Web notification
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification(title, {
          body: message,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: "aura-focus",
          requireInteraction: true, // Keep notification visible until user interacts with it
          silent: false, // Allow system sound to play
        })
      } else {
        // Fallback to console log for development
        console.log(`Notification: ${title} - ${message}`)
        
        // Fallback to alert if in browser and notifications not granted
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission !== "granted") {
          alert(`${title}\n${message}`);
        }
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
