interface ComponentPassword {
  componentId: string
  passwordHash: string
  salt: string
  recoveryQuestion: string
  recoveryAnswerHash: string
  createdAt: number
}

interface BackupData {
  timestamp: number
  data: any
  version: string
}

class PasswordManager {
  private readonly STORAGE_KEY = "neofocus-passwords"
  private readonly BACKUP_PREFIX = "neofocus-backup-"

  // Generate a random salt
  private generateSalt(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
  }

  // Hash password with salt
  private async hashPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password + salt)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  // Set password for a component
  async setComponentPassword(
    componentId: string,
    password: string,
    recoveryQuestion: string,
    recoveryAnswer: string,
  ): Promise<void> {
    const salt = this.generateSalt()
    const passwordHash = await this.hashPassword(password, salt)
    const recoveryAnswerHash = await this.hashPassword(recoveryAnswer.toLowerCase().trim(), salt)

    const componentPassword: ComponentPassword = {
      componentId,
      passwordHash,
      salt,
      recoveryQuestion,
      recoveryAnswerHash,
      createdAt: Date.now(),
    }

    const passwords = this.getAllPasswords()
    const existingIndex = passwords.findIndex((p) => p.componentId === componentId)

    if (existingIndex >= 0) {
      passwords[existingIndex] = componentPassword
    } else {
      passwords.push(componentPassword)
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(passwords))
    } catch (error) {
      console.error("Error saving passwords to localStorage:", error)
    }
  }

  // Verify password for a component
  async verifyComponentPassword(componentId: string, password: string): Promise<boolean> {
    const passwords = this.getAllPasswords()
    const componentPassword = passwords.find((p) => p.componentId === componentId)

    if (!componentPassword) return false

    const passwordHash = await this.hashPassword(password, componentPassword.salt)
    return passwordHash === componentPassword.passwordHash
  }

  // Verify recovery answer
  async verifyRecoveryAnswer(componentId: string, answer: string): Promise<boolean> {
    const passwords = this.getAllPasswords()
    const componentPassword = passwords.find((p) => p.componentId === componentId)

    if (!componentPassword) return false

    const answerHash = await this.hashPassword(answer.toLowerCase().trim(), componentPassword.salt)
    return answerHash === componentPassword.recoveryAnswerHash
  }

  // Get recovery question for a component
  getRecoveryQuestion(componentId: string): string | null {
    const passwords = this.getAllPasswords()
    const componentPassword = passwords.find((p) => p.componentId === componentId)
    return componentPassword?.recoveryQuestion || null
  }

  // Remove password protection from a component
  removeComponentPassword(componentId: string): void {
    const passwords = this.getAllPasswords()
    const filteredPasswords = passwords.filter((p) => p.componentId !== componentId)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredPasswords))
  }

  // Get all protected components
  getProtectedComponents(): string[] {
    const passwords = this.getAllPasswords()
    return passwords.map((p) => p.componentId)
  }

  // Check if component is protected
  isComponentProtected(componentId: string): boolean {
    const passwords = this.getAllPasswords()
    return passwords.some((p) => p.componentId === componentId)
  }

  // Reset all data for a component (used when password is reset)
  resetComponentData(componentId: string): void {
    // Clear component-specific data from localStorage
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes(componentId)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))
  }

  // Create backup
  async createBackup(data: any): Promise<void> {
    const backup: BackupData = {
      timestamp: Date.now(),
      data,
      version: "1.0.0",
    }

    const backupJson = JSON.stringify(backup, null, 2)
    const blob = new Blob([backupJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `neofocus-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Restore from backup
  async restoreFromBackup(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const backup: BackupData = JSON.parse(e.target?.result as string)
          if (backup.data) {
            resolve(backup.data)
          } else {
            reject(new Error("Invalid backup file format"))
          }
        } catch (error) {
          reject(new Error("Failed to parse backup file"))
        }
      }
      reader.onerror = () => reject(new Error("Failed to read backup file"))
      reader.readAsText(file)
    })
  }

  private getAllPasswords(): ComponentPassword[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error reading passwords from localStorage:", error)
      return []
    }
  }
}

export const passwordManager = new PasswordManager()
