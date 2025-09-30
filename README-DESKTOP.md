# AURA FOCUS Desktop Application

AURA FOCUS is now a full-featured desktop application built with Electron, Next.js, and SQLite for persistent data storage.

## 🚀 Features

### Desktop Application
- **Native Desktop App**: Runs locally without internet connection
- **Cross-Platform**: Available for Windows, macOS, and Linux
- **System Integration**: Native menus, notifications, and file handling
- **Auto-Save**: Automatic data persistence with SQLite database

### Data Persistence
- **SQLite Database**: Local database for reliable data storage
- **Auto-Save**: Changes are automatically saved every 2 seconds
- **Data Recovery**: Your data persists between app sessions
- **Backup Ready**: Database file can be easily backed up

### Dark Mode Support
- **Theme Toggle**: Switch between light and dark modes
- **System Integration**: Respects system theme preferences
- **Keyboard Shortcut**: `Ctrl/Cmd + D` to toggle theme
- **Persistent Settings**: Theme preference is saved

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
\`\`\`bash
# Clone the repository
git clone <repository-url>
cd aura-focus

# Install dependencies
npm install

# Development mode (runs both Next.js and Electron)
npm run electron-dev

# Build for production
npm run build-electron

# Create distributable packages
npm run dist
\`\`\`

### Available Scripts
- `npm run dev` - Start Next.js development server
- `npm run electron` - Start Electron with built Next.js app
- `npm run electron-dev` - Development mode with hot reload
- `npm run build` - Build Next.js app for production
- `npm run build-electron` - Build and package Electron app
- `npm run dist` - Create distributable packages

## 📁 Project Structure

\`\`\`
aura-focus/
├── electron/
│   ├── main.js          # Electron main process
│   ├── preload.js       # Preload script for security
│   └── database.js      # SQLite database handler
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/
│   └── database.ts      # Database interface
├── types/
│   └── electron.d.ts    # TypeScript definitions
└── package.json
\`\`\`

## 💾 Database Schema

The application uses SQLite with the following tables:
- `events` - Calendar events
- `tasks` - Task management
- `habits` - Habit tracking
- `goals` - Goal setting and progress
- `notes` - Note-taking
- `journals` - Journal entries
- `settings` - Application settings

## 🎨 Theme System

### Light Mode
- Clean, bright interface
- High contrast for readability
- Professional appearance

### Dark Mode
- Easy on the eyes
- Reduced eye strain
- Modern aesthetic

### Theme Toggle
- Button in sidebar header
- Keyboard shortcut: `Ctrl/Cmd + D`
- Menu option: View → Toggle Dark Mode

## 🔧 Configuration

### Database Location
- **Windows**: `%APPDATA%/aura-focus/aura-focus.db`
- **macOS**: `~/Library/Application Support/aura-focus/aura-focus.db`
- **Linux**: `~/.config/aura-focus/aura-focus.db`

### Settings Storage
All user preferences are stored in the SQLite database:
- Theme preference
- Music tracks and playlists
- User profile information
- Application state

## 🚀 Building for Distribution

### Windows
\`\`\`bash
npm run dist
# Creates: dist/AURA FOCUS Setup.exe
\`\`\`

### macOS
\`\`\`bash
npm run dist
# Creates: dist/AURA FOCUS.dmg
\`\`\`

### Linux
\`\`\`bash
npm run dist
# Creates: dist/AURA FOCUS.AppImage
\`\`\`

## 🔒 Security

- **Context Isolation**: Enabled for security
- **Node Integration**: Disabled in renderer
- **Preload Scripts**: Secure IPC communication
- **Local Data**: All data stored locally, no cloud dependency

## 📱 Features Overview

### Productivity Tools
- **Calendar**: Event scheduling with alarms
- **Tasks**: Task management with priorities
- **Habits**: Habit tracking with streaks
- **Goals**: Goal setting with progress tracking
- **Notes**: Rich text note-taking
- **Journal**: Daily journaling with mood tracking

### Focus Features
- **Focus Mode**: Pomodoro timer with persistence
- **Music Player**: Background music for concentration
- **AI Assistant**: Productivity guidance
- **Dark Mode**: Reduced eye strain

### Data Management
- **Auto-Save**: Automatic data persistence
- **Import/Export**: Easy data backup
- **Search**: Full-text search across all content
- **Sync**: Local database synchronization

## 🎯 Usage Tips

1. **First Launch**: The app will create a new database automatically
2. **Data Backup**: Copy the database file to backup your data
3. **Theme Switching**: Use `Ctrl/Cmd + D` for quick theme toggle
4. **Auto-Save**: Changes are saved automatically every 2 seconds
5. **Keyboard Shortcuts**: Use menu shortcuts for quick actions

## 🐛 Troubleshooting

### Database Issues
- Check database file permissions
- Ensure sufficient disk space
- Restart the application

### Performance
- Close unused sections
- Clear old data periodically
- Update to latest version

### Theme Issues
- Reset theme in settings
- Check system theme compatibility
- Restart application

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review troubleshooting guide
