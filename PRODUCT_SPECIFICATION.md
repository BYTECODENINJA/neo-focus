# NEO FOCUS - Product Specification Document

## 1. Executive Summary

**Product Name:** NEO FOCUS  
**Version:** 0.1.0  
**Type:** Productivity & Mindfulness Application  
**Platform:** Desktop (Windows, macOS, Linux) & Web  
**Release Date:** Development Phase

### Mission Statement
NEO FOCUS is a comprehensive productivity application that combines focus timer technology, task management, habit tracking, journaling, and analytics to help users achieve their goals while maintaining mental well-being.

### Value Proposition
- **All-in-One Solution**: Combines multiple productivity tools in a single, integrated platform
- **Focus Optimization**: Built-in Pomodoro technique timer with customizable work/break cycles
- **Data-Driven**: Analytics and insights to track productivity patterns and progress
- **Privacy-First**: Local data storage ensuring user privacy and data ownership
- **Cross-Platform**: Available as desktop application and web app

---

## 2. Product Overview

### 2.1 Problem Statement
Modern knowledge workers struggle with:
- Maintaining consistent focus and concentration
- Organizing tasks and priorities effectively
- Building and maintaining productive habits
- Tracking progress toward personal and professional goals
- Balancing productivity with mental well-being
- Fragmentation of productivity tools across multiple platforms

### 2.2 Target Audience

**Primary Users:**
- **Knowledge Workers**: Professionals who need to manage complex tasks and deadlines
- **Students**: Seeking effective study techniques and time management
- **Freelancers**: Balancing multiple projects and client work
- **Entrepreneurs**: Managing business tasks, habits, and long-term goals
- **Wellness-Conscious Individuals**: Combining productivity with mindfulness practices

**User Personas:**

1. **Sarah, the Remote Professional** (28, Marketing Manager)
   - Needs: Task organization, focus sessions, meeting scheduling
   - Pain Points: Distractions at home, difficulty with time blocking

2. **David, the Graduate Student** (24, PhD Candidate)
   - Needs: Study sessions, habit tracking, goal management
   - Pain Points: Procrastination, inconsistent study schedule

3. **Alex, the Entrepreneur** (35, Startup Founder)
   - Needs: Goal tracking, analytics, journaling for reflection
   - Pain Points: Overwhelming workload, difficulty prioritizing

### 2.3 Core Features

#### 1. Focus Timer (Pomodoro Technique)
- Customizable work and break durations
- Work/break mode switching
- Visual progress indicators
- Audio/visual notifications
- Session tracking and history

#### 2. Calendar & Scheduling
- Event management with categories
- Daily, weekly, and monthly views
- Event types (work, personal, health, social, deadlines, etc.)
- Recurring events
- Color-coded categorization

#### 3. Task Management
- Task creation with priorities (low, medium, high)
- Due date tracking
- Completion status
- Task categorization
- Description and notes

#### 4. Habit Tracking
- Daily, weekly, monthly, and custom frequency tracking
- Streak counting
- Completion history
- Longest streak tracking
- Visual progress indicators

#### 5. Goal Management
- Short-term and long-term goals
- Progress tracking with units
- Category organization (health, career, personal, finance, learning)
- Deadline management
- Completion status

#### 6. Journaling
- Daily journal entries
- Mood tracking (excellent, good, neutral, challenging, difficult)
- Energy level tracking (1-10 scale)
- Gratitude entries
- Reflections and notes
- Rich text formatting support

#### 7. Notebook
- Rich text note creation
- Category and tag organization
- Search functionality
- Creation and modification timestamps

#### 8. Reminders
- Customizable reminder types
- Time-based notifications
- Day-specific scheduling
- Enable/disable toggle

#### 9. Analytics Dashboard
- Productivity metrics
- Focus session statistics
- Task completion rates
- Habit streak analytics
- Goal progress visualization
- Trend analysis

#### 10. Achievement System
- Gamification elements
- Achievement unlocking
- Progress badges
- Milestone celebrations

---

## 3. Technical Architecture

### 3.1 Technology Stack

**Frontend:**
- **Framework**: Next.js 14.2.16 (React 18)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: shadcn/ui (Radix UI)
- **Animations**: Framer Motion 12.23.22
- **Charts**: Recharts 2.12.7
- **Forms**: React Hook Form 7.54.1 + Zod 3.24.1
- **Notifications**: Sonner 1.4.3

