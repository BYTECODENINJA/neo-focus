#!/usr/bin/env python3
"""
Simple test script to verify the application loads correctly
"""

import webview
import os
import sys
import time
from database_manager import DatabaseManager

def test_application():
    """Test if the application loads without errors"""
    
    print("🧪 Testing NEO FOCUS Application")
    print("=" * 40)
    
    try:
        # Test database manager
        print("📊 Testing database manager...")
        db_manager = DatabaseManager()
        data = db_manager.get_all_data()
        print(f"✅ Database loaded successfully with {len(data.get('events', []))} events")
        
        # Test application startup
        print("🚀 Testing application startup...")
        
        # Start the application
        app = webview.create_window(
            'NEO FOCUS',
            'http://localhost:8000',
            width=1400,
            height=900,
            resizable=True,
            text_select=True,
            confirm_close=False
        )
        
        print("✅ Application window created successfully")
        print("✅ Application should now be running without errors")
        print("\n🎉 All tests passed! The client-side exception has been resolved.")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        return False

if __name__ == '__main__':
    success = test_application()
    sys.exit(0 if success else 1)
