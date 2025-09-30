"""
Settings component
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import json
import os

class SettingsPanel:
    def __init__(self, parent, database, config, theme_manager, apply_theme_callback):
        self.parent = parent
        self.db = database
        self.config = config
        self.theme_manager = theme_manager
        self.apply_theme_callback = apply_theme_callback
        
        self.create_settings_panel()
    
    def create_settings_panel(self):
        """Create settings interface"""
        # Main frame
        self.frame = ttk.Frame(self.parent, style='Main.TFrame')
        
        # Header
        header_frame = ttk.Frame(self.frame, style='Main.TFrame')
        header_frame.pack(fill=tk.X, pady=(0, 20))
        
        title_label = ttk.Label(header_frame, text="Settings", style='Title.TLabel')
        title_label.pack(side=tk.LEFT)
        
        # Create notebook for different setting categories
        self.notebook = ttk.Notebook(self.frame)
        self.notebook.pack(fill=tk.BOTH, expand=True)
        
        # Create setting tabs
        self.create_appearance_tab()
        self.create_general_tab()
        self.create_data_tab()
        self.create_about_tab()
    
    def create_appearance_tab(self):
        """Create appearance settings tab"""
        appearance_frame = ttk.Frame(self.notebook, style='Main.TFrame', padding=20)
        self.notebook.add(appearance_frame, text="Appearance")
        
        # Theme selection
        theme_section = ttk.Frame(appearance_frame, style='Card.TFrame', padding=15)
        theme_section.pack(fill=tk.X, pady=(0, 20))
        
        ttk.Label(theme_section, text="Theme", font=('Arial', 14, 'bold'), style='Card.TLabel').pack(anchor=tk.W, pady=(0, 10))
        
        self.theme_var = tk.StringVar(value=self.theme_manager.current_theme)
        
        # Theme options
        themes = [
            ('purple', '🎨 Purple Theme', 'Light theme with purple accents'),
            ('dark', '🌙 Black Theme', 'Dark theme with black background')
        ]
        
        for value, text, description in themes:
            theme_frame = ttk.Frame(theme_section, style='Card.TFrame')
            theme_frame.pack(fill=tk.X, pady=2)
            
            rb = ttk.Radiobutton(theme_frame, text=text, variable=self.theme_var, 
                               value=value, command=self.change_theme)
            rb.pack(side=tk.LEFT)
            
            desc_label = ttk.Label(theme_frame, text=description, 
                                 font=('Arial', 9), style='Card.TLabel')
            desc_label.pack(side=tk.LEFT, padx=(10, 0))
        
        # Font settings
        font_section = ttk.Frame(appearance_frame, style='Card.TFrame', padding=15)
        font_section.pack(fill=tk.X, pady=(0, 20))
        
        ttk.Label(font_section, text="Font Settings", font=('Arial', 14, 'bold'), style='Card.TLabel').pack(anchor=tk.W, pady=(0, 10))
        
        # Font size
        font_frame = ttk.Frame(font_section, style='Card.TFrame')
        font_frame.pack(fill=tk.X, pady=5)
        
        ttk.Label(font_frame, text="Font Size:", style='Card.TLabel').pack(side=tk.LEFT)
        
        self.font_size_var = tk.IntVar(value=self.config.get('font_size', 11))
        font_size_spinbox = tk.Spinbox(font_frame, from_=8, to=18, textvariable=self.font_size_var,
                                     width=5, command=self.update_font_size)
        font_size_spinbox.pack(side=tk.LEFT, padx=10)
    
    def create_general_tab(self):
        """Create general settings tab"""
        general_frame = ttk.Frame(self.notebook, style='Main.TFrame', padding=20)
        self.notebook.add(general_frame, text="General")
        
        # Auto-save settings
        autosave_section = ttk.Frame(general_frame, style='Card.TFrame', padding=15)
        autosave_section.pack(fill=tk.X, pady=(0, 20))
        
        ttk.Label(autosave_section, text="Auto-save", font=('Arial', 14, 'bold'), style='Card.TLabel').pack(anchor=tk.W, pady=(0, 10))
        
        self.autosave_var = tk.BooleanVar(value=self.config.get('autosave_enabled', True))
        autosave_cb = ttk.Checkbutton(autosave_section, text="Enable auto-save", 
                                    variable=self.autosave_var, command=self.update_autosave)
        autosave_cb.pack(anchor=tk.W)
        
        # Auto-save interval
        interval_frame = ttk.Frame(autosave_section, style='Card.TFrame')
        interval_frame.pack(fill=tk.X, pady=(10, 0))
        
        ttk.Label(interval_frame, text="Auto-save interval (seconds):", style='Card.TLabel').pack(side=tk.LEFT)
        
        self.autosave_interval_var = tk.IntVar(value=self.config.get('autosave_interval', 30))
        interval_spinbox = tk.Spinbox(interval_frame, from_=10, to=300, textvariable=self.autosave_interval_var,
                                    width=5, command=self.update_autosave_interval)
        interval_spinbox.pack(side=tk.LEFT, padx=10)
        
        # Notifications
        notifications_section = ttk.Frame(general_frame, style='Card.TFrame', padding=15)
        notifications_section.pack(fill=tk.X, pady=(0, 20))
        
        ttk.Label(notifications_section, text="Notifications", font=('Arial', 14, 'bold'), style='Card.TLabel').pack(anchor=tk.W, pady=(0, 10))
        
        self.notifications_var = tk.BooleanVar(value=self.config.get('notifications_enabled', True))
        notifications_cb = ttk.Checkbutton(notifications_section, text="Enable notifications", 
                                         variable=self.notifications_var, command=self.update_notifications)
        notifications_cb.pack(anchor=tk.W)
        
        # Startup settings
        startup_section = ttk.Frame(general_frame, style='Card.TFrame', padding=15)
        startup_section.pack(fill=tk.X)
        
        ttk.Label(startup_section, text="Startup", font=('Arial', 14, 'bold'), style='Card.TLabel').pack(anchor=tk.W, pady=(0, 10))
        
        self.start_minimized_var = tk.BooleanVar(value=self.config.get('start_minimized', False))
        minimized_cb = ttk.Checkbutton(startup_section, text="Start minimized", 
                                     variable=self.start_minimized_var, command=self.update_start_minimized)
        minimized_cb.pack(anchor=tk.W)
    
    def create_data_tab(self):
        """Create data management tab"""
        data_frame = ttk.Frame(self.notebook, style='Main.TFrame', padding=20)
        self.notebook.add(data_frame, text="Data")
        
        # Backup section
        backup_section = ttk.Frame(data_frame, style='Card.TFrame', padding=15)
        backup_section.pack(fill=tk.X, pady=(0, 20))
        
        ttk.Label(backup_section, text="Backup & Restore", font=('Arial', 14, 'bold'), style='Card.TLabel').pack(anchor=tk.W, pady=(0, 10))
        
        # Backup buttons
        backup_buttons_frame = ttk.Frame(backup_section, style='Card.TFrame')
        backup_buttons_frame.pack(fill=tk.X, pady=10)
        
        backup_btn = ttk.Button(backup_buttons_frame, text="Create Backup", 
                              style='Main.TButton', command=self.create_backup)
        backup_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        restore_btn = ttk.Button(backup_buttons_frame, text="Restore Backup", 
                               style='Secondary.TButton', command=self.restore_backup)
        restore_btn.pack(side=tk.LEFT)
        
        # Export section
        export_section = ttk.Frame(data_frame, style='Card.TFrame', padding=15)
        export_section.pack(fill=tk.X, pady=(0, 20))
        
        ttk.Label(export_section, text="Export Data", font=('Arial', 14, 'bold'), style='Card.TLabel').pack(anchor=tk.W, pady=(0, 10))
        
        export_buttons_frame = ttk.Frame(export_section, style='Card.TFrame')
        export_buttons_frame.pack(fill=tk.X, pady=10)
        
        export_json_btn = ttk.Button(export_buttons_frame, text="Export as JSON", 
                                   style='Main.TButton', command=self.export_json)
        export_json_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        export_csv_btn = ttk.Button(export_buttons_frame, text="Export as CSV", 
                                  style='Secondary.TButton', command=self.export_csv)
        export_csv_btn.pack(side=tk.LEFT)
        
        # Clear data section
        clear_section = ttk.Frame(data_frame, style='Card.TFrame', padding=15)
        clear_section.pack(fill=tk.X)
        
        ttk.Label(clear_section, text="Clear Data", font=('Arial', 14, 'bold'), style='Card.TLabel').pack(anchor=tk.W, pady=(0, 10))
        
        ttk.Label(clear_section, text="⚠️ Warning: This action cannot be undone!", 
                font=('Arial', 10), style='Card.TLabel').pack(anchor=tk.W, pady=(0, 10))
        
        clear_btn = ttk.Button(clear_section, text="Clear All Data", 
                             style='Secondary.TButton', command=self.clear_all_data)
        clear_btn.pack(anchor=tk.W)
    
    def create_about_tab(self):
        """Create about tab"""
        about_frame = ttk.Frame(self.notebook, style='Main.TFrame', padding=20)
        self.notebook.add(about_frame, text="About")
        
        # App info
        info_section = ttk.Frame(about_frame, style='Card.TFrame', padding=20)
        info_section.pack(fill=tk.X, pady=(0, 20))
        
        # App title
        title_label = ttk.Label(info_section, text="AURA Focus", 
                              font=('Arial', 24, 'bold'), style='Card.TLabel')
        title_label.pack(pady=(0, 10))
        
        # Version
        version_label = ttk.Label(info_section, text="Version 1.0.0", 
                                font=('Arial', 12), style='Card.TLabel')
        version_label.pack(pady=(0, 10))
        
        # Description
        desc_text = """Advanced Productivity Suite