**Backend & Desktop:**
- **Desktop Framework**: pywebview 5.x
- **Language**: Python 3.x
- **Database**: SQLite
- **Server**: Python HTTP Server

**Data Storage:**
- **Web**: localStorage (browser-based)
- **Desktop**: SQLite database
- **Sync**: Hybrid approach with HTTP API

### 3.2 Architecture Patterns

**Frontend Architecture:**
```
Next.js App Router
├── Pages (app/)
├── Components (components/)
│   ├── Feature Components
│   └── UI Components (shadcn)
├── Contexts (contexts/)
│   ├── Timer Context
│   ├── Achievement Context
│   └── Notification Context
├── Hooks (hooks/)
├── Lib (lib/)
│   ├── Database Manager
│   └── Utilities
└── Types (types/)
```

**Desktop Application Flow:**
```
app.py (Entry Point)
├── Start HTTP Server (Port 8000)
├── Serve Static Files from /out
├── API Endpoints (/api/*)
├── Database Manager (SQLite)
└── Webview Window
    └── Load Next.js Application
```

**Data Flow:**
```
User Action
    ↓
Component State Update
    ↓
AutoSave Queue (Debounced)
    ↓
┌─────────────────────────────────┐
│ Data Persistence Layer          │
├─────────────────────────────────┤
│ Web:     localStorage           │
│ Desktop: SQLite via HTTP API    │
└─────────────────────────────────┘
```

### 3.3 Database Schema

**SQLite Tables:**
```sql
-- Tasks
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL,
    category TEXT,
    startTime TEXT,
    endTime TEXT
);

-- Calendar Events
CREATE TABLE calendar_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    category TEXT,
    recurring TEXT
);
```

**LocalStorage Schema:**
```typescript
interface DatabaseData {
    events: Event[]
    tasks: Task[]
    habits: Habit[]
    goals: Goal[]
    notes: Note[]
    journals: JournalEntry[]
    reminders: Reminder[]
    schedule: ScheduleItem[]
    achievements: Achievement[]
    focusSessions: FocusSession[]
    settings: Settings
}
```

---

## 4. User Interface & Experience

### 4.1 Design Principles
- **Minimalism**: Clean, uncluttered interface
- **Consistency**: Unified design language across features
- **Accessibility**: WCAG 2.1 AA compliance
- **Responsiveness**: Adaptive layouts for different screen sizes
- **Feedback**: Clear visual and audio feedback for user actions
- **Progressive Disclosure**: Information revealed on demand

### 4.2 Visual Design

**Color Palette:**
- Primary: Purple (Indigo/Violet) gradient
- Background: Dark theme (Gray-900)
- Accents: Blue, Green, Orange, Pink, Red
- Text: White/Light Gray
- Success: Green-500
- Warning: Yellow-500
- Error: Red-500

**Typography:**
- Primary Font: Inter
- Display Font: Poppins
- Sizes: 12px (small), 14px (body), 16px (large), 24px+ (headings)

**Layout:**
- **Sidebar**: Fixed left navigation (collapsible)
- **Main Content**: Central content area with section switching
- **Right Panel**: Contextual information and supplementary data
- **Top Bar**: Global controls and notifications

### 4.3 Key UI Components

1. **Sidebar Navigation**
   - Icon-based menu items
   - Active state indication
   - Collapsible functionality
   - User profile section
   - Theme toggle

2. **Focus Timer**
   - Large circular progress indicator
   - Time display (MM:SS)
   - Play/Pause/Reset controls
   - Mode indicator (Work/Break)
   - Inspirational quotes

3. **Calendar View**
   - Month/Week/Day views
   - Event indicators
   - Color-coded categories
   - Quick event creation

4. **Task List**
   - Checkbox for completion
   - Priority indicators
   - Due date badges
   - Drag-and-drop ordering (future)

5. **Habit Tracker**
   - Calendar grid for completion
   - Streak counter
   - Progress percentage
   - Quick check-off button

### 4.4 User Flows

**New User Onboarding:**
1. Launch application
2. Welcome screen
3. Name and avatar setup
4. Feature tour (optional)
5. First task/focus session setup

