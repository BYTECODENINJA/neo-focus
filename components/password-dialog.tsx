"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, Eye, EyeOff, Shield, AlertTriangle, Key, Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { passwordManager } from "@/lib/password-manager"
import { toast } from "sonner"

interface PasswordDialogProps {
  isOpen: boolean
  onClose: () => void
  componentId: string
  componentName: string
  onSuccess: () => void
}

type DialogMode = "verify" | "setup" | "recovery" | "reset"

export function PasswordDialog({ isOpen, onClose, componentId, componentName, onSuccess }: PasswordDialogProps) {
  const [mode, setMode] = useState<DialogMode>("verify")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [recoveryQuestion, setRecoveryQuestion] = useState("")
  const [recoveryAnswer, setRecoveryAnswer] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize mode based on whether component is already protected when dialog opens or component changes
  useEffect(() => {
    if (isOpen && componentId) {
      const isProtected = passwordManager.isComponentProtected(componentId)
      setMode(isProtected ? "verify" : "setup")
    }
  }, [isOpen, componentId])

  const handleVerify = async () => {
    if (!password) {
      toast.error("Please enter your password")
      return
    }

    setIsLoading(true)
    try {
      const isValid = await passwordManager.verifyComponentPassword(componentId, password)
      if (isValid) {
        toast.success("Access granted")
        onSuccess()
        handleClose()
      } else {
        toast.error("Incorrect password")
      }
    } catch (error) {
      toast.error("Failed to verify password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetup = async () => {
    if (!password || !confirmPassword || !recoveryQuestion || !recoveryAnswer) {
      toast.error("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)
    try {
      await passwordManager.setComponentPassword(componentId, password, recoveryQuestion, recoveryAnswer)
      toast.success("Password protection enabled")
      onSuccess()
      handleClose()
    } catch (error) {
      toast.error("Failed to set password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecovery = async () => {
    if (!recoveryAnswer) {
      toast.error("Please enter your recovery answer")
      return
    }

    setIsLoading(true)
    try {
      const isValid = await passwordManager.verifyRecoveryAnswer(componentId, recoveryAnswer)
      if (isValid) {
        toast.success("Recovery answer correct. Set a new password.")
        setMode("setup")
        setRecoveryAnswer("")
      } else {
        toast.error("Incorrect recovery answer")
      }
    } catch (error) {
      toast.error("Failed to verify recovery answer")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    passwordManager.removeComponentPassword(componentId)
    passwordManager.resetComponentData(componentId)
    toast.success("Password reset. All data has been cleared.")
    onSuccess()
    handleClose()
  }

  const handleForgotPassword = () => {
    const question = passwordManager.getRecoveryQuestion(componentId)
    if (question) {
      setRecoveryQuestion(question)
      setMode("recovery")
    } else {
      toast.error("No recovery question found")
    }
  }

  const handleClose = () => {
    setPassword("")
    setConfirmPassword("")
    setRecoveryQuestion("")
    setRecoveryAnswer("")
    setShowPassword(false)
    setIsLoading(false)
    onClose()
  }

  const handleBackup = async () => {
    try {
      const currentData = JSON.parse(localStorage.getItem("neofocus-data") || "{}")
      await passwordManager.createBackup(currentData)
      toast.success("Backup created successfully")
    } catch (error) {
      toast.error("Failed to create backup")
    }
  }

  const handleRestore = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const data = await passwordManager.restoreFromBackup(file)
          localStorage.setItem("neofocus-data", JSON.stringify(data))
          toast.success("Data restored successfully. Please refresh the page.")
        } catch (error) {
          toast.error("Failed to restore backup")
        }
      }
    }
    input.click()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Lock size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {mode === "setup"
                  ? "Set Password"
                  : mode === "recovery"
                    ? "Account Recovery"
                    : mode === "reset"
                      ? "Reset Password"
                      : "Enter Password"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{componentName}</p>
            </div>
          </div>

          <div className="space-y-4">
            {mode === "verify" && (
              <>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 bg-gray-50 dark:bg-gray-800"
                      placeholder="Enter your password"
                      onKeyPress={(e) => e.key === "Enter" && handleVerify()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleVerify} disabled={isLoading} className="flex-1">
                    {isLoading ? "Verifying..." : "Unlock"}
                  </Button>
                  <Button onClick={handleForgotPassword} variant="outline" size="sm">
                    Forgot?
                  </Button>
                </div>
              </>
            )}

            {mode === "setup" && (
              <>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 bg-gray-50 dark:bg-gray-800"
                      placeholder="Enter new password (min 6 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Confirm Password</Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800"
                    placeholder="Confirm your password"
                  />
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Recovery Question</Label>
                  <Input
                    type="text"
                    value={recoveryQuestion}
                    onChange={(e) => setRecoveryQuestion(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800"
                    placeholder="e.g., What is your pet's name?"
                  />
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Recovery Answer</Label>
                  <Input
                    type="text"
                    value={recoveryAnswer}
                    onChange={(e) => setRecoveryAnswer(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800"
                    placeholder="Enter your answer"
                  />
                </div>

                <Button onClick={handleSetup} disabled={isLoading} className="w-full">
                  {isLoading ? "Setting up..." : "Set Password"}
                </Button>
              </>
            )}

            {mode === "recovery" && (
              <>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={16} className="text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-800 dark:text-blue-300">Recovery Question</span>
                  </div>
                  <p className="text-blue-700 dark:text-blue-300">{recoveryQuestion}</p>
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Your Answer</Label>
                  <Input
                    type="text"
                    value={recoveryAnswer}
                    onChange={(e) => setRecoveryAnswer(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800"
                    placeholder="Enter your recovery answer"
                    onKeyPress={(e) => e.key === "Enter" && handleRecovery()}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleRecovery} disabled={isLoading} className="flex-1">
                    {isLoading ? "Verifying..." : "Verify Answer"}
                  </Button>
                  <Button onClick={() => setMode("reset")} variant="outline" className="text-red-600 dark:text-red-400">
                    Reset All
                  </Button>
                </div>
              </>
            )}

            {mode === "reset" && (
              <>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
                    <span className="font-medium text-red-800 dark:text-red-300">Warning</span>
                  </div>
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    This will permanently delete all data for this component and remove password protection. This action
                    cannot be undone.
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Key size={16} className="text-yellow-600 dark:text-yellow-400" />
                    <span className="font-medium text-yellow-800 dark:text-yellow-300">Backup Your Data</span>
                  </div>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-3">
                    Consider creating a backup before resetting to avoid losing important data.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={handleBackup} variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Download size={14} className="mr-1" />
                      Backup
                    </Button>
                    <Button onClick={handleRestore} variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Upload size={14} className="mr-1" />
                      Restore
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setMode("recovery")} variant="outline" className="flex-1">
                    Go Back
                  </Button>
                  <Button onClick={handleReset} variant="destructive" className="flex-1">
                    Reset All Data
                  </Button>
                </div>
              </>
            )}
          </div>

          <Button onClick={handleClose} variant="ghost" className="w-full mt-4">
            Cancel
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
