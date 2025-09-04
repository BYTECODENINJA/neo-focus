#!/usr/bin/env python3
"""
Test script to verify PyWebView installation and basic functionality
"""

import sys
import os

def test_imports():
    """Test if required modules can be imported"""
    print("🧪 Testing Python imports...")
    
    try:
        import webview
        print("✅ PyWebView imported successfully")
        # Try to get version, but don't fail if not available
        try:
            print(f"   Version: {webview.__version__}")
        except AttributeError:
            print("   Version: Available (version info not accessible)")
    except ImportError as e:
        print(f"❌ Failed to import PyWebView: {e}")
        print("   Please run: pip install -r requirements.txt")
        return False
    
    try:
        import subprocess
        print("✅ subprocess imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import subprocess: {e}")
        return False
    
    try:
        import pathlib
        print("✅ pathlib imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import pathlib: {e}")
        return False
    
    return True

def test_nextjs_build():
    """Test if Next.js build exists"""
    print("\n🔍 Checking Next.js build...")
    
    out_path = os.path.join(os.getcwd(), 'out')
    if os.path.exists(out_path):
        print("✅ Next.js build directory found")
        
        index_path = os.path.join(out_path, 'index.html')
        if os.path.exists(index_path):
            print("✅ index.html found")
            return True
        else:
            print("❌ index.html not found in out directory")
            return False
    else:
        print("❌ Next.js build directory not found")
        print("   Please run: npm run build")
        return False

def test_icon():
    """Test if icon file exists"""
    print("\n🎨 Checking icon file...")
    
    icon_path = os.path.join(os.getcwd(), 'neo-focus.ico')
    if os.path.exists(icon_path):
        print("✅ neo-focus.ico found")
        return True
    else:
        print("❌ neo-focus.ico not found")
        return False

def main():
    """Run all tests"""
    print("🚀 NEO FOCUS Python Setup Test")
    print("=" * 40)
    
    all_passed = True
    
    # Test imports
    if not test_imports():
        all_passed = False
    
    # Test Next.js build
    if not test_nextjs_build():
        all_passed = False
    
    # Test icon
    if not test_icon():
        all_passed = False
    
    print("\n" + "=" * 40)
    if all_passed:
        print("🎉 All tests passed! You're ready to build.")
        print("   Run: npm run dist-python")
    else:
        print("❌ Some tests failed. Please fix the issues above.")
    
    return all_passed

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
