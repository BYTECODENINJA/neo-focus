import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    // Check if API key is configured
    const apiKey = process.env.GOOGLE_AI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Google AI API key not configured. Please add GOOGLE_AI_API_KEY to your environment variables.",
        },
        { status: 500 },
      )
    }

    // Build conversation context
    let conversationContext =
      "You are a helpful AI assistant focused on productivity, time management, and personal organization. You help users with tasks, scheduling, habits, and general productivity advice. Be concise but helpful.\n\n"

    // Add recent conversation history for context
    if (history && history.length > 0) {
      conversationContext += "Recent conversation:\n"
      history.slice(-5).forEach((msg: any) => {
        conversationContext += `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.content}\n`
      })
      conversationContext += "\n"
    }

    // Use the correct Google AI API endpoint
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: conversationContext + "User: " + message + "\n\nAssistant:",
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
            stopSequences: ["User:", "Human:"],
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Google AI API error: ${response.status} - ${errorText}`)

      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "Google AI API endpoint not found. Please check your API configuration.",
          },
          { status: 500 },
        )
      }

      if (response.status === 403) {
        return NextResponse.json(
          {
            error: "Invalid API key or insufficient permissions. Please check your Google AI API key.",
          },
          { status: 500 },
        )
      }

      throw new Error(`Google AI API error: ${response.status}`)
    }

    const data = await response.json()

    // Extract the response text
    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response at this time."

    return NextResponse.json({ response: aiResponse.trim() })
  } catch (error) {
    console.error("Chat API error:", error)

    // Provide a helpful fallback response
    const fallbackResponse =
      "I'm currently experiencing technical difficulties. Here are some productivity tips while I get back online:\n\n• Use the Pomodoro technique (25 min work, 5 min break)\n• Break large tasks into smaller, manageable steps\n• Prioritize your most important tasks first\n• Take regular breaks to maintain focus\n• Use the habit tracker to build consistent routines"

    return NextResponse.json({
      response: fallbackResponse,
      error: "Temporary AI service issue - showing fallback response",
    })
  }
}
