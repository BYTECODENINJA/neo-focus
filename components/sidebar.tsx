'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  CheckSquare,
  Target,
  BookOpen,
  PenTool,
  Bell,
  BarChart3,
  Repeat,
  Settings,
  User,
  Lock,
  Menu,
  X,
  Timer,
  List,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { passwordManager } from "@/lib/password-manager"
import { PasswordDialog } from "@/components/password-dialog"
import { db } from "@/lib/database"

interface SidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

const sidebarItems = [
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "schedule", label: "Schedule", icon: List },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "habits", label: "Habits", icon: Repeat },
  { id: "goals", label: "Goals", icon: Target },
  { id: "notebook", label: "Notebook", icon: BookOpen },
  { id: "journal", label: "Journal", icon: PenTool },
  { id: "reminders", label: "Reminders", icon: Bell },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "focus", label: "Focus Mode", icon: Timer },
]

export function Sidebar({ activeSection, setActiveSection, isCollapsed, setIsCollapsed }: SidebarProps) {
  const [username, setUsername] = useState("User")
  const [avatar, setAvatar] = useState<string | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState("")
  const [protectedComponents, setProtectedComponents] = useState<string[]>([])

  useEffect(() => {
    // Load user data from database
    const loadUserData = async () => {
      try {
        const data = await db.getAllData()
        if (data && data.settings) {
          if (data.settings.name) {
            setUsername(data.settings.name)
          }
          if (data.settings.avatar) {
            setAvatar(data.settings.avatar)
          }
        }
      } catch (error) {
        console.error("Failed to load user data:", error)
      }
    }

    loadUserData()

    // Load protected components
    setProtectedComponents(passwordManager.getProtectedComponents())

    // Listen for user data updates
    const handleUserDataUpdate = (event: CustomEvent) => {
      const { username: newUsername, avatar: newAvatar } = event.detail
      if (newUsername) setUsername(newUsername)
      if (newAvatar !== undefined) setAvatar(newAvatar)
    }

    window.addEventListener("userDataUpdated", handleUserDataUpdate as EventListener)

    return () => {
      window.removeEventListener("userDataUpdated", handleUserDataUpdate as EventListener)
    }
  }, [])

  const handleSectionClick = (sectionId: string) => {
    if (passwordManager.isComponentProtected(sectionId)) {
      setSelectedComponent(sectionId)
      setShowPasswordDialog(true)
    } else {
      setActiveSection(sectionId)
    }
  }

  const handlePasswordSuccess = () => {
    setActiveSection(selectedComponent)
    setShowPasswordDialog(false)
    setSelectedComponent("")
    setProtectedComponents(passwordManager.getProtectedComponents())
  }

  const getSectionDisplayName = (id: string) => {
    const item = sidebarItems.find((item) => item.id === id)
    return item?.label || id
  }

  return (
    <>
      <motion.div
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        className="bg-white/10 dark:bg-gray-900/50 backdrop-blur-lg border-r border-white/20 dark:border-gray-700/50 flex flex-col h-full relative"
      >
        {/* Toggle Button */}
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          variant="ghost"
          size="sm"
          className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isCollapsed ? <Menu size={12} /> : <X size={12} />}
        </Button>

        {/* User Profile */}
        <div className="p-6 border-b border-white/10 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              {avatar ? (
                <img src={avatar || "/placeholder.svg"} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-white" />
              )}
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <h3 className="font-bold text-white dark:text-gray-100 truncate">{username}</h3>
                  <p className="text-xs text-white/60 dark:text-gray-400">Focus Mode Active</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            const isProtected = protectedComponents.includes(item.id)

            return (
              <motion.button
                key={item.id}
                onClick={() => handleSectionClick(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                    : "text-white/70 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700/50 hover:text-white dark:hover:text-white"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={20} className="flex-shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="font-medium truncate overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Lock/Unlock control */}
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    if (passwordManager.isComponentProtected(item.id)) {
                      if (confirm(`Remove password protection for ${item.label}?`)) {
                        passwordManager.removeComponentPassword(item.id)
                        setProtectedComponents(passwordManager.getProtectedComponents())
                      }
                    } else {
                      setSelectedComponent(item.id)
                      setShowPasswordDialog(true)
                    }
                  }}
                  title={isProtected ? "Remove protection" : "Protect with password"}
                  className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Lock size={14} className={isProtected ? "text-yellow-400" : "text-white/60"} />
                </span>
              </motion.button>
            )
          })}
        </nav>

        {/* Settings */}
        <div className="p-4 border-t border-white/10 dark:border-gray-700/50">
          <motion.button
            onClick={() => setActiveSection("settings")}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
              activeSection === "settings"
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                : "text-white/70 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700/50 hover:text-white dark:hover:text-white"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Settings size={20} className="flex-shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium truncate overflow-hidden"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>

      {/* Password Dialog */}
      <PasswordDialog
        isOpen={showPasswordDialog}
        onClose={() => {
          setShowPasswordDialog(false)
          setSelectedComponent("")
        }}
        componentId={selectedComponent}
        componentName={getSectionDisplayName(selectedComponent)}
        onSuccess={handlePasswordSuccess}
      />
    </>
  )
}
