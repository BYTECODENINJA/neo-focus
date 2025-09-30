# AURA Focus - Tauri Testing & Packaging Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Rust** (latest stable) - [Install via rustup](https://rustup.rs/)
- **Tauri CLI** - Install globally with: `npm install -g @tauri-apps/cli`

### Platform-Specific Requirements

#### Windows
- **Microsoft Visual Studio C++ Build Tools** or **Visual Studio Community**
- **WebView2** (usually pre-installed on Windows 10/11)

#### macOS
- **Xcode Command Line Tools**: `xcode-select --install`
- **macOS 10.15+** for building

#### Linux (Ubuntu/Debian)
\`\`\`bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
\`\`\`

---

## 🧪 Testing Your App in Production Mode

### Step 1: Install Dependencies
\`\`\`bash
# Install Node.js dependencies
npm install

# Verify Tauri CLI installation
tauri --version
\`\`\`

### Step 2: Development Testing
\`\`\`bash
# Start development server with hot reload
npm run tauri:dev
\`\`\`

**What to test in development:**
- ✅ App launches without errors
- ✅ All UI components render correctly
- ✅ Database operations work (create, read, update, delete)
- ✅ Theme switching (Purple ↔ Black)
- ✅ All features function properly

### Step 3: Production Build Testing
\`\`\`bash
# Build the app for production testing
npm run build
npm run tauri build --debug
\`\`\`

**This creates a debug build that:**
- Uses production Next.js build
- Includes debug symbols for troubleshooting
- Faster build time than release build

### Step 4: Comprehensive Feature Testing

#### 🎯 Core Features Test Checklist

**Database & Persistence:**
- [ ] Create new journal entries
- [ ] Add tasks and mark as complete
- [ ] Create habits and track progress
- [ ] Set goals and update progress
- [ ] Add calendar events
- [ ] Create reminders
- [ ] Verify data persists after app restart

**UI & Theme Testing:**
- [ ] Switch between Purple and Black themes
- [ ] Test responsive design at different window sizes
- [ ] Verify all icons and images load correctly
- [ ] Test glassmorphism effects on cards
- [ ] Check scrolling performance

**Rich Text Editor:**
- [ ] Test all 8 font families
- [ ] Adjust font sizes (12px-24px)
- [ ] Use text highlighting (6 colors)
- [ ] Apply bold/italic formatting
- [ ] Test text alignment options
- [ ] Verify formatting persists after save

**Focus Timer:**
- [ ] Start/pause/reset timer functionality
- [ ] Test different timer durations
- [ ] Verify timer completion notifications
- [ ] Test timer persistence across app restarts

**Analytics & Reports:**
- [ ] View habit streak analytics
- [ ] Check goal progress charts
- [ ] Verify task completion statistics
- [ ] Test date range filtering

### Step 5: Performance Testing

**Memory Usage:**
\`\`\`bash
# Monitor memory usage during testing
# Windows: Task Manager
# macOS: Activity Monitor
# Linux: htop or system monitor
\`\`\`

**Database Performance:**
- Test with large datasets (100+ entries)
- Verify search functionality remains fast
- Check auto-save performance

**Startup Time:**
- Measure app launch time
- Should be under 3 seconds on modern hardware

---

## 📦 Packaging for Distribution

### Step 1: Pre-packaging Checklist

**Code Quality:**
- [ ] All TypeScript errors resolved
- [ ] No console errors in production build
- [ ] All features tested and working
- [ ] Database migrations tested

**Assets & Icons:**
- [ ] App icons present in `src-tauri/icons/`
- [ ] All required icon sizes included
- [ ] Placeholder images replaced with final assets

**Configuration:**
- [ ] Update version number in `src-tauri/tauri.conf.json`
- [ ] Set proper app identifier
- [ ] Configure bundle settings

### Step 2: Update App Configuration

Edit `src-tauri/tauri.conf.json`:

\`\`\`json
{
  "package": {
    "productName": "AURA Focus",
    "version": "1.0.0"
  },
  "tauri": {
    "bundle": {
      "identifier": "com.aurafocus.app",
      "category": "Productivity",
      "shortDescription": "AURA Focus - Productivity Suite",
      "longDescription": "A comprehensive productivity and mindfulness application with focus timers, journaling, habit tracking, and goal management."
    }
  }
}
\`\`\`

### Step 3: Production Build Commands

#### For Testing (Debug Build)
\`\`\`bash
npm run tauri build --debug
\`\`\`

#### For Distribution (Release Build)
\`\`\`bash
npm run tauri build
\`\`\`

#### Platform-Specific Builds
\`\`\`bash
# Windows only
npm run tauri build -- --target x86_64-pc-windows-msvc

# macOS only (requires macOS)
npm run tauri build -- --target x86_64-apple-darwin
npm run tauri build -- --target aarch64-apple-darwin

# Linux only
npm run tauri build -- --target x86_64-unknown-linux-gnu
\`\`\`

### Step 4: Build Output Locations

After successful build, find your distributables:

**Windows:**
- `src-tauri/target/release/bundle/msi/AURA Focus_1.0.0_x64_en-US.msi`
- `src-tauri/target/release/bundle/nsis/AURA Focus_1.0.0_x64-setup.exe`

**macOS:**
- `src-tauri/target/release/bundle/dmg/AURA Focus_1.0.0_x64.dmg`
- `src-tauri/target/release/bundle/macos/AURA Focus.app`

**Linux:**
- `src-tauri/target/release/bundle/deb/aura-focus_1.0.0_amd64.deb`
- `src-tauri/target/release/bundle/appimage/aura-focus_1.0.0_amd64.AppImage`

---

## 🔧 Troubleshooting Common Issues

### Build Errors

**"Failed to bundle project"**
\`\`\`bash
# Clean build cache
rm -rf src-tauri/target
rm -rf node_modules
npm install
npm run tauri build
\`\`\`

**"WebView2 not found" (Windows)**
- Download and install WebView2 Runtime from Microsoft

**"Command not found: tauri"**
\`\`\`bash
# Reinstall Tauri CLI
npm uninstall -g @tauri-apps/cli
npm install -g @tauri-apps/cli@latest
\`\`\`

### Runtime Errors

**Database connection issues:**
- Check file permissions in app data directory
- Verify SQLite database file creation

**Theme not applying:**
- Clear browser cache if testing in dev mode
- Check CSS variable definitions

### Performance Issues

**Slow startup:**
- Optimize bundle size by removing unused dependencies
- Check for blocking operations in app initialization

**High memory usage:**
- Profile React components for memory leaks
- Optimize large data sets with pagination

---

## 🚀 Distribution Checklist

### Before Release
- [ ] Version number updated
- [ ] All features tested on target platforms
- [ ] App icons and branding finalized
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] User documentation prepared

### Release Process
1. **Tag Release**: Create git tag with version number
2. **Build All Platforms**: Create distributables for Windows, macOS, Linux
3. **Test Installers**: Verify installation process on clean systems
4. **Code Signing**: Sign executables for security (optional but recommended)
5. **Upload**: Distribute via your preferred channels

### Post-Release
- [ ] Monitor crash reports
- [ ] Collect user feedback
- [ ] Plan next version features
- [ ] Maintain update mechanism

---

## 📊 Build Size Optimization

### Reduce Bundle Size
\`\`\`bash
# Analyze bundle size
npm run build
npx next-bundle-analyzer

# Remove unused dependencies
npm prune --production
\`\`\`

### Tauri Bundle Optimization
In `src-tauri/tauri.conf.json`:
\`\`\`json
{
  "tauri": {
    "bundle": {
      "resources": [],
      "externalBin": [],
      "targets": ["msi", "deb", "dmg"]
    }
  }
}
\`\`\`

---

## 🔐 Security Considerations

### Code Signing (Recommended)

**Windows:**
- Obtain code signing certificate
- Configure in `tauri.conf.json`

**macOS:**
- Apple Developer account required
- Configure signing identity

**Linux:**
- GPG signing for packages

### Security Audit
\`\`\`bash
# Audit dependencies
npm audit
npm audit fix

# Check Rust dependencies
cargo audit
\`\`\`

---

## 📈 Performance Benchmarks

### Target Metrics
- **Startup Time**: < 3 seconds
- **Memory Usage**: < 150MB idle
- **Bundle Size**: < 100MB
- **Database Operations**: < 100ms for typical queries

### Monitoring Tools
- **Development**: React DevTools, Chrome DevTools
- **Production**: Built-in Tauri performance APIs
- **System**: Platform-specific monitoring tools

---

This guide ensures your AURA Focus app is thoroughly tested and properly packaged for distribution across all supported platforms.
