"""
Main Window for AURA Focus
Contains the primary application interface
"""

import tkinter as tk
from tkinter import ttk, messagebox
import logging
from datetime import datetime

from src.ui.components.sidebar import Sidebar
from src.ui.components.dashboard import Dashboard
from src.ui.components.tasks import TasksPanel
from src.ui.components.habits import HabitsPanel
from src.ui.components.goals import GoalsPanel
from src.ui.components.notes import NotesPanel
from src.ui.components.journal import JournalPanel
from src.ui.components.calendar_view import CalendarPanel
from src.ui.components.focus_timer import FocusTimerPanel
from src.ui.components.settings import SettingsPanel
from src.ui.styles.theme_manager import ThemeManager

class MainWindow:
    def __init__(self, root, database, config):
        self.root = root
        self.db = database
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Initialize theme manager
        self.theme_manager = ThemeManager(config)
        
        # Setup main window
        self.setup_window()
        
        # Create main layout
        self.create_layout()
        
        # Initialize panels
        self.init_panels()
        
        # Apply theme
        self.apply_theme()
        
        # Show dashboard by default
        self.show_panel('dashboard')
    
    def setup_window(self):
        """Setup main window properties"""
        self.root.title("AURA Focus - Advanced Productivity Suite")
        self.root.geometry("1400x900")
        self.root.minsize(1200, 800)
        
        # Center window on screen
        self.root.update_idletasks()
        x = (self.root.winfo_screenwidth() // 2) - (1400 // 2)
        y = (self.root.winfo_screenheight() // 2) - (900 // 2)
        self.root.geometry(f"1400x900+{x}+{y}")
        
        # Configure window closing
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
    
    def create_layout(self):
        """Create main application layout"""
        # Main container
        self.main_frame = ttk.Frame(self.root)
        self.main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Create sidebar frame
        self.sidebar_frame = ttk.Frame(self.main_frame, width=250)
        self.sidebar_frame.pack(side=tk.LEFT, fill=tk.Y, padx=(10, 5), pady=10)
        self.sidebar_frame.pack_propagate(False)
        
        # Create content frame
        self.content_frame = ttk.Frame(self.main_frame)
        self.content_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=(5, 10), pady=10)
        
        # Create panels container
        self.panels_frame = ttk.Frame(self.content_frame)
        self.panels_frame.pack(fill=tk.BOTH, expand=True)
    
    def init_panels(self):
        """Initialize all application panels"""
        self.panels = {}
        
        # Initialize sidebar
        self.sidebar = Sidebar(self.sidebar_frame, self.show_panel, self.theme_manager)
        
        # Initialize content panels
        self.panels['dashboard'] = Dashboard(self.panels_frame, self.db, self.theme_manager)
        self.panels['tasks'] = TasksPanel(self.panels_frame, self.db, self.theme_manager)
        self.panels['habits'] = HabitsPanel(self.panels_frame, self.db, self.theme_manager)
        self.panels['goals'] = GoalsPanel(self.panels_frame, self.db, self.theme_manager)
        self.panels['notes'] = NotesPanel(self.panels_frame, self.db, self.theme_manager)
        self.panels['journal'] = JournalPanel(self.panels_frame, self.db, self.theme_manager)
        self.panels['calendar'] = CalendarPanel(self.panels_frame, self.db, self.theme_manager)
        self.panels['focus'] = FocusTimerPanel(self.panels_frame, self.db, self.theme_manager)
        self.panels['settings'] = SettingsPanel(self.panels_frame, self.db, self.config, self.theme_manager, self.apply_theme)
        
        # Hide all panels initially
        for panel in self.panels.values():
            panel.hide()
    
    def show_panel(self, panel_name):
        """Show specific panel and hide others"""
        # Hide all panels
        for panel in self.panels.values():
            panel.hide()
        
        # Show selected panel
        if panel_name in self.panels:
            self.panels[panel_name].show()
            self.panels[panel_name].refresh()
            
            # Update sidebar selection
            self.sidebar.set_active(panel_name)
            
            self.logger.info(f"Switched to panel: {panel_name}")
    
    def apply_theme(self):
        """Apply current theme to all components"""
        theme = self.theme_manager.get_current_theme()
        
        # Configure root window
        self.root.configure(bg=theme['bg'])
        
        # Configure ttk styles
        style = ttk.Style()
        
        # Configure frame styles
        style.configure('Main.TFrame', background=theme['bg'])
        style.configure('Card.TFrame', background=theme['card_bg'], relief='solid', borderwidth=1)
        style.configure('Sidebar.TFrame', background=theme['sidebar_bg'])
        
        # Configure label styles
        style.configure('Main.TLabel', background=theme['bg'], foreground=theme['fg'])
        style.configure('Card.TLabel', background=theme['card_bg'], foreground=theme['fg'])
        style.configure('Title.TLabel', background=theme['bg'], foreground=theme['fg'], font=('Arial', 16, 'bold'))
        style.configure('Subtitle.TLabel', background=theme['bg'], foreground=theme['secondary'], font=('Arial', 12))
        
        # Configure button styles
        style.configure('Main.TButton', 
                       background=theme['primary'], 
                       foreground='white',
                       borderwidth=0,
                       focuscolor='none')
        style.map('Main.TButton',
                 background=[('active', theme['primary_hover']),
                           ('pressed', theme['primary_pressed'])])
        
        style.configure('Secondary.TButton',
                       background=theme['secondary_bg'],
                       foreground=theme['fg'],
                       borderwidth=1,
                       focuscolor='none')
        
        # Configure entry styles
        style.configure('Main.TEntry',
                       fieldbackground=theme['input_bg'],
                       foreground=theme['fg'],
                       borderwidth=1,
                       insertcolor=theme['fg'])
        
        # Configure text widget colors
        text_config = {
            'bg': theme['input_bg'],
            'fg': theme['fg'],
            'insertbackground': theme['fg'],
            'selectbackground': theme['primary'],
            'selectforeground': 'white',
            'borderwidth': 1,
            'relief': 'solid'
        }
        
        # Apply theme to all panels
        for panel in self.panels.values():
            if hasattr(panel, 'apply_theme'):
                panel.apply_theme(theme, text_config)
        
        # Apply theme to sidebar
        if hasattr(self.sidebar, 'apply_theme'):
            self.sidebar.apply_theme(theme)
        
        self.logger.info(f"Applied theme: {self.theme_manager.current_theme}")
    
    def on_closing(self):
        """Handle application closing"""
        try:
            # Save any pending data
            for panel in self.panels.values():
                if hasattr(panel, 'save_data'):
                    panel.save_data()
            
            # Save configuration
            self.config.save()
            
            self.logger.info("Application closed successfully")
            self.root.destroy()
            
        except Exception as e:
            self.logger.error(f"Error during application shutdown: {e}")
            self.root.destroy()
