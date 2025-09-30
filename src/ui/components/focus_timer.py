"""
Focus timer component with Pomodoro technique
"""

import tkinter as tk
from tkinter import ttk, messagebox
import threading
import time
from datetime import datetime

class FocusTimerPanel:
    def __init__(self, parent, database, theme_manager):
        self.parent = parent
        self.db = database
        self.theme_manager = theme_manager
        
        # Timer state
        self.is_running = False
        self.is_paused = False
        self.current_session = None
        self.remaining_time = 0
        self.timer_thread = None
        
        # Timer settings
        self.work_duration = 25 * 60  # 25 minutes in seconds
        self.short_break = 5 * 60    # 5 minutes
        self.long_break = 15 * 60    # 15 minutes
        self.session_count = 0
        
        self.create_timer_panel()
    
    def create_timer_panel(self):
        """Create focus timer interface"""
        # Main frame
        self.frame = ttk.Frame(self.parent, style='Main.TFrame')
        
        # Header
        header_frame = ttk.Frame(self.frame, style='Main.TFrame')
        header_frame.pack(fill=tk.X, pady=(0, 30))
        
        title_label = ttk.Label(header_frame, text="Focus Timer", style='Title.TLabel')
        title_label.pack()
        
        # Timer display
        self.create_timer_display()
        
        # Controls
        self.create_controls()
        
        # Settings
        self.create_settings()
        
        # Session history
        self.create_session_history()
    
    def create_timer_display(self):
        """Create main timer display"""
        display_frame = ttk.Frame(self.frame, style='Card.TFrame', padding=30)
        display_frame.pack(pady=20)
        
        # Session type label
        self.session_type_label = ttk.Label(display_frame, text="Ready to Focus", 
                                          font=('Arial', 16), style='Card.TLabel')
        self.session_type_label.pack(pady=(0, 20))
        
        # Timer display
        self.time_label = ttk.Label(display_frame, text="25:00", 
                                  font=('Arial', 48, 'bold'), style='Card.TLabel')
        self.time_label.pack(pady=20)
        
        # Progress bar
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(display_frame, length=300, mode='determinate',
                                          variable=self.progress_var)
        self.progress_bar.pack(pady=(0, 20))
        
        # Session counter
        self.session_counter_label = ttk.Label(display_frame, text="Sessions completed: 0",
                                             font=('Arial', 12), style='Card.TLabel')
        self.session_counter_label.pack()
    
    def create_controls(self):
        """Create timer control buttons"""
        controls_frame = ttk.Frame(self.frame, style='Main.TFrame')
        controls_frame.pack(pady=20)
        
        # Start/Pause button
        self.start_pause_btn = ttk.Button(controls_frame, text="Start", 
                                        style='Main.TButton', command=self.toggle_timer)
        self.start_pause_btn.pack(side=tk.LEFT, padx=5)
        
        # Stop button
        self.stop_btn = ttk.Button(controls_frame, text="Stop", 
                                 style='Secondary.TButton', command=self.stop_timer)
        self.stop_btn.pack(side=tk.LEFT, padx=5)
        
        # Reset button
        reset_btn = ttk.Button(controls_frame, text="Reset", 
                             style='Secondary.TButton', command=self.reset_timer)
        reset_btn.pack(side=tk.LEFT, padx=5)
    
    def create_settings(self):
        """Create timer settings"""
        settings_frame = ttk.Frame(self.frame, style='Card.TFrame', padding=15)
        settings_frame.pack(fill=tk.X, pady=20)
        
        ttk.Label(settings_frame, text="Timer Settings", 
                font=('Arial', 14, 'bold'), style='Card.TLabel').pack(anchor=tk.W, pady=(0, 10))
        
        # Settings grid
        grid_frame = ttk.Frame(settings_frame, style='Card.TFrame')
        grid_frame.pack(fill=tk.X)
        
        # Work duration
        ttk.Label(grid_frame, text="Work Duration (minutes):", style='Card.TLabel').grid(row=0, column=0, sticky=tk.W, pady=5)
        self.work_duration_var = tk.IntVar(value=25)
        work_spinbox = tk.Spinbox(grid_frame, from_=1, to=60, textvariable=self.work_duration_var, 
                                width=10, command=self.update_work_duration)
        work_spinbox.grid(row=0, column=1, padx=10, pady=5)
        
        # Short break
        ttk.Label(grid_frame, text="Short Break (minutes):", style='Card.TLabel').grid(row=1, column=0, sticky=tk.W, pady=5)
        self.short_break_var = tk.IntVar(value=5)
        short_spinbox = tk.Spinbox(grid_frame, from_=1, to=30, textvariable=self.short_break_var,
                                 width=10, command=self.update_short_break)
        short_spinbox.grid(row=1, column=1, padx=10, pady=5)
        
        # Long break
        ttk.Label(grid_frame, text="Long Break (minutes):", style='Card.TLabel').grid(row=2, column=0, sticky=tk.W, pady=5)
        self.long_break_var = tk.IntVar(value=15)
        long_spinbox = tk.Spinbox(grid_frame, from_=1, to=60, textvariable=self.long_break_var,
                                width=10, command=self.update_long_break)
        long_spinbox.grid(row=2, column=1, padx=10, pady=5)
    
    def create_session_history(self):
        """Create session history display"""
        history_frame = ttk.Frame(self.frame, style='Card.TFrame', padding=15)
        history_frame.pack(fill=tk.BOTH, expand=True, pady=(20, 0))
        
        ttk.Label(history_frame, text="Today's Sessions", 
                font=('Arial', 14, 'bold'), style='Card.TLabel').pack(anchor=tk.W, pady=(0, 10))
        
        # History listbox
        self.history_listbox = tk.Listbox(history_frame, height=6, font=('Arial', 10))
        history_scrollbar = ttk.Scrollbar(history_frame, orient=tk.VERTICAL, command=self.history_listbox.yview)
        self.history_listbox.configure(yscrollcommand=history_scrollbar.set)
        
        self.history_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        history_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
    
    def toggle_timer(self):
        """Start or pause timer"""
        if not self.is_running:
            self.start_timer()
        else:
            if self.is_paused:
                self.resume_timer()
            else:
                self.pause_timer()
    
    def start_timer(self):
        """Start timer"""
        if self.remaining_time == 0:
            self.remaining_time = self.work_duration
            self.session_type_label.configure(text="Focus Session")
        
        self.is_running = True
        self.is_paused = False
        self.start_pause_btn.configure(text="Pause")
        
        # Start timer thread
        self.timer_thread = threading.Thread(target=self.run_timer, daemon=True)
        self.timer_thread.start()
        
        # Create session record
        try:
            session_id = self.db.create_focus_session(
                duration=self.work_duration // 60,
                session_type="pomodoro",
                completed=False
            )
            self.current_session = session_id
        except Exception as e:
            print(f"Error creating session: {e}")
    
    def pause_timer(self):
        """Pause timer"""
        self.is_paused = True
        self.start_pause_btn.configure(text="Resume")
    
    def resume_timer(self):
        """Resume timer"""
        self.is_paused = False
        self.start_pause_btn.configure(text="Pause")
    
    def stop_timer(self):
        """Stop timer"""
        self.is_running = False
        self.is_paused = False
        self.start_pause_btn.configure(text="Start")
        self.session_type_label.configure(text="Timer Stopped")
        
        # Reset display
        self.remaining_time = 0
        self.update_display()
    
    def reset_timer(self):
        """Reset timer to initial state"""
        self.stop_timer()
        self.remaining_time = self.work_duration
        self.session_type_label.configure(text="Ready to Focus")
        self.update_display()
    
    def run_timer(self):
        """Timer thread function"""
        while self.is_running and self.remaining_time > 0:
            if not self.is_paused:
                self.remaining_time -= 1
                self.parent.after(0, self.update_display)
            time.sleep(1)
        
        if self.is_running and self.remaining_time <= 0:
            self.parent.after(0, self.timer_finished)
    
    def update_display(self):
        """Update timer display"""
        minutes = self.remaining_time // 60
        seconds = self.remaining_time % 60
        time_text = f"{minutes:02d}:{seconds:02d}"
        self.time_label.configure(text=time_text)
        
        # Update progress bar
        if self.work_duration > 0:
            progress = ((self.work_duration - self.remaining_time) / self.work_duration) * 100
            self.progress_var.set(progress)
    
    def timer_finished(self):
        """Handle timer completion"""
        self.is_running = False
        self.start_pause_btn.configure(text="Start")
        
        # Mark session as completed
        if self.current_session:
            try:
                # Note: You'll need to add update_focus_session method to database
                # self.db.update_focus_session(self.current_session, completed=True)
                pass
            except Exception as e:
                print(f"Error updating session: {e}")
        
        # Increment session count
        self.session_count += 1
        self.session_counter_label.configure(text=f"Sessions completed: {self.session_count}")
        
        # Show completion message
        messagebox.showinfo("Timer Complete", "Focus session completed! Great work! 🎉")
        
        # Determine next session type
        if self.session_count % 4 == 0:
            # Long break after 4 sessions
            self.remaining_time = self.long_break
            self.session_type_label.configure(text="Long Break Time")
        else:
            # Short break
            self.remaining_time = self.short_break
            self.session_type_label.configure(text="Short Break Time")
        
        self.update_display()
        self.refresh_history()
    
    def update_work_duration(self):
        """Update work duration setting"""
        self.work_duration = self.work_duration_var.get() * 60
        if not self.is_running:
            self.remaining_time = self.work_duration
            self.update_display()
    
    def update_short_break(self):
        """Update short break setting"""
        self.short_break = self.short_break_var.get() * 60
    
    def update_long_break(self):
        """Update long break setting"""
        self.long_break = self.long_break_var.get() * 60
    
    def refresh_history(self):
        """Refresh session history"""
        try:
            # Clear history listbox
            self.history_listbox.delete(0, tk.END)
            
            # Get today's sessions
            from datetime import date
            today_sessions = self.db.get_focus_sessions(date.today().isoformat())
            
            for session in today_sessions:
                status = "✅ Completed" if session['completed'] else "⏸️ Incomplete"
                duration = session['duration']
                session_type = session['type'].title()
                
                display_text = f"{session_type} - {duration}min - {status}"
                self.history_listbox.insert(tk.END, display_text)
            
            if not today_sessions:
                self.history_listbox.insert(tk.END, "No sessions today")
                
        except Exception as e:
            print(f"Error refreshing history: {e}")
    
    def refresh(self):
        """Refresh timer panel"""
        self.refresh_history()
    
    def show(self):
        """Show timer panel"""
        self.frame.pack(fill=tk.BOTH, expand=True)
    
    def hide(self):
        """Hide timer panel"""
        self.frame.pack_forget()
    
    def apply_theme(self, theme, text_config):
        """Apply theme to timer panel"""
        # Update history listbox
        self.history_listbox.configure(
            bg=theme['input_bg'],
            fg=theme['fg'],
            selectbackground=theme['primary'],
            selectforeground='white'
        )
