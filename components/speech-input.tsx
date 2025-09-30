"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type SpeechRecognition from "speech-recognition"

interface SpeechInputProps {
  onTranscript: (text: string) => void
  placeholder?: string
  className?: string
}

export function SpeechInput({ onTranscript, placeholder = "Click to speak...", className = "" }: SpeechInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        setIsSupported(true)
        recognitionRef.current = new SpeechRecognition()

        const recognition = recognitionRef.current
        recognition.continuous = false // Changed to false to prevent aborted errors
        recognition.interimResults = true
        recognition.lang = "en-US"
        recognition.maxAlternatives = 1

        recognition.onstart = () => {
          console.log("Speech recognition started")
          setIsListening(true)
        }

        recognition.onresult = (event) => {
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          const fullTranscript = finalTranscript + interimTranscript
          setTranscript(fullTranscript)

          if (finalTranscript) {
            onTranscript(finalTranscript)
            // Auto-stop after getting final result
            setTimeout(() => {
              if (recognitionRef.current && isListening) {
                try {
                  recognitionRef.current.stop()
                } catch (error) {
                  console.log("Recognition already stopped")
                }
              }
            }, 100)
          }
        }

        recognition.onerror = (event) => {
          console.log("Speech recognition error:", event.error)
          setIsListening(false)
          setTranscript("")

          // Handle specific error types
          switch (event.error) {
            case "aborted":
              console.log("Speech recognition was aborted")
              break
            case "audio-capture":
              console.log("Audio capture failed")
              break
            case "network":
              console.log("Network error occurred")
              break
            case "not-allowed":
              console.log("Microphone permission denied")
              break
            case "service-not-allowed":
              console.log("Speech recognition service not allowed")
              break
            case "bad-grammar":
              console.log("Grammar compilation failed")
              break
            case "language-not-supported":
              console.log("Language not supported")
              break
            default:
              console.log("Unknown speech recognition error:", event.error)
          }
        }

        recognition.onend = () => {
          console.log("Speech recognition ended")
          setIsListening(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
          recognitionRef.current = null
        } catch (error) {
          console.log("Error cleaning up speech recognition:", error)
        }
      }
    }
  }, [onTranscript])

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      try {
        recognitionRef.current.stop()
        setTranscript("")
      } catch (error) {
        console.log("Error stopping recognition:", error)
        setIsListening(false)
        setTranscript("")
      }
    } else {
      try {
        setTranscript("")
        recognitionRef.current.start()
      } catch (error) {
        console.log("Error starting recognition:", error)
        setIsListening(false)
      }
    }
  }

  if (!isSupported) {
    return (
      <div className={`text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl ${className}`}>
        <Volume2 size={24} className="mx-auto mb-2 text-yellow-400" />
        <p className="text-sm text-yellow-400 font-bold">Speech recognition not supported in this browser</p>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <Button
        onClick={toggleListening}
        className={`w-full p-4 rounded-xl border-2 border-dashed transition-all duration-200 font-bold ${
          isListening
            ? "bg-red-500/20 border-red-500/50 text-red-400 animate-pulse"
            : "bg-purple-500/20 border-purple-500/50 text-purple-400 hover:bg-purple-500/30"
        }`}
        variant="ghost"
      >
        {isListening ? (
          <>
            <MicOff size={20} className="mr-2" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic size={20} className="mr-2" />
            {placeholder}
          </>
        )}
      </Button>

      {transcript && (
        <div className="mt-2 p-3 bg-white/5 rounded-lg">
          <p className="text-sm text-white/80 font-bold">{transcript}</p>
        </div>
      )}
    </div>
  )
}
