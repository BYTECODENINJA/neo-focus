'use client'

import { createContext, useContext, type ReactNode, useCallback } from "react"
import { toast } from "sonner"

interface NotificationContextType {
  showNotification: (title: string, message: string) => void
  requestNotificationPermission: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const requestNotificationPermission = useCallback(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                toast.success("Notifications enabled! You'll now receive reminders.");
            }
        }).catch(error => {
            console.error("Error requesting notification permission:", error);
            toast.error("An error occurred while enabling notifications.");
        });
      }
    }
  }, []);

  const showNotification = (title: string, message: string) => {
    try {
      // Web notification
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        const notification = new Notification(title, {
          body: message,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: "aura-focus-reminder",
          requireInteraction: false,
          silent: true, 
        });
        
        notification.onclick = () => {
            window.focus();
        };

      } else {
        // Fallback to toast if permissions are not granted
        toast.info(title, { description: message });
      }
    } catch (error) {
      console.error("Failed to show notification:", error)
      // Fallback for any other error
      toast.error("Failed to show notification.");
    }
  }

  const value = {
    showNotification,
    requestNotificationPermission,
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
