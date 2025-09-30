# Aura Focus - Advanced Productivity Suite

A comprehensive productivity application built with React, Next.js, and Python desktop integration featuring task management, habit tracking, goal setting with milestones, organized note-taking, rich journaling, focus timer, and intelligent reminders.

## Features

### 📝 Enhanced Notebook
- **Folder Organization**: Create colored folders to organize your notes
- **Dropdown Navigation**: Easy folder selection with note counts
- **Rich Text Support**: Full-featured note editor with search functionality
- **Tag System**: Organize notes with tags for better discoverability

### 📖 Rich Journal Experience
- **Paragraph Format**: All entry components (title, content, gratitude, reflection) combined into readable paragraphs
- **Font Customization**: Choose from multiple font families that apply to all journal content
- **Mood & Energy Tracking**: Visual mood indicators with energy level sliders
- **Structured Entries**: Separate sections for gratitude and reflection

### 🎯 Goals with Milestones
- **Milestone Tracking**: Break down goals into checkable milestones
- **Progress Visualization**: Track completion through milestone checkboxes
- **Flexible Progress**: Choose between numeric progress or milestone-based tracking
- **Category Organization**: Color-coded categories for different goal types

### ⏰ Named Focus Sessions
- **Session Naming**: Prompt users to name their focus sessions for better tracking
- **Persistent Popups**: Completion notifications that stay until user acknowledges
- **Session History**: Track all named focus sessions with completion status
- **Auto-start Options**: Configurable auto-start for breaks and work sessions

### 🔔 Repeating Reminders
- **Persistent Alarms**: Reminders repeat every few seconds until stopped
- **Snooze Functionality**: 5-minute snooze option for active alarms
- **Repeat Patterns**: Daily, weekly, and monthly recurring reminders
- **Visual Alerts**: Prominent popup notifications with stop/snooze options

### 🌍 Language & Timezone Support
- **Multi-language**: Support for English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, and Chinese
- **Dynamic Translation**: Interface updates immediately when language changes
- **Timezone Awareness**: All times and dates respect selected timezone
- **Real-time Clock**: Current time display in selected timezone

### 💾 SQLite Data Persistence
- **Local Database**: SQLite database for reliable data storage
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Data Integrity**: Foreign key constraints and proper relationships
- **Backup/Export**: Built-in data export functionality

## Installation Options

