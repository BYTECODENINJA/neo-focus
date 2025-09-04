import os
import sys
import subprocess
import shutil
from pathlib import Path

# Ensure UTF-8 console encoding to avoid UnicodeEncodeError on Windows terminals
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

def run_command(command, cwd=None):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error running command: {command}")
            print(f"Error: {result.stderr}")
            return False
        print(f"Success: {result.stdout}")
        return True
    except Exception as e:
        print(f"Exception running command {command}: {e}")
        return False

def ensure_node_dependencies():
    """Ensure Node.js dependencies are installed (npm ci)"""
    print("📦 Installing Node.js dependencies (npm ci)...")
    # Prefer npm ci for reproducibility; fall back to npm install
    if run_command("npm ci"):
        print("✅ Node.js dependencies installed via npm ci")
        return True
    print("⚠️ npm ci failed. Trying 'npm install'...")
    if run_command("npm install"):
        print("✅ Node.js dependencies installed via npm install")
        return True
    print("❌ Failed to install Node.js dependencies")
    return False


def build_nextjs():
    """Build the Next.js application"""
    print("🔨 Building Next.js application...")
    # If 'out' already exists and is not empty, skip rebuilding to save time
    out_dir = Path("out")
    if out_dir.exists() and any(out_dir.rglob("*")):
        print("⏭️  Skipping Next.js build (existing 'out' directory detected)")
        return True

    # Ensure dependencies first
    if not ensure_node_dependencies():
        return False

    if not run_command("npm run build"):
        print("❌ Failed to build Next.js application")
        return False
    # Verify the expected export directory exists
    if not out_dir.exists():
        print("⚠️ 'out' directory not found after build.")
        print("   Ensure next.config.mjs has output: 'export' or run 'npx next export'.")
        # Attempt a manual export
        if run_command("npx next export") and out_dir.exists():
            print("✅ Next.js static export completed")
        else:
            print("❌ Static export failed. Check Next.js build errors above.")
            return False
    print("✅ Next.js build completed")
    return True

def install_python_deps():
    """Install Python dependencies"""
    print("📦 Installing Python dependencies...")
    # Use the current Python interpreter to install packages
    pip_cmd = f'"{sys.executable}" -m pip install --upgrade pip'
    run_command(pip_cmd)
    if not run_command(f'"{sys.executable}" -m pip install -r requirements.txt'):
        print("❌ Failed to install Python dependencies")
        return False
    print("✅ Python dependencies installed")
    return True

def create_pyinstaller_spec():
    """Create PyInstaller spec file"""
    spec_content = '''# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['app.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('out', 'out'),
        ('neo-focus.ico', '.'),
        ('database_manager.py', '.'),
    ],
    hiddenimports=[
        'webview',
        'webview.platforms.winforms',
        'webview.platforms.cef',
        'webview.platforms.winforms.forms',
        'webview.platforms.winforms.controls',
        'sqlite3',
        'threading',
        'pathlib',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='NEO-FOCUS',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='neo-focus.ico',
)
'''
    
    with open('NEO-FOCUS.spec', 'w') as f:
        f.write(spec_content)
    print("✅ PyInstaller spec file created")

def build_executable():
    """Build the executable using PyInstaller"""
    print("🔨 Building executable with PyInstaller...")
    # Use module invocation to avoid PATH issues on Windows
    if not run_command(f'"{sys.executable}" -m PyInstaller NEO-FOCUS.spec --clean'):
        print("❌ Failed to build executable")
        return False
    print("✅ Executable built successfully")
    return True