**Focus Session Workflow:**
1. Navigate to Focus Mode
2. Select work duration (15, 20, 25, 30, 45, 60, 90 minutes)
3. Select break duration (5, 10, 15, 20 minutes)
4. Start timer
5. Work session (full screen option)
6. Break notification
7. Auto-switch to break mode
8. Session completion
9. Achievement unlock (if applicable)

**Task Creation Workflow:**
1. Navigate to Tasks section
2. Click "Add Task" button
3. Enter task details (title, description, due date, priority)
4. Save task
5. Task appears in list
6. Mark complete when finished

---

## 5. Feature Specifications

### 5.1 Focus Timer Module

**Purpose:** Implement Pomodoro technique for improved focus and productivity

**Features:**
- Customizable work sessions: 15, 20, 25, 30, 45, 60, 90 minutes
- Customizable breaks: 5, 10, 15, 20 minutes
- Visual countdown timer
- Progress ring indicator
- Work/Break mode switching
- Auto-advance between modes
- Audio alarm notification
- Browser notification support
- Session persistence across page refreshes
- Reset functionality

**User Controls:**
- Play/Pause toggle
- Mode selector (Work/Break)
- Time duration selectors
- Alarm on/off toggle
- Reset button
- Full-screen option (future)

**Technical Requirements:**
- Persistent state via localStorage
- Accurate timing using JavaScript Date API
- Audio feedback via Web Audio API
- Browser notification permissions
- State recovery after page refresh

### 5.2 Calendar Module

**Purpose:** Manage events, deadlines, and schedule organization

**Features:**
- Calendar view (month/week/day)
- Event creation with rich details
- Event types: Work, Personal, Health, Social, Deadline, Birthday, Holiday, Meeting, Reminder, Important, Other
- Date and time selection
- Recurring events
- Color-coded categories
- Event editing and deletion
- Quick event creation
- Event filtering by type
- Export functionality (future)

**Data Model:**
```typescript
interface Event {
  id: string
  title: string
  description: string
  date: string // ISO format (YYYY-MM-DD)
  time: string // HH:MM format
  location?: string
  type: EventType
  color: string
  createdAt: string
  updatedAt?: string
  comments?: string[]
  eventType: "calendar" | "schedule"
}
```

### 5.3 Task Management Module

**Purpose:** Organize and track tasks with priorities and due dates

**Features:**
- Task creation with title, description, due date, priority
- Priority levels: Low, Medium, High
- Completion status tracking
- Task list view with filtering
- Search functionality
- Task editing and deletion
- Due date indicators
- Overdue task highlighting
- Task categories (future)

**Data Model:**
```typescript
interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority: "low" | "medium" | "high"
  dueDate: string
  createdAt: string
}
```

### 5.4 Habit Tracking Module

**Purpose:** Build and maintain productive habits with streak tracking

**Features:**
- Habit creation with name, description, frequency
- Frequency options: Daily, Weekly, Monthly, Custom
- Custom day selection for flexible schedules
- Streak counter (current and longest)
- Calendar view of completions
- Quick check-off button
- Visual progress indicators
- Completion history
- Habit statistics

**Data Model:**
```typescript
interface Habit {
  id: string
  name: string
  description: string
  frequency: "daily" | "weekly" | "monthly" | "custom"
  customDays?: number[]
  streak: number
  longestStreak: number
  completedDates: string[]
  createdAt: string
}
```

### 5.5 Goal Management Module

**Purpose:** Set and track progress toward personal and professional goals

**Features:**
- Goal creation with title, description, target value, unit
- Goal types: Daily, Weekly, Monthly, Yearly
- Progress tracking with current/target values
- Category organization (Health, Career, Personal, Finance, Learning, Other)
- Deadline management
- Completion status
- Visual progress bar
- Percentage completion
- Goal statistics

**Data Model:**
```typescript
interface Goal {
  id: string
  title: string
  description: string
  type: "daily" | "weekly" | "monthly" | "yearly"
  targetValue: number
  currentValue: number
  unit: string
  category: GoalCategory
  deadline: string
  completed: boolean
  createdAt: string
}
```

### 5.6 Journaling Module

**Purpose:** Daily reflection and mindfulness practice

**Features:**
- Rich text editor (React Quill)
- Journal entry creation with date
- Mood selection (Excellent, Good, Neutral, Challenging, Difficult)
- Energy level slider (1-10)
- Gratitude entry
- Reflection field
- Entry history
- Search and filter
- Entry editing and deletion
- Text formatting options

