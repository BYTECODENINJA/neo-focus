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
    "Life is what happens to you while you're busy making other plans. - Allen Saunders",
"In the midst of winter, I found there was, within me, an invincible summer. - Albert Camus",
"The purpose of our lives is to be happy. - Dalai Lama",
"Life is really simple, but we insist on making it complicated. - Confucius",
"Your time is limited, so don't waste it living someone else's life. - Steve Jobs",
"He who has a why to live for can bear almost any how. - Friedrich Nietzsche",
"Life is a journey that must be traveled no matter how bad the roads and accommodations. - Oliver Goldsmith",
"The good life is one inspired by love and guided by knowledge. - Bertrand Russell",
"I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel. - Maya Angelou",
"My life is my message. - Mahatma Gandhi",
"The art of life is to know how to enjoy a little and to endure much. - William Hazlitt",
"The mystery of human existence lies not in just staying alive, but in finding something to live for. - Fyodor Dostoevsky",
"Life is not a problem to be solved, but a reality to be experienced. - Søren Kierkegaard",
"We are here to add what we can to life, not to get what we can from life. - William Osler",
"The two most important days in your life are the day you are born and the day you find out why. - Mark Twain",
"The meaning of life is to find your gift. The purpose of life is to give it away. - Pablo Picasso",
"Life is a flower of which love is the honey. - Victor Hugo",
"The biggest adventure you can take is to live the life of your dreams. - Oprah Winfrey",
"Dost thou love life? Then do not squander time, for that is the stuff life is made of. - Benjamin Franklin",
"Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
"I have not failed. I've just found 10,000 ways that won't work. - Thomas Edison",
"It is hard to fail, but it is worse never to have tried to succeed. - Theodore Roosevelt",
"The only place where success comes before work is in the dictionary. - Vidal Sassoon",
"Success is stumbling from failure to failure with no loss of enthusiasm. - Winston Churchill",
"The way to get started is to quit talking and begin doing. - Walt Disney",
"Don't be afraid to give up the good to go for the great. - John D. Rockefeller",
"The only thing that stands between you and your dream is the will to try and the belief that it is actually possible. - Joel Brown",
"The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
"The harder I work, the luckier I get. - Samuel Goldwyn",
"Perseverance is not a long race; it is many short races one after the other. - Walter Elliot",
"Our greatest glory is not in never falling, but in rising every time we fall. - Confucius",
"The only limit to our realization of tomorrow will be our doubts of today. - Franklin D. Roosevelt",
"What you get by achieving your goals is not as important as what you become by achieving your goals. - Zig Ziglar",
"The secret of getting ahead is getting started. - Mark Twain",
"You miss 100% of the shots you don't take. - Wayne Gretzky",
"Whether you think you can or you think you can't, you're right. - Henry Ford",
"The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack in will. - Vince Lombardi",
"Courage is not the absence of fear, but rather the assessment that something else is more important than fear. - Franklin D. Roosevelt",
"We must build dikes of courage to hold back the flood of fear. - Martin Luther King Jr.",
"The brave man is not he who does not feel afraid, but he who conquers that fear. - Nelson Mandela",
"It takes a great deal of bravery to stand up to our enemies, but just as much to stand up to our friends. - J.K. Rowling",
"You have power over your mind — not outside events. Realize this, and you will find strength. - Marcus Aurelius",
"The human capacity for burden is like bamboo – far more flexible than you'd ever believe at first glance. - Jodi Picoult",
"That which does not kill us makes us stronger. - Friedrich Nietzsche",
"Be sure you put your feet in the right place, then stand firm. - Abraham Lincoln",
"Strength does not come from physical capacity. It comes from an indomitable will. - Mahatma Gandhi",
"The oak fought the wind and was broken, the willow bent when it must and survived. - Robert Jordan",
"With the new day comes new strength and new thoughts. - Eleanor Roosevelt",
"The world breaks everyone, and afterward, some are strong at the broken places. - Ernest Hemingway",
"You gain strength, courage, and confidence by every experience in which you really stop to look fear in the face. - Eleanor Roosevelt",
"It is during our darkest moments that we must focus to see the light. - Aristotle",
"What lies behind us and what lies before us are tiny matters compared to what lies within us. - Ralph Waldo Emerson",
"The only way out is through. - Robert Frost",
"Tough times never last, but tough people do. - Robert H. Schuller",
"I can be changed by what happens to me. But I refuse to be reduced by it. - Maya Angelou",
"The greatest glory in living lies not in never falling, but in rising every time we fall. - Nelson Mandela",
"You must do the thing you think you cannot do. - Eleanor Roosevelt",
"The greatest thing you'll ever learn is just to love and be loved in return. - Eden Ahbez ",
"Love is composed of a single soul inhabiting two bodies. - Aristotle",
"To love and be loved is to feel the sun from both sides. - David Viscott",
"We are most alive when we're in love. - John Updike",
"The best thing to hold onto in life is each other. - Audrey Hepburn",
"Love is friendship that has caught fire. - Ann Landers",
"A successful marriage requires falling in love many times, always with the same person. - Mignon McLaughlin",
"If I know what love is, it is because of you. - Hermann Hesse",
"Love does not consist in gazing at each other, but in looking outward together in the same direction. - Antoine de Saint-Exupéry",
"The giving of love is an education in itself. - Eleanor Roosevelt",
"Being deeply loved by someone gives you strength, while loving someone deeply gives you courage. - Lao Tzu",
"Love is when the other person's happiness is more important than your own. - H. Jackson Brown Jr.",
"The first duty of love is to listen. - Paul Tillich",
"All you need is love. - John Lennon",
"Love is an untamed force. When we try to control it, it destroys us. When we try to imprison it, it enslaves us. When we try to understand it, it leaves us feeling lost and confused. - Paulo Coelho",
"The course of true love never did run smooth. - William Shakespeare",
"Love is a verb. Love – the feeling – is a fruit of love, the verb. - Stephen R. Covey",
"I have decided to stick with love. Hate is too great a burden to bear. - Martin Luther King Jr.",
"Love is the only force capable of transforming an enemy into a friend. - Martin Luther King Jr.",
"To be brave is to love someone unconditionally, without expecting anything in return. - Madonna",
"The purpose of our lives is to be happy. - Dalai Lama",
"Happiness is not something ready-made. It comes from your own actions. - Dalai Lama",
"The happiness of your life depends upon the quality of your thoughts. - Marcus Aurelius",
"Happiness is not in the mere possession of money; it lies in the joy of achievement, in the thrill of creative effort. - Franklin D. Roosevelt",
"Be happy for this moment. This moment is your life. - Omar Khayyam",
"Happiness is a butterfly, which when pursued, is always just beyond your grasp, but which, if you will sit down quietly, may alight upon you. - Nathaniel Hawthorne",
"The secret of happiness is freedom, the secret of freedom is courage. - Thucydides",
"If you want to be happy, be. - Leo Tolstoy",
"Happiness is when what you think, what you say, and what you do are in harmony. - Mahatma Gandhi",
"Joy is the simplest form of gratitude. - Karl Barth",
"The most important thing is to enjoy your life—to be happy—it's all that matters. - Audrey Hepburn",
"Positive thinking will let you do everything better than negative thinking will. - Zig Ziglar",
"Keep your face always toward the sunshine—and shadows will fall behind you. - Walt Whitman",
"The sun himself is weak when he first rises, and gathers strength and courage as the day gets on. - Charles Dickens",
"Perpetual optimism is a force multiplier. - Colin Powell",
"The only joy in the world is to begin. - Cesare Pavese",
"A happy life is one spent in learning, earning, and yearning. - Lillian Gish",
"Happiness is a direction, not a place. - Sydney J. Harris",
"Let us be grateful to the people who make us happy; they are the charming gardeners who make our souls blossom. - Marcel Proust",
"The only true wisdom is in knowing you know nothing. - Socrates",
"Knowledge is power. - Francis Bacon",
"The more I read, the more I acquire, the more certain I am that I know nothing. - Voltaire",
"Wisdom is not a product of schooling but of the lifelong attempt to acquire it. - Albert Einstein",
"The function of education is to teach one to think intensively and to think critically. Intelligence plus character – that is the goal of true education. - Martin Luther King Jr.",
"To know what you know and what you do not know, that is true knowledge. - Confucius",
"The journey of a thousand miles begins with one step. - Lao Tzu",
"Any fool can know. The point is to understand. - Albert Einstein",
"The ink of the scholar is more sacred than the blood of the martyr. - Muhammad",
"A wise man can learn more from a foolish question than a fool can learn from a wise answer. - Bruce Lee",
"The greatest enemy of knowledge is not ignorance, it is the illusion of knowledge. - Stephen Hawking",
"Real knowledge is to know the extent of one's ignorance. - Confucius",
"Wisdom is the reward you get for a lifetime of listening when you'd have preferred to talk. - Doug Larson",
"The only source of knowledge is experience. - Albert Einstein",
"Not all readers are leaders, but all leaders are readers. - Harry S. Truman",
"An investment in knowledge pays the best interest. - Benjamin Franklin",
"The mind is not a vessel to be filled, but a fire to be kindled. - Plutarch",
"The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice. - Brian Herbert",
"The art of being wise is the art of knowing what to overlook. - William James",
"The wise man speaks because he has something to say; the fool because he has to say something. - Plato",
"The only way to make sense out of change is to plunge into it, move with it, and join the dance. - Alan Watts",
"Change is the law of life. And those who look only to the past or present are certain to miss the future. - John F. Kennedy",
"It is not the strongest of the species that survive, nor the most intelligent, but the one most responsive to change. - Charles Darwin",
"They must often change who would be constant in happiness or wisdom. - Confucius",
"The world as we have created it is a process of our thinking. It cannot be changed without changing our thinking. - Albert Einstein",
"Yesterday is history, tomorrow is a mystery, today is a gift. That is why it is called the present. - Alice Morse Earle",
"Time is the most valuable thing a man can spend. - Theophrastus",
"Lost time is never found again. - Benjamin Franklin",
"The key is in not spending time, but in investing it. - Stephen R. Covey",
"The trouble is, you think you have time. - Buddha",
"Punctuality is the thief of time. - Oscar Wilde",
"Time you enjoy wasting is not wasted time. - Marthe Troly-Curtin",
"Don't watch the clock; do what it does. Keep going. - Sam Levenson",
"The future depends on what you do today. - Mahatma Gandhi",
"This time, like all times, is a very good one, if we but know what to do with it. - Ralph Waldo Emerson",
"Nothing is a waste of time if you use the experience wisely. - Auguste Rodin",
"The only thing constant is change. - Heraclitus",
"Life is a series of natural and spontaneous changes. Don't resist them; that only creates sorrow. Let reality be reality. - Lao Tzu",
"Change your thoughts and you change your world. - Norman Vincent Peale",
"We cannot become what we want by remaining what we are. - Max Depree",
"Well done is better than well said. - Benjamin Franklin",
"The price of inaction is far greater than the cost of a mistake. - Henry Ford",
"Action is the foundational key to all success. - Pablo Picasso",
"The path to success is to take massive, determined action. - Tony Robbins",
"Small deeds done are better than great deeds planned. - Peter Marshall",
"The best way to get something done is to begin. - Author Unknown",
"Don't wait. The time will never be just right. - Napoleon Hill",
"The superior man is modest in his speech, but exceeds in his actions. - Confucius",
"An ounce of practice is worth more than tons of preaching. - Mahatma Gandhi",
"Act as if what you do makes a difference. It does. - William James",
"The way to get started is to quit talking and begin doing. - Walt Disney",
"I am a great believer in luck, and I find the harder I work, the more I have of it. - Thomas Jefferson",
"Choose a job you love, and you will never have to work a day in your life. - Confucius",
"The miracle is not that we do this work, but that we are happy to do it. - Mother Teresa",
"Work hard in silence, let your success be your noise. - Frank Ocean",
"The only thing that will stop you from fulfilling your dreams is you. - Tom Bradley",
"Success usually comes to those who are too busy to be looking for it. - Henry David Thoreau",
"The difference between ordinary and extraordinary is that little extra. - Jimmy Johnson",
"Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work. - Steve Jobs",
"The highest reward for a person's toil is not what they get for it, but what they become by it. - John Ruskin",
"Creativity is intelligence having fun. - Albert Einstein",
"Imagination is more important than knowledge. - Albert Einstein",
"Every artist was first an amateur. - Ralph Waldo Emerson",
"The chief enemy of creativity is 'good' sense. - Pablo Picasso",
"You can't use up creativity. The more you use, the more you have. - Maya Angelou",
"Creativity takes courage. - Henri Matisse",
"To be creative means to be in love with life. You can be creative only if you love life enough that you want to enhance its beauty. - Osho",
"The world is but a canvas to the imagination. - Henry David Thoreau",
"Art is the lie that enables us to realize the truth. - Pablo Picasso",
"The creative adult is the child who survived. - Ursula K. Le Guin",
"Don't think. Thinking is the enemy of creativity. - Ray Bradbury",
"Innovation distinguishes between a leader and a follower. - Steve Jobs",
"The true sign of intelligence is not knowledge but imagination. - Albert Einstein",
"A rock pile ceases to be a rock pile the moment a single man contemplates it, bearing within him the image of a cathedral. - Antoine de Saint-Exupéry",
"What is now proved was once only imagined. - William Blake",
"The artist is nothing without the gift, but the gift is nothing without work. - Émile Zola",
"Creativity is a wild mind and a disciplined eye. - Dorothy Parker",
"The job of the artist is always to deepen the mystery. - Francis Bacon",
"The imagination is the golden pathway to everywhere. - Terence McKenna",
"To live a creative life, we must lose our fear of being wrong. - Joseph Chilton Pearce",
"The time is always right to do what is right. - Martin Luther King Jr.",
"In a gentle way, you can shake the world. - Mahatma Gandhi",
"Who you are speaks so loudly I can't hear what you're saying. - Ralph Waldo Emerson",
"The supreme quality for leadership is unquestionably integrity. Without it, no real success is possible. - Dwight D. Eisenhower",
"Real integrity is doing the right thing, knowing that nobody's going to know whether you did it or not. - Oprah Winfrey",
"I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character. - Martin Luther King Jr.",
"The measure of a man's real character is what he would do if he knew he would never be found out. - Thomas Babington Macaulay",
"Character is like a tree and reputation like a shadow. The shadow is what we think of it; the tree is the real thing. - Abraham Lincoln",
"Our character is what we do when we think no one is looking. - H. Jackson Brown Jr.",
"To know what is right and not to do it is the worst cowardice. - Confucius",
"Integrity is doing the right thing, even when no one is watching. - C.S. Lewis",
"A man's character is his fate. - Heraclitus",
"The best index to a person's character is how he treats people who can't do him any good, and how he treats people who can't fight back. - Abigail Van Buren",
"Character cannot be developed in ease and quiet. Only through experience of trial and suffering can the soul be strengthened, ambition inspired, and success achieved. - Helen Keller",
"Be more concerned with your character than your reputation, because your character is what you really are, while your reputation is merely what others think you are. - John Wooden",
"The foundation stones for a balanced success are honesty, character, integrity, faith, love and loyalty. - Zig Ziglar",
"Dignity does not consist in possessing honors, but in deserving them. - Aristotle",
"The ultimate measure of a man is not where he stands in moments of comfort and convenience, but where he stands at times of challenge and controversy. - Martin Luther King Jr.",
"What you do defines who you are. - Author Unknown",
"Your reputation is in the hands of others. That's what a reputation is. You can't control that. The only thing you can control is your character. - Wayne Dyer",
"Hope is the thing with feathers that perches in the soul and sings the tune without the words and never stops at all. - Emily Dickinson",
"We must accept finite disappointment, but never lose infinite hope. - Martin Luther King Jr.",
"Hope is a waking dream. - Aristotle",
"The very least you can do in your life is to figure out what you hope for. And the most you can do is live inside that hope. - Barbara Kingsolver",
"Everything that is done in the world is done by hope. - Martin Luther",
"Faith is taking the first step even when you don't see the whole staircase. - Martin Luther King Jr.",
"Faith is the bird that feels the light when the dawn is still dark. - Rabindranath Tagore",
"Keep your face to the sunshine and you cannot see a shadow. - Helen Keller",
"Once you choose hope, anything's possible. - Christopher Reeve",
"The sun will rise, and we will try again. - Twenty One Pilots",
"Optimism is the faith that leads to achievement. Nothing can be done without hope and confidence. - Helen Keller",
"Hope is being able to see that there is light despite all of the darkness. - Desmond Tutu",
"The past is a source of knowledge, and the future is a source of hope. Love of the past implies faith in the future. - Stephen Ambrose",
"To have faith is to trust yourself to the water. When you swim you don't grab hold of the water, because if you do you will sink and drown. Instead you relax, and float. - Alan Watts",
"The best way to not feel hopeless is to get up and do something. Don’t wait for good things to happen to you. If you go out and make some good things happen, you will fill the world with hope, you will fill yourself with hope. - Barack Obama",
"Hope is the power of being cheerful in circumstances which we know to be desperate. - G.K. Chesterton",
"A little more persistence, a little more effort, and what seemed hopeless failure may turn to glorious success. - Elbert Hubbard",
"Hope is the companion of power, and mother of success; for who so hopes strongly has within him the gift of miracles. - Samuel Smiles",
"Faith is to believe what you do not see; the reward of this faith is to see what you believe. - Saint Augustine",
"What gives me the most hope every day is God's grace; knowing that his grace is going to give me the strength for whatever I face, knowing that nothing is a surprise to God. - Rick Warren",
"Those who deny freedom to others deserve it not for themselves. - Abraham Lincoln",
"Freedom is never voluntarily given by the oppressor; it must be demanded by the oppressed. - Martin Luther King Jr.",
"For to be free is not merely to cast off one's chains, but to live in a way that respects and enhances the freedom of others. - Nelson Mandela",
"The only real prison is fear, and the only real freedom is freedom from fear. - Aung San Suu Kyi",
"Injustice anywhere is a threat to justice everywhere. - Martin Luther King Jr.",
"I am no bird; and no net ensnares me: I am a free human being with an independent will. - Charlotte Brontë",
"Liberty, when it begins to take root, is a plant of rapid growth. - George Washington",
"The truth will set you free, but first it will piss you off. - Gloria Steinem",
"Freedom is the oxygen of the soul. - Moshe Dayan",
"We hold these truths to be self-evident: that all men are created equal; that they are endowed by their Creator with certain unalienable rights; that among these are life, liberty, and the pursuit of happiness. - Thomas Jefferson",
"Justice will not be served until those who are unaffected are as outraged as those who are. - Benjamin Franklin",
"Where justice is denied, where poverty is enforced, where ignorance prevails, and where any one class is made to feel that society is an organized conspiracy to oppress, rob and degrade them, neither persons nor property will be safe. - Frederick Douglass",
"The arc of the moral universe is long, but it bends toward justice. - Theodore Parker",
"I disapprove of what you say, but I will defend to the death your right to say it. - Evelyn Beatrice Hall",
"The most courageous act is still to think for yourself. Aloud. - Coco Chanel",
"No one is born hating another person because of the color of his skin, or his background, or his religion. People must learn to hate, and if they can learn to hate, they can be taught to love. - Nelson Mandela",
"A right is not what someone gives you; it's what no one can take from you. - Ramsey Clark",
"The price of freedom is eternal vigilance. - John Philpot",
"Freedom is not worth having if it does not include the freedom to make mistakes. - Mahatma Gandhi",
"Until we are all free, we are none of us free. - Emma Lazarus",
"Man is by nature a political animal. - Aristotle",
"The only thing we have to fear is fear itself. - Franklin D. Roosevelt",
"The greatest glory in living lies not in never falling, but in rising every time we fall. - Nelson Mandela",
"The line between good and evil is drawn not between nations or parties, but through every human heart. - Aleksandr Solzhenitsyn",
"Man is the only creature who refuses to be what he is. - Albert Camus",
"The world is a dangerous place to live; not because of the people who are evil, but because of the people who don't do anything about it. - Albert Einstein",
"The first step in the evolution of ethics is a sense of solidarity with other human beings. - Albert Schweitzer",
"No man is an island, entire of itself; every man is a piece of the continent, a part of the main. - John Donne",
"We have, in fact, two kinds of morality side by side: one which we preach but do not practice, and another which we practice but seldom preach. - Bertrand Russell",
"The opposite of love is not hate, it's indifference. - Elie Wiesel",
"The surest way to corrupt a youth is to instruct him to hold in higher esteem those who think alike than those who think differently - Friedrich Nietzsche",
"The individual has always had to struggle to keep from being overwhelmed by the tribe. If you try it, you will be lonely often, and sometimes frightened. But no price is too high to pay for the privilege of owning yourself. - Friedrich Nietzsche",
"The mass of men lead lives of quiet desperation. - Henry David Thoreau",
"Power tends to corrupt, and absolute power corrupts absolutely. - Lord Acton",
"The propagandist's purpose is to make one set of people forget that certain other sets of people are human. - Aldous Huxley",
"If you are neutral in situations of injustice, you have chosen the side of the oppressor. - Desmond Tutu",
"The function of a citizen and a soldier are inseparable. - Benito Mussolini",
"A nation's culture resides in the hearts and in the soul of its people. - Mahatma Gandhi",
"Society exists for the benefit of its members, not the members for the benefit of society. - Herbert Spencer",
"The welfare of each is bound up in the welfare of all. - Helen Keller",
"The proud man can learn humility, but he will be proud of it. - Mignon McLaughlin",
"A great man is always willing to be little. - Ralph Waldo Emerson",
"Humility is not thinking less of yourself, it's thinking of yourself less. - C.S. Lewis",
"The higher we are placed, the more humbly we should walk. - Marcus Tullius Cicero",
"Simplicity is the ultimate sophistication. - Leonardo da Vinci",
"The simple things are also the most extraordinary things, and only the wise can see them. - Paulo Coelho",
"Life is really simple, but we insist on making it complicated. - Confucius",
"Be humble for you are made of earth. Be noble for you are made of stars. - Serbian Proverb",
"The empty vessel makes the loudest sound. - William Shakespeare",
"Knowledge puffs up, but love builds up. - 1 Corinthians 8:1 (The Bible)",
"The wise man hides his brilliance. - Lao Tzu",
"There is no respect for others without humility in one's self. - Henri Frédéric Amiel",
"The key to growth is the introduction of higher dimensions of consciousness into our awareness. - Lao Tzu",
"The more you know, the more you realize you don't know. - Aristotle",
"Speak humbly and listen carefully; the opposite is usually what happens. - Robert Greene",
"Nature does not hurry, yet everything is accomplished. - Lao Tzu",
"The greatest friend of truth is Time, her greatest enemy is Prejudice, and her constant companion is Humility. - Charles Caleb Colton",
"Admit your errors before someone else exaggerates them. - Andrew V. Mason",
"Simplicity is the glory of expression. - Walt Whitman",
"The greatest wealth is to live content with little. - Plato",
"You must be the change you wish to see in the world. - Mahatma Gandhi",
"Go confidently in the direction of your dreams! Live the life you've imagined. - Henry David Thoreau",
"Believe you can and you're halfway there. - Theodore Roosevelt",
"The only person you are destined to become is the person you decide to be. - Ralph Waldo Emerson",
"It does not matter how slowly you go as long as you do not stop. - Confucius",
"Everything you've ever wanted is on the other side of fear. - George Addair",
"How wonderful it is that nobody need wait a single moment before starting to improve the world. - Anne Frank",
"The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart. - Helen Keller",
"Start where you are. Use what you have. Do what you can. - Arthur Ashe",
"You are never too old to set another goal or to dream a new dream. - C.S. Lewis",
"The power of imagination makes us infinite. - John Muir",
"What we achieve inwardly will change outer reality. - Plutarch",
"Act as if what you do makes a difference. It does. - William James",
"Light tomorrow with today! - Elizabeth Barrett Browning",
"You have within you right now, everything you need to deal with whatever the world can throw at you. - Brian Tracy",
"The only way to do great work is to love what you do. - Steve Jobs",
"Don't be pushed around by the fears in your mind. Be led by the dreams in your heart. - Roy T. Bennett",
"The secret of getting ahead is getting started. - Mark Twain",
"You can't go back and change the beginning, but you can start where you are and change the ending. - C.S. Lewis",
"The human spirit is stronger than anything that can happen to it. - C.C. Scott",
"It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. - Jane Austen",
"All that we see or seem is but a dream within a dream. - Edgar Allan Poe",
"So we beat on, boats against the current, borne back ceaselessly into the past. - F. Scott Fitzgerald",
"It was the best of times, it was the worst of times. - Charles Dickens",
"To be, or not to be, that is the question. - William Shakespeare",
"The important thing is not to stop questioning. Curiosity has its own reason for existing. - Albert Einstein",
"We are all in the gutter, but some of us are looking at the stars. - Oscar Wilde",
"Somewhere, something incredible is waiting to be known. - Carl Sagan",
"The science of today is the technology of tomorrow."
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
