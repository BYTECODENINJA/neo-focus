"use client"

import { useState, useEffect } from "react"
import { Play, Pause, RotateCcw, Coffee, Quote, Clock, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTimer } from "@/contexts/timer-context"

export function FocusMode() {
  const {
    timeLeft,
    isActive,
    mode,
    selectedWorkTime,
    selectedBreakTime,
    alarmEnabled,
    setSelectedWorkTime,
    setSelectedBreakTime,
    setAlarmEnabled,
    resetTimer,
    toggleTimer,
  } = useTimer()

  const [currentQuote, setCurrentQuote] = useState("")
  const [usedQuotes, setUsedQuotes] = useState<string[]>([])
  const [showTimeSelector, setShowTimeSelector] = useState(false)
  const [tempWorkTime, setTempWorkTime] = useState(selectedWorkTime)
  const [tempBreakTime, setTempBreakTime] = useState(selectedBreakTime)

  const workTimeOptions = [15, 20, 25, 30, 45, 60, 90]
  const breakTimeOptions = [5, 10, 15, 20]

  const quotes = [
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
    "Life is what happens to you while you're busy making other plans. - John Lennon",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "It is during our darkest moments that we must focus to see the light. - Aristotle",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The only impossible journey is the one you never begin. - Tony Robbins",
    "In the middle of difficulty lies opportunity. - Albert Einstein",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Life is 10% what happens to you and 90% how you react to it. - Charles R. Swindoll",
    "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "The only thing we have to fear is fear itself. - Franklin D. Roosevelt",
    "I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character. - Martin Luther King Jr.",
    "That's one small step for man, one giant leap for mankind - Neil Armstrong",
    "You must be the change you wish to see in the world. - Mahatma Gandhi",
    "I am the master of my fate, I am the captain of my soul. - William Ernest Henley",
    "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment. - Ralph Waldo Emerson",
    "The only true wisdom is in knowing you know nothing. - Socrates",
    "The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart. - Helen Keller",
    "In the end, it's not the years in your life that count. It's the life in your years. - Abraham Lincoln",
    "Life is what happens when you're busy making other plans. - John Lennon",
    "The only person you are destined to become is the person you decide to be. - Ralph Waldo Emerson",
    "The greatest glory in living lies not in never falling, but in rising every time we fall. - Nelson Mandela",
    "It is during our darkest moments that we must focus to see the light. - Aristotle",
    "Go confidently in the direction of your dreams. Live the life you have imagined. - Henry David Thoreau",
    "The best way to predict the future is to create it. - Peter Drucker",
    "If you want to live a happy life, tie it to a goal, not to people or things. - Albert Einstein",
    "Spread love everywhere you go. Let no one ever come to you without leaving happier. - Mother Teresa",
    "The mind is everything. What you think you become. - Buddha",
    "The two most important days in your life are the day you are born and the day you find out why. - Mark Twain",
    "You miss 100% of the shots you don’t take. - Wayne Gretzky",
    "A man is but the product of his thoughts. What he thinks, he becomes. - Mahatma Gandhi",
    "Change your thoughts and you change your world. - Norman Vincent Peale",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "If you can't fly then run, if you can't run then walk, if you can't walk then crawl, but whatever you do you have to keep moving forward. - Martin Luther King Jr.",
    "Our lives begin to end the day we become silent about things that matter. - Martin Luther King Jr.",
    "The journey of a thousand miles begins with a single step. - Lao Tzu",
    "The only thing standing between you and your goal is the story you keep telling yourself as to why you can't achieve it. - Jordan Belfort",
    "I can't change the direction of the wind, but I can adjust my sails to always reach my destination. - Jimmy Dean",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "Keep your eyes on the stars, and your feet on the ground. - Theodore Roosevelt",
    "It does not matter how slowly you go as long as you do not stop. - Confucius",
    "The secret of getting ahead is getting started. - Mark Twain",
    "What you do speaks so loudly that I cannot hear what you say. - Ralph Waldo Emerson",
    "The only way to achieve the impossible is to believe it is possible. - Charles Kingsleigh",
    "A successful man is one who can lay a firm foundation with the bricks others have thrown at him. - David Brinkley",
    "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do. - Mark Twain",
    "I have not failed. I've just found 10,000 ways that won't work. - Thomas A. Edison",
    "Never let the fear of striking out keep you from playing the game. - Babe Ruth",
    "Challenges are what make life interesting and overcoming them is what makes life meaningful. - Joshua J. Marine",
    "The only thing we learn from history is that we learn nothing from history. - Georg Wilhelm Friedrich Hegel",
    "The best revenge is massive success. - Frank Sinatra",
    "The most important thing is to enjoy your life—to be happy—it’s all that matters. - Audrey Hepburn",
    "We can't help everyone, but everyone can help someone. - Ronald Reagan",
    "The only thing necessary for the triumph of evil is for good men to do nothing. - Edmund Burke",
    "The greatest glory in living lies not in never falling, but in rising every time we fall. - Nelson Mandela",
    "Never let the fear of striking out keep you from playing the game. - Babe Ruth",
    "Challenges are what make life interesting and overcoming them is what makes life meaningful. - Joshua J. Marine",
    "The only thing we learn from history is that we learn nothing from history. - Georg Wilhelm Friedrich Hegel",
    "The best revenge is massive success. - Frank Sinatra",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "If you can't fly then run, if you can't run then walk, if you can't walk then crawl, but whatever you do you have to keep moving forward. - Martin Luther King Jr.",
    "Our lives begin to end the day we become silent about things that matter. - Martin Luther King Jr.",
    "The journey of a thousand miles begins with a single step. - Lao Tzu",
    "The only thing standing between you and your goal is the story you keep telling yourself as to why you can't achieve it. - Jordan Belfort",
    "I can't change the direction of the wind, but I can adjust my sails to always reach my destination. - Jimmy Dean",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "Keep your eyes on the stars, and your feet on the ground. - Theodore Roosevelt",
    "The biggest risk is not taking any risk. In a world that's changing really quickly, the only strategy that is guaranteed to fail is not taking risks. - Mark Zuckerberg",
    "Strive not to be a success, but rather to be of value. - Albert Einstein",
    "Don't judge each day by the harvest you reap but by the seeds that you plant. - Robert Louis Stevenson",
    "Whether you think you can or you think you can't, you're right. - Henry Ford",
    "Perfection is not attainable, but if we chase perfection we can catch excellence. - Vince Lombardi",
    "The future belongs to those who prepare for it today. - Malcolm X",
    "It is never too late to be what you might have been. - George Eliot",
    "Happiness is not something readymade. It comes from your own actions. - Dalai Lama",
    "If you want to achieve greatness stop asking for permission. - Unknown",
    "A person who never made a mistake never tried anything new. - Albert Einstein",
    "The most difficult thing is the decision to act, the rest is merely tenacity. - Amelia Earhart",
    "Start where you are. Use what you have. Do what you can. - Arthur Ashe",
    "If you are not willing to risk the usual, you will have to settle for the ordinary. - Jim Rohn",
    "The best way out is always through. - Robert Frost",
    "The only true wisdom is in knowing you know nothing. - Socrates",
    "Everything you’ve ever wanted is on the other side of fear. - George Addair",
    "We are what we repeatedly do. Excellence, then, is not an act, but a habit. - Aristotle",
    "The only person you should try to be better than is the person you were yesterday. - Unknown",
    "Build your own dreams, or someone else will hire you to build theirs. - Farrah Gray",
    "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
    "An unexamined life is not worth living. - Socrates",
    "You must be the change you wish to see in the world. - Mahatma Gandhi",
    "The greatest glory in living lies not in never falling, but in rising every time we fall. - Nelson Mandela",
    "You can't use up creativity. The more you use, the more you have. - Maya Angelou",
    "The only person who can stop you from achieving your goals is you. - Jack Canfield",
    "The best way to get over a bad day is to create a good one. - Unknown",
    "Build your own dreams, or someone else will hire you to build theirs. - Farrah Gray",
    "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
    "An unexamined life is not worth living. - Socrates",
    "You must be the change you wish to see in the world. - Mahatma Gandhi",
    "The greatest glory in living lies not in never falling, but in rising every time we fall. - Nelson Mandela",
    "Life is 10% what happens to you and 90% how you react to it. - Charles R. Swindoll",
    "The only thing standing between you and your dream is the will to try and the belief that it is actually possible. - Joel Brown",
    "What we think, we become. - Buddha",
    "The most important thing is to enjoy your life—to be happy—it’s all that matters. - Audrey Hepburn",
    "If you can dream it, you can do it. - Walt Disney",
    "Live as if you were to die tomorrow. Learn as if you were to live forever. - Mahatma Gandhi",
    "When you reach the end of your rope, tie a knot in it and hang on. - Franklin D. Roosevelt",
    "The greatest glory in living lies not in never falling, but in rising every time we fall. - Nelson Mandela",
    "Life is 10% what happens to you and 90% how you react to it. - Charles R. Swindoll",
    "The only thing standing between you and your dream is the will to try and the belief that it is actually possible. - Joel Brown",
    "What we think, we become. - Buddha",
    "The most important thing is to enjoy your life—to be happy—it’s all that matters. - Audrey Hepburn",
    "If you can dream it, you can do it. - Walt Disney",
    "Live as if you were to die tomorrow. Learn as if you were to live forever. - Mahatma Gandhi",
    "When you reach the end of your rope, tie a knot in it and hang on. - Franklin D. Roosevelt",
    "The greatest glory in living lies not in never falling, but in rising every time we fall. - Nelson Mandela",
    "You can't use up creativity. The more you use, the more you have. - Maya Angelou",
    "The only person who can stop you from achieving your goals is you. - Jack Canfield",
    "The best way to get over a bad day is to create a good one. - Unknown",
    "The best way to find yourself is to lose yourself in the service of others. - Mahatma Gandhi",
    "If you want to lift yourself up, lift up someone else. - Booker T. Washington",
    "If you hear a voice within you say 'you cannot paint,' then by all means paint, and that voice will be silenced. - Vincent Van Gogh",
    "Life is a succession of lessons which must be lived to be understood. - Ralph Waldo Emerson",
    "The only limit to our realization of tomorrow will be our doubts of today. - Franklin D. Roosevelt",
    "The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart. - Helen Keller",
    "The purpose of our lives is to be happy. - Dalai Lama",
    "You only live once, but if you do it right, once is enough. - Mae West",
    "You miss 100% of the shots you don't take. - Wayne Gretzky",
    "The secret of change is to focus all of your energy, not on fighting the old, but on building the new. - Socrates",
    "What you get by achieving your goals is not as important as what you become by achieving your goals. - Zig Ziglar",
    "Don't let yesterday take up too much of today. - Will Rogers",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart. - Helen Keller",
    "The purpose of our lives is to be happy. - Dalai Lama",
    "You only live once, but if you do it right, once is enough. - Mae West",
    "You miss 100% of the shots you don't take. - Wayne Gretzky",
    "The secret of change is to focus all of your energy, not on fighting the old, but on building the new. - Socrates",
    "What you get by achieving your goals is not as important as what you become by achieving your goals. - Zig Ziglar",
    "Don't let yesterday take up too much of today. - Will Rogers",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "The best way to predict the future is to create it. - Peter Drucker",
    "Keep your face always toward the sunshine—and shadows will fall behind you. - Walt Whitman",
    "If you can't fly then run, if you can't run then walk, if you can't walk then crawl, but whatever you do you have to keep moving forward. - Martin Luther King Jr.",
    "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful. - Albert Schweitzer",
    "The best revenge is massive success. - Frank Sinatra",
    "The most important thing is to enjoy your life—to be happy—it’s all that matters. - Audrey Hepburn",
    "We can't help everyone, but everyone can help someone. - Ronald Reagan",
    "The only thing necessary for the triumph of evil is for good men to do nothing. - Edmund Burke",
    "The greatest glory in living lies not in never falling, but in rising every time we fall. - Nelson Mandela",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "If you can't fly then run, if you can't run then walk, if you can't walk then crawl, but whatever you do you have to keep moving forward. - Martin Luther King Jr.",
    "Our lives begin to end the day we become silent about things that matter. - Martin Luther King Jr.",
    "The journey of a thousand miles begins with a single step. - Lao Tzu",
    "The only thing standing between you and your goal is the story you keep telling yourself as to why you can't achieve it. - Jordan Belfort",
    "I can't change the direction of the wind, but I can adjust my sails to always reach my destination. - Jimmy Dean",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "Keep your eyes on the stars, and your feet on the ground. - Theodore Roosevelt",
  ]

  // Quote rotation effect (every hour)
  useEffect(() => {
    const generateNewQuote = () => {
      const availableQuotes = quotes.filter((quote) => !usedQuotes.includes(quote))

      if (availableQuotes.length === 0) {
        // Reset used quotes if all have been used
        setUsedQuotes([])
        setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)])
      } else {
        const newQuote = availableQuotes[Math.floor(Math.random() * availableQuotes.length)]
        setCurrentQuote(newQuote)
        setUsedQuotes((prev) => [...prev, newQuote])
      }
    }

    // Set initial quote
    if (!currentQuote) {
      generateNewQuote()
    }

    // Set up hourly quote rotation
    const quoteInterval = setInterval(generateNewQuote, 60 * 60 * 1000) // 1 hour

    return () => clearInterval(quoteInterval)
  }, [currentQuote, usedQuotes])

  // Initialize temp times when opening the modal
  useEffect(() => {
    if (showTimeSelector) {
      setTempWorkTime(selectedWorkTime)
      setTempBreakTime(selectedBreakTime)
    }
  }, [showTimeSelector, selectedWorkTime, selectedBreakTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    const totalTime = mode === "work" ? selectedWorkTime * 60 : selectedBreakTime * 60
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  const handleTimeChange = () => {
    setSelectedWorkTime(tempWorkTime)
    setSelectedBreakTime(tempBreakTime)

    // If timer is not active, update the current time
    if (!isActive) {
      if (mode === "work") {
        // This will be handled by the context
      } else {
        // This will be handled by the context
      }
    }

    setShowTimeSelector(false)
  }

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Focus Mode</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setAlarmEnabled(!alarmEnabled)}
            variant={alarmEnabled ? "default" : "outline"}
            className={`font-bold ${alarmEnabled ? "bg-green-600 hover:bg-green-700" : ""}`}
          >
            <Bell size={20} className="mr-2" />
            {alarmEnabled ? "Alarm On" : "Alarm Off"}
          </Button>
          <Button onClick={() => setShowTimeSelector(true)} variant="outline" className="font-bold" disabled={isActive}>
            <Clock size={20} className="mr-2" />
            {selectedWorkTime}m / {selectedBreakTime}m
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pomodoro Timer */}
        <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
          <div className="text-center">
            <div className="mb-6">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  mode === "work"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-green-500/20 text-green-400 border border-green-500/30"
                }`}
              >
                {mode === "work" ? (
                  <>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    Work Session ({selectedWorkTime}m)
                  </>
                ) : (
                  <>
                    <Coffee size={14} />
                    Break Time ({selectedBreakTime}m)
                  </>
                )}
              </div>
            </div>

            {/* Timer Display */}
            <div className="relative mb-8">
              <div className="w-48 h-48 mx-auto relative">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke={mode === "work" ? "#8a2b2b" : "#22c55e"}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                    className="transition-all duration-1000 ease-in-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold font-mono">{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={toggleTimer}
                className={`${isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} px-8 py-3`}
              >
                {isActive ? (
                  <>
                    <Pause size={20} className="mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={20} className="mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button onClick={resetTimer} variant="outline" className="px-8 py-3">
                <RotateCcw size={20} className="mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Inspirational Quote */}
        <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
          <div className="text-center h-full flex flex-col justify-center">
            <Quote size={48} className="mx-auto mb-6 text-purple-400" />
            <blockquote className="text-lg font-medium mb-4 leading-relaxed">"{currentQuote}"</blockquote>
          </div>
        </div>
      </div>

      {/* Focus Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-4 text-center">
          <h3 className="text-white/60 text-sm mb-1">Sessions Today</h3>
          <p className="text-2xl font-bold text-blue-400">0</p>
        </div>
        <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-4 text-center">
          <h3 className="text-white/60 text-sm mb-1">Focus Time</h3>
          <p className="text-2xl font-bold text-green-400">0h 0m</p>
        </div>
        <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-4 text-center">
          <h3 className="text-white/60 text-sm mb-1">Streak</h3>
          <p className="text-2xl font-bold text-purple-400">0</p>
        </div>
      </div>

      {/* Time Selector Modal */}
      {showTimeSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-6 rounded-2xl border border-white/20 w-96">
            <h3 className="text-xl font-bold mb-6">Customize Focus Times</h3>

            <div className="space-y-6">
              {/* Work Time Selection */}
              <div>
                <label className="block text-white/60 text-sm font-bold mb-3">Work Session Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {workTimeOptions.map((time) => (
                    <button
                      key={time}
                      onClick={() => setTempWorkTime(time)}
                      className={`p-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                        tempWorkTime === time
                          ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                          : "bg-white/10 text-white/80 hover:bg-white/20"
                      }`}
                    >
                      {time}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Break Time Selection */}
              <div>
                <label className="block text-white/60 text-sm font-bold mb-3">Break Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {breakTimeOptions.map((time) => (
                    <button
                      key={time}
                      onClick={() => setTempBreakTime(time)}
                      className={`p-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                        tempBreakTime === time
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                          : "bg-white/10 text-white/80 hover:bg-white/20"
                      }`}
                    >
                      {time}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleTimeChange}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 font-bold"
                >
                  Apply Changes
                </Button>
                <Button onClick={() => setShowTimeSelector(false)} variant="outline" className="flex-1 font-bold">
                  Cancel
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-4 p-3 bg-white/5 rounded-xl">
              <p className="text-sm text-white/60 text-center">
                <span className="font-bold text-red-400">{tempWorkTime} minutes</span> work, then{" "}
                <span className="font-bold text-green-400">{tempBreakTime} minutes</span> break
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