**Data Model:**
```typescript
interface JournalEntry {
  id: string
  title: string
  content: string
  mood: "excellent" | "good" | "neutral" | "challenging" | "difficult"
  energy: number
  gratitude: string
  reflection: string
  date: string
  createdAt: string
  formatting?: {
    fontFamily: string
    fontSize: number
    textAlign: "left" | "center" | "right"
    highlights: Array<{start: number, end: number, color: string}>
  }
}
```

### 5.7 Notebook Module

**Purpose:** Quick notes and information capture

**Features:**
- Rich text note editor
- Note creation with title and content
- Category and tag organization
- Note search
- Creation and modification timestamps
- Note deletion
- Note organization
- Export notes (future)

**Data Model:**
```typescript
interface Note {
  id: string
  title: string
  content: string
  category?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}
```

### 5.8 Reminders Module

**Purpose:** Set and manage customizable reminders

**Features:**
- Reminder creation with title and message
- Time-based notifications
- Reminder types: General, Task, Habit, Break, Hydration, Custom
- Day-specific scheduling (Sun-Sat)
- Enable/disable toggle
- Reminder list management
- Notification delivery (future: system notifications)

**Data Model:**
```typescript
interface Reminder {
  id: string
  title: string
  message: string
  type: "general" | "task" | "habit" | "break" | "hydration" | "custom"
  time: string
  days: number[]
  enabled: boolean
  created_at: string
}
```

### 5.9 Analytics Module

**Purpose:** Visualize productivity metrics and trends

**Features:**
- Focus session statistics (total sessions, total time, average duration)
- Task completion rate
- Habit streak analytics
- Goal progress visualization
- Calendar event distribution
- Journal mood trends
- Productivity trends over time
- Charts and graphs (Recharts)
- Export reports (future)

**Metrics Tracked:**
- Focus sessions: Total count, total duration, average duration, longest session
- Tasks: Total created, completed rate, overdue rate, priority distribution
- Habits: Total habits, average streak, completion rate
- Goals: Total goals, completion rate, progress distribution
- Journal: Total entries, mood distribution, average energy

### 5.10 Achievement System

**Purpose:** Gamification and motivation through achievements

**Features:**
- Achievement definition and tracking
- Achievement categories
- Progress toward achievements
- Achievement unlock notifications
- Achievement history
- Visual badges and icons
- Milestone celebrations

**Achievement Types:**
- Focus achievements (sessions, hours, streaks)
- Task achievements (completions, streak)
- Habit achievements (streaks, consistency)
- Goal achievements (milestones, completions)
- Journal achievements (entries, consistency)
- Special achievements (first actions, milestones)

**Data Model:**
```typescript
interface Achievement {
  id: string
  type: string
  title: string
  description: string
  icon?: string
  earnedDate?: string
  createdAt: string
}
```

---

## 6. User Settings & Customization

### 6.1 User Profile
- Name display
- Avatar upload
- Theme preference (Light/Dark/System)
- Language selection (future)

### 6.2 Preferences
- Default focus duration
- Default break duration
- Long break duration
- Sessions before long break
- Alarm sound selection
- Notification preferences
- Auto-save enabled/disabled

### 6.3 Security
- Password protection for sections
- Component-level password locks
- Data encryption (future)

### 6.4 Data Management
- Export data (JSON)
- Import data (future)
- Clear all data
- Reset application

---

## 7. Non-Functional Requirements

### 7.1 Performance
- Initial load time: < 2 seconds
- Page navigation: < 500ms
- Smooth 60fps animations
- Efficient memory usage
- Optimized bundle size

### 7.2 Reliability
- Data persistence: 99.9% success rate
- Auto-save functionality: automatic on changes
- Error recovery: graceful handling
- No data loss on crashes

### 7.3 Security
- Local data storage (privacy-first)
- No external data transmission
- Secure password handling
- Input validation and sanitization

### 7.4 Accessibility
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance (WCAG AA)
- Text scaling support

### 7.5 Usability
- Intuitive navigation
- Minimal learning curve
- Help and tooltips
- Error messages with actionable guidance

### 7.6 Compatibility
- Desktop: Windows 10+, macOS 10.15+, Linux
- Browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Responsive design for various screen sizes

