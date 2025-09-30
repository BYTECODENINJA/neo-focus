# AURA Focus - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Prerequisites
\`\`\`bash
# Install Tauri CLI globally
npm install -g @tauri-apps/cli

# Verify installation
tauri --version
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Run Development Server
\`\`\`bash
npm run tauri:dev
\`\`\`

### 4. Test Core Features
- ✅ Create a journal entry
- ✅ Add a task and mark complete
- ✅ Start focus timer
- ✅ Switch themes (Purple ↔ Black)

### 5. Build for Production
\`\`\`bash
npm run tauri build
\`\`\`

## 📁 Project Structure
\`\`\`
aura-focus-app/
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                   # Utilities and database
├── src-tauri/             # Rust backend
│   ├── src/main.rs        # Main Rust application
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
└── package.json           # Node.js dependencies
\`\`\`

## 🎯 Key Commands
- `npm run tauri:dev` - Development with hot reload
- `npm run tauri build` - Production build
- `npm run tauri build --debug` - Debug build for testing

## 🔧 Troubleshooting
- **Build fails**: Run `rm -rf node_modules && npm install`
- **Tauri not found**: Reinstall with `npm install -g @tauri-apps/cli`
- **Database issues**: Check file permissions

## 📚 Next Steps
- Read the full [TAURI-GUIDE.md](./TAURI-GUIDE.md) for detailed instructions
- Customize themes in `app/globals.css`
- Add new features in `components/`
- Modify database schema in `src-tauri/src/main.rs`