def create_installer():
    """Create Windows installer using NSIS"""
    print("📦 Creating Windows installer...")
    
    # Check if NSIS is available
    nsis_path = None
    possible_paths = [
        r"C:\Program Files\NSIS\makensis.exe",
        r"C:\Program Files (x86)\NSIS\makensis.exe",
        "makensis.exe"  # If in PATH
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            nsis_path = path
            break
    
    if not nsis_path:
        print("⚠️  NSIS not found. Creating standalone executable only.")
        print("   To create an installer, install NSIS from: https://nsis.sourceforge.io/Download")
        return True
    
    # Locate built executable (support both onefile and onefolder layouts)
    exe_candidates = [
        os.path.join("dist", "NEO-FOCUS.exe"),
        os.path.join("dist", "NEO-FOCUS", "NEO-FOCUS.exe"),
    ]
    exe_path = next((p for p in exe_candidates if os.path.exists(p)), None)
    if exe_path:
        shutil.copy(exe_path, "NEO-FOCUS.exe")
    
    # Create installer
    if run_command(f'"{nsis_path}" installer.nsi'):
        print("✅ Windows installer created: NEO-FOCUS-Setup.exe")
        return True
    else:
        print("❌ Failed to create installer")
        return False

def cleanup():
    """Clean up build artifacts"""
    print("🧹 Cleaning up build artifacts...")
    cleanup_dirs = ['build', '__pycache__']
    cleanup_files = ['NEO-FOCUS.spec', 'NEO-FOCUS.exe']
    
    for dir_name in cleanup_dirs:
        if os.path.exists(dir_name):
            shutil.rmtree(dir_name)
    
    for file_name in cleanup_files:
        if os.path.exists(file_name):
            os.remove(file_name)
    
    print("✅ Cleanup completed")

def main():
    """Main build process"""
    print("🚀 Starting NEO FOCUS Python build process...")
    
    # Check if we're in the right directory
    if not os.path.exists('package.json'):
        print("❌ Error: package.json not found. Please run this script from the project root.")
        return False
    
    args = set(sys.argv[1:])
    skip_node_build = ('--skip-node' in args) or (os.environ.get('SKIP_NODE_BUILD') == '1')
    skip_pip_install = ('--skip-pip' in args) or (os.environ.get('SKIP_PIP_INSTALL') == '1')

    # Step 1: Build Next.js (unless skipped)
    if skip_node_build:
        print("⏭️  Skipping Node/Next.js build as requested (--skip-node or SKIP_NODE_BUILD=1)")
        if not Path('out').exists():
            print("❌ 'out' directory not found. Cannot skip Node build without an existing export.")
            return False
    else:
        if not build_nextjs():
            return False
    
    # Step 2: Install Python dependencies (unless skipped)
    if skip_pip_install:
        print("⏭️  Skipping pip install as requested (--skip-pip or SKIP_PIP_INSTALL=1)")
    else:
        if not install_python_deps():
            return False
    
    # Step 3: Create PyInstaller spec
    create_pyinstaller_spec()
    
    # Step 4: Build executable
    if not build_executable():
        return False
    
    # Step 5: Create installer
    create_installer()
    
    # Step 6: Cleanup
    cleanup()
    
    print("🎉 Build completed successfully!")
    # Print actual exe location
    exe_candidates = [
        os.path.join("dist", "NEO-FOCUS.exe"),
        os.path.join("dist", "NEO-FOCUS", "NEO-FOCUS.exe"),
    ]
    exe_path = next((p for p in exe_candidates if os.path.exists(p)), 'dist/NEO-FOCUS/NEO-FOCUS.exe')
    print(f"📁 Your executable is located in: {exe_path}")
    
    if os.path.exists("NEO-FOCUS-Setup.exe"):
        print("📦 Windows installer created: NEO-FOCUS-Setup.exe")
        print("   This installer will properly install the application with:")
        print("   - Start menu shortcuts")
        print("   - Desktop shortcut")
        print("   - Add/Remove Programs entry")
        print("   - Proper uninstaller")
    else:
        print("📦 Standalone executable created (no installer)")
        print("   To create an installer, install NSIS from: https://nsis.sourceforge.io/Download")
    
    print("📦 File size should be much smaller than the Electron version!")
    
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