---

## 8. Development Roadmap

### Phase 1: MVP (Current - v0.1.0) ✅
- [x] Core UI/UX framework
- [x] Focus timer with Pomodoro technique
- [x] Task management
- [x] Calendar events
- [x] Habit tracking
- [x] Goal management
- [x] Journaling
- [x] Notebook
- [x] Reminders
- [x] Analytics dashboard
- [x] Achievement system
- [x] Local data persistence
- [x] Desktop application (Python wrapper)

### Phase 2: Enhancement (v0.2.0)
- [ ] Data import/export
- [ ] Cloud sync (optional)
- [ ] Task drag-and-drop reordering
- [ ] Calendar integration (Google, Outlook)
- [ ] Advanced analytics
- [ ] Custom themes
- [ ] Keyboard shortcuts
- [ ] Offline PWA support

### Phase 3: Collaboration (v0.3.0)
- [ ] Multi-user accounts
- [ ] Shared calendars/tasks
- [ ] Team goals
- [ ] Collaboration features
- [ ] Comments and mentions

### Phase 4: AI Integration (v0.4.0)
- [ ] Smart task prioritization
- [ ] Habit suggestions
- [ ] Productivity insights
- [ ] Natural language processing
- [ ] Predictive scheduling

---

## 9. Success Metrics

### 9.1 User Engagement
- Daily active users (DAU)
- Session duration
- Feature adoption rate
- Return user rate

### 9.2 Product Metrics
- Focus sessions completed per user
- Tasks created and completed
- Habit streaks achieved
- Goals completed
- Journal entries created

### 9.3 Quality Metrics
- Crash rate < 0.1%
- Error rate < 1%
- User satisfaction score > 4.5/5
- Support ticket volume

### 9.4 Business Metrics (Future)
- User retention rate
- Subscription conversion rate (future monetization)
- Churn rate
- Net Promoter Score (NPS)

---

## 10. Risk Assessment

### 10.1 Technical Risks
**Risk:** Data loss or corruption  
**Mitigation:** Automated backups, data validation, error handling

**Risk:** Performance degradation  
**Mitigation:** Code optimization, lazy loading, performance monitoring

**Risk:** Browser compatibility issues  
**Mitigation:** Cross-browser testing, polyfills, progressive enhancement

### 10.2 User Experience Risks
**Risk:** Feature complexity overwhelming users  
**Mitigation:** Progressive onboarding, tooltips, help documentation

**Risk:** Learning curve too steep  
**Mitigation:** Tutorials, sample data, guided tours

### 10.3 Business Risks
**Risk:** Low user adoption  
**Mitigation:** User research, iterative design, marketing strategy

**Risk:** Competition from established players  
**Mitigation:** Unique value proposition, focusing on integration of features

---

## 11. Legal & Compliance

### 11.1 Privacy
- **Data Storage:** Local-first architecture ensures user data stays on-device
- **No Tracking:** No analytics or tracking scripts
- **No Third-Party Services:** Direct user-to-application communication
- **GDPR Compliance:** User owns their data with export capability

### 11.2 Licensing
- Open-source components: Compatible licenses checked
- Proprietary features: All code developed in-house or properly licensed

### 11.3 Terms of Service
- To be defined for future cloud features
- Currently: Desktop app with local storage requires minimal terms

---

## 12. Support & Documentation

### 12.1 User Documentation
- Getting started guide
- Feature documentation
- FAQ section
- Video tutorials

### 12.2 Technical Documentation
- Architecture documentation
- API documentation
- Database schema
- Deployment guide

### 12.3 Support Channels
- GitHub Issues for bug reports
- Feature requests via GitHub Discussions
- Email support (future)
- Community forum (future)

---

## 13. Conclusion

NEO FOCUS is a comprehensive productivity application designed to help users achieve their goals through integrated focus timer technology, task management, habit tracking, and analytics. With a strong foundation in place (v0.1.0), the application is positioned for continued growth and feature enhancement.

The hybrid architecture (web + desktop) provides flexibility for users while maintaining data privacy through local-first storage. The modern tech stack ensures maintainability and scalability for future development.

As the application evolves through subsequent phases, it will continue to prioritize user experience, data privacy, and productivity enhancement through innovative features and thoughtful design.

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** NEO FOCUS Team
