"""
Sidebar component for navigation
"""

import tkinter as tk
from tkinter import ttk
from typing import Callable

class Sidebar:
    def __init__(self, parent, show_panel_callback: Callable, theme_manager):
        self.parent = parent
        self.show_panel = show_panel_callback
        self.theme_manager = theme_manager
        self.active_button = None
        
        self.create_sidebar()
    
    def create_sidebar(self):
        """Create sidebar with navigation buttons"""
        # Main sidebar frame
        self.frame = ttk.Frame(self.parent, style='Sidebar.TFrame')
        self.frame.pack(fill=tk.BOTH, expand=True)
        
        # Logo/Title
        title_frame = ttk.Frame(self.frame, style='Sidebar.TFrame')
        title_frame.pack(fill=tk.X, pady=(0, 20))
        
        title_label = ttk.Label(title_frame, text="AURA", font=('Arial', 20, 'bold'), style='Title.TLabel')
        title_label.pack()
        
        subtitle_label = ttk.Label(title_frame, text="Focus", font=('Arial', 14), style='Subtitle.TLabel')
        subtitle_label.pack()
        
        # Navigation buttons
        self.nav_buttons = {}
        nav_items = [
            ('dashboard', '📊 Dashboard'),
            ('tasks', '✅ Tasks'),
            ('habits', '🔄 Habits'),
            ('goals', '🎯 Goals'),
            ('notes', '📝 Notes'),
            ('journal', '📖 Journal'),
            ('calendar', '📅 Calendar'),
            ('focus', '⏱️ Focus Timer'),
            ('settings', '⚙️ Settings')
        ]
        
        for key, text in nav_items:
            btn = tk.Button(
                self.frame,
                text=text,
                font=('Arial', 11),
                relief=tk.FLAT,
                cursor='hand2',
                anchor='w',
                padx=20,
                pady=12,
                command=lambda k=key: self.on_nav_click(k)
            )
            btn.pack(fill=tk.X, pady=2)
            self.nav_buttons[key] = btn
        
        # Theme toggle button
        theme_frame = ttk.Frame(self.frame, style='Sidebar.TFrame')
        theme_frame.pack(side=tk.BOTTOM, fill=tk.X, pady=20)
        
        self.theme_button = tk.Button(
            theme_frame,
            text="🌙 Dark Mode",
            font=('Arial', 10),
            relief=tk.FLAT,
            cursor='hand2',
            command=self.toggle_theme
        )
        self.theme_button.pack(fill=tk.X)
    
    def on_nav_click(self, panel_key):
        """Handle navigation button click"""
        self.show_panel(panel_key)
    
    def set_active(self, panel_key):
        """Set active navigation button"""
        # Reset all buttons
        for btn in self.nav_buttons.values():
            btn.configure(relief=tk.FLAT)
        
        # Highlight active button
        if panel_key in self.nav_buttons:
            self.nav_buttons[panel_key].configure(relief=tk.SOLID)
            self.active_button = panel_key
    
    def toggle_theme(self):
        """Toggle between light and dark themes"""
        self.theme_manager.toggle_theme()
        self.update_theme_button()
    
    def update_theme_button(self):
        """Update theme button text"""
        if self.theme_manager.current_theme == 'dark':
            self.theme_button.configure(text="🎨 Purple Mode")
        else:
            self.theme_button.configure(text="🌙 Black Mode")
    
    def apply_theme(self, theme):
        """Apply theme to sidebar"""
        # Update frame background
        self.frame.configure(style='Sidebar.TFrame')
        
        # Update navigation buttons
        for btn in self.nav_buttons.values():
            btn.configure(
                bg=theme['sidebar_bg'],
                fg=theme['fg'],
                activebackground=theme['primary'],
                activeforeground='white',
                highlightthickness=0,
                bd=0
            )
        
        # Update active button
        if self.active_button and self.active_button in self.nav_buttons:
            self.nav_buttons[self.active_button].configure(
                bg=theme['primary'],
                fg='white'
            )
        
        # Update theme button
        self.theme_button.configure(
            bg=theme['sidebar_bg'],
            fg=theme['fg'],
            activebackground=theme['secondary_bg'],
            activeforeground=theme['fg'],
            highlightthickness=0,
            bd=0
        )
        
        self.update_theme_button()