A comprehensive productivity application featuring:
• Task Management
• Habit Tracking  
• Goal Setting
• Focus Timer (Pomodoro)
• Rich Text Journal
• Notes Management
• Calendar Integration
• Analytics Dashboard

Built with Python and tkinter for cross-platform compatibility."""
        
        desc_label = ttk.Label(info_section, text=desc_text, 
                             style='Card.TLabel', justify=tk.LEFT)
        desc_label.pack(pady=(0, 20))
        
        # Statistics
        stats_section = ttk.Frame(about_frame, style='Card.TFrame', padding=15)
        stats_section.pack(fill=tk.X)
        
        ttk.Label(stats_section, text="Statistics", font=('Arial', 14, 'bold'), style='Card.TLabel').pack(anchor=tk.W, pady=(0, 10))
        
        # Get and display statistics
        self.update_statistics(stats_section)
    
    def update_statistics(self, parent):
        """Update statistics display"""
        try:
            stats = self.db.get_statistics()
            
            stats_text = f"""Database Statistics:
• Total Tasks: {stats.get('total_tasks', 0)}
• Completed Tasks: {stats.get('completed_tasks', 0)}
• Total Habits: {stats.get('total_habits', 0)}
• Average Habit Streak: {stats.get('avg_habit_streak', 0)} days
• Total Goals: {stats.get('total_goals', 0)}
• Completed Goals: {stats.get('completed_goals', 0)}
• Focus Sessions: {stats.get('completed_sessions', 0)}
• Total Focus Time: {stats.get('total_focus_time', 0)} minutes
• Total Notes: {stats.get('total_notes', 0)}
• Journal Entries: {stats.get('total_journal_entries', 0)}"""
            
            stats_label = ttk.Label(parent, text=stats_text, 
                                  style='Card.TLabel', justify=tk.LEFT)
            stats_label.pack(anchor=tk.W)
            
        except Exception as e:
            error_label = ttk.Label(parent, text=f"Error loading statistics: {e}", 
                                  style='Card.TLabel')
            error_label.pack(anchor=tk.W)
    
    def change_theme(self):
        """Change application theme"""
        new_theme = self.theme_var.get()
        self.theme_manager.set_theme(new_theme)
        self.config.set('theme', new_theme)
        self.apply_theme_callback()
    
    def update_font_size(self):
        """Update font size setting"""
        font_size = self.font_size_var.get()
        self.config.set('font_size', font_size)
        # You could implement font size changes here
    
    def update_autosave(self):
        """Update auto-save setting"""
        enabled = self.autosave_var.get()
        self.config.set('autosave_enabled', enabled)
    
    def update_autosave_interval(self):
        """Update auto-save interval"""
        interval = self.autosave_interval_var.get()
        self.config.set('autosave_interval', interval)
    
    def update_notifications(self):
        """Update notifications setting"""
        enabled = self.notifications_var.get()
        self.config.set('notifications_enabled', enabled)
    
    def update_start_minimized(self):
        """Update start minimized setting"""
        minimized = self.start_minimized_var.get()
        self.config.set('start_minimized', minimized)
    
    def create_backup(self):
        """Create data backup"""
        try:
            filename = filedialog.asksaveasfilename(
                title="Save Backup",
                defaultextension=".json",
                filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
            )
            
            if filename:
                # Get all data from database
                backup_data = {
                    'tasks': self.db.get_tasks(),
                    'habits': self.db.get_habits(),
                    'goals': self.db.get_goals(),
                    'notes': self.db.get_notes(),
                    'journal_entries': self.db.get_journal_entries(),
                    'focus_sessions': self.db.get_focus_sessions(),
                    'backup_date': datetime.now().isoformat()
                }
                
                with open(filename, 'w') as f:
                    json.dump(backup_data, f, indent=2, default=str)
                
                messagebox.showinfo("Success", f"Backup created successfully!\nSaved to: {filename}")
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to create backup: {e}")
    
    def restore_backup(self):
        """Restore data from backup"""
        if not messagebox.askyesno("Confirm", "This will replace all current data. Are you sure?"):
            return
        
        try:
            filename = filedialog.askopenfilename(
                title="Select Backup File",
                filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
            )
            
            if filename:
                with open(filename, 'r') as f:
                    backup_data = json.load(f)
                
                # Note: You would need to implement restore methods in the database
                # This is a simplified example
                messagebox.showinfo("Info", "Restore functionality would be implemented here")
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to restore backup: {e}")
    
    def export_json(self):
        """Export data as JSON"""
        try:
            filename = filedialog.asksaveasfilename(
                title="Export as JSON",
                defaultextension=".json",
                filetypes=[("JSON files", "*.json"), ("All files", "*.*")]
            )
            
            if filename:
                export_data = {
                    'tasks': self.db.get_tasks(),
                    'habits': self.db.get_habits(),
                    'goals': self.db.get_goals(),
                    'notes': self.db.get_notes(),
                    'journal_entries': self.db.get_journal_entries(),
                    'export_date': datetime.now().isoformat()
                }
                
                with open(filename, 'w') as f:
                    json.dump(export_data, f, indent=2, default=str)
                
                messagebox.showinfo("Success", f"Data exported successfully!\nSaved to: {filename}")
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to export data: {e}")
    
    def export_csv(self):
        """Export data as CSV"""
        try:
            import csv
            
            filename = filedialog.asksaveasfilename(
                title="Export as CSV",
                defaultextension=".csv",
                filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
            )
            
            if filename:
                # Export tasks as example
                tasks = self.db.get_tasks()
                
                with open(filename, 'w', newline='') as f:
                    if tasks:
                        writer = csv.DictWriter(f, fieldnames=tasks[0].keys())
                        writer.writeheader()
                        writer.writerows(tasks)
                
                messagebox.showinfo("Success", f"Tasks exported successfully!\nSaved to: {filename}")
                
        except Exception as e:
            messagebox.showerror("Error", f"Failed to export CSV: {e}")
    
    def clear_all_data(self):
        """Clear all application data"""
        if not messagebox.askyesno("Confirm", "This will permanently delete ALL data. Are you sure?"):
            return
        
        if not messagebox.askyesno("Final Confirmation", "This action cannot be undone. Continue?"):
            return
        
        try:
            # Note: You would need to implement clear methods in the database
            messagebox.showinfo("Info", "Clear data functionality would be implemented here")
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to clear data: {e}")
    
    def refresh(self):
        """Refresh settings panel"""
        pass
    
    def show(self):
        """Show settings panel"""
        self.frame.pack(fill=tk.BOTH, expand=True)
    
    def hide(self):
        """Hide settings panel"""
        self.frame.pack_forget()
    
    def apply_theme(self, theme, text_config):
        """Apply theme to settings panel"""
        pass