### Option 1: Web Version (React/Next.js)
\`\`\`bash
npm install
npm run dev
\`\`\`

### Option 2: Desktop Version (Python + PyWebView)
\`\`\`bash
pip install -r requirements.txt
python main.py
\`\`\`

### Option 3: Docker (Cross-Platform Compatibility)

#### Prerequisites
- Docker installed on your system
- Docker Compose (optional, for easier management)

#### Using Docker

**Build and run with Docker:**
\`\`\`bash
# Build the Docker image
docker build -t aura-focus .

# Run the container
docker run -p 3000:3000 -v aura-focus-data:/app/data aura-focus
\`\`\`

**Using Docker Compose (Recommended):**
\`\`\`bash
# Start the application
docker-compose up -d

# Stop the application
docker-compose down

# View logs
docker-compose logs -f
\`\`\`

**Access the application:**
- Web interface: http://localhost:3000
- Data persistence: Automatically handled via Docker volumes

#### Docker Configuration Files

**Dockerfile:**
\`\`\`dockerfile
# Use Node.js LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install Python and SQLite for desktop features
RUN apk add --no-cache python3 py3-pip sqlite

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy Python requirements
COPY requirements.txt ./

# Install Python dependencies
RUN pip3 install -r requirements.txt

# Copy application code
COPY . .

# Create data directory for persistence
RUN mkdir -p /app/data

# Build the Next.js application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
\`\`\`

**docker-compose.yml:**
\`\`\`yaml
version: '3.8'

services:
  aura-focus:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - aura-focus-data:/app/data
      - ./config:/app/config:ro
    environment:
      - NODE_ENV=production
      - DATABASE_PATH=/app/data/aura_focus.db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  aura-focus-data:
    driver: local
\`\`\`

#### Docker Environment Variables

Create a `.env` file for customization:
\`\`\`env
# Application Settings
NODE_ENV=production
PORT=3000

# Database Settings
DATABASE_PATH=/app/data/aura_focus.db

# Feature Flags
ENABLE_DESKTOP_FEATURES=true
ENABLE_NOTIFICATIONS=true

# Security
SESSION_SECRET=your-secret-key-here
\`\`\`

#### Docker Benefits

1. **Cross-Platform**: Runs identically on Windows, macOS, and Linux
2. **Isolated Environment**: No conflicts with system dependencies
3. **Easy Deployment**: Single command deployment
4. **Data Persistence**: Automatic data backup via volumes
5. **Scalability**: Easy to scale or replicate
6. **Version Control**: Pin specific versions for consistency

#### Docker Development

For development with hot reload:
\`\`\`bash
# Development with volume mounting
docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules aura-focus npm run dev
\`\`\`

#### Docker Production Deployment

**Using Docker Swarm:**
\`\`\`bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml aura-focus

# Scale service
docker service scale aura-focus_aura-focus=3
\`\`\`

**Using Kubernetes:**
\`\`\`yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aura-focus
spec:
  replicas: 2
  selector:
    matchLabels:
      app: aura-focus
  template:
    metadata:
      labels:
        app: aura-focus
    spec:
      containers:
      - name: aura-focus
        image: aura-focus:latest
        ports:
        - containerPort: 3000
        volumeMounts:
        - name: data-volume
          mountPath: /app/data
      volumes:
      - name: data-volume
        persistentVolumeClaim:
          claimName: aura-focus-pvc
\`\`\`

## Desktop App Features

- **Native Integration**: System notifications and native file dialogs
- **Background Services**: Reminder checking and focus timer management
- **Cross-platform**: Windows, macOS, and Linux support
- **Offline First**: All data stored locally with SQLite

## Building Desktop Executable

\`\`\`bash
pip install pyinstaller
pyinstaller --onefile --windowed --add-data "index.html;." --add-data "styles;styles" --add-data "js;js" main.py
\`\`\`

## Project Structure

\`\`\`
aura-focus-app/
├── components/           # React components
│   ├── notebook.tsx     # Enhanced notebook with folders
│   ├── journal.tsx      # Rich journal with formatting
│   ├── goals.tsx        # Goals with milestones
│   ├── focus-mode.tsx   # Named focus sessions
│   ├── reminders.tsx    # Repeating reminders
│   └── user-settings.tsx # Language & timezone settings
├── main.py              # Python desktop app
├── requirements.txt     # Python dependencies
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
└── README.md           # This file
\`\`\`

## Key Improvements

1. **Folder System**: Notes are now organized in colored folders with dropdown navigation
2. **Journal Formatting**: Entries display as readable paragraphs with font customization
3. **Goal Milestones**: Goals can have checkable milestones for better progress tracking
4. **Named Focus**: Focus sessions require naming and show persistent completion popups
5. **Repeating Alarms**: Reminders repeat until manually stopped with snooze options
6. **Internationalization**: Full language support with timezone-aware functionality
7. **SQLite Integration**: Robust local database with proper relationships and constraints
8. **Docker Support**: Full containerization for cross-platform compatibility

## Usage

### Creating Folders
1. Click the folder+ icon in the notebook
2. Choose a name and color for your folder
3. Organize notes by selecting folders when creating/editing

### Setting Up Milestones
1. When creating a goal, enable "Track with milestones"
2. Add milestone names that represent key progress points
3. Check off milestones as you complete them

### Using Named Focus Sessions
1. Select "Work Session" in focus mode
2. Enter a descriptive name for your session
3. Complete the session to see persistent completion popup

### Managing Repeating Reminders
1. Create a reminder with repeat pattern (daily/weekly/monthly)
2. When alarm triggers, it will repeat every 3 seconds
3. Click "Stop Alarm" or "Snooze 5m" to handle the alert

### Language & Timezone
1. Go to Settings > Language & Region
2. Select your preferred language and timezone
3. Interface and times update immediately

### Docker Deployment
1. Clone the repository
2. Run `docker-compose up -d`
3. Access at http://localhost:3000
4. Data persists automatically

## Troubleshooting

### Docker Issues
- **Port conflicts**: Change port in docker-compose.yml
- **Permission issues**: Ensure Docker has proper permissions
- **Data loss**: Check volume mounts are configured correctly

### General Issues
- **Database errors**: Check SQLite file permissions
- **Notification issues**: Verify browser/system permissions
- **Performance**: Consider resource limits in Docker

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (including Docker build)
5. Submit a pull request

## License

MIT License - see LICENSE file for details
