"""
Dashboard component showing overview and statistics
"""

import tkinter as tk
from tkinter import ttk
from datetime import datetime, date

class Dashboard:
    def __init__(self, parent, database, theme_manager):
        self.parent = parent
        self.db = database
        self.theme_manager = theme_manager
        
        self.create_dashboard()
    
    def create_dashboard(self):
        """Create dashboard layout"""
        # Main dashboard frame
        self.frame = ttk.Frame(self.parent, style='Main.TFrame')
        
        # Create scrollable frame
        canvas = tk.Canvas(self.frame, highlightthickness=0)
        scrollbar = ttk.Scrollbar(self.frame, orient="vertical", command=canvas.yview)
        self.scrollable_frame = ttk.Frame(canvas, style='Main.TFrame')
        
        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Header
        header_frame = ttk.Frame(self.scrollable_frame, style='Main.TFrame')
        header_frame.pack(fill=tk.X, pady=(0, 20))
        
        title_label = ttk.Label(header_frame, text="Dashboard", style='Title.TLabel')
        title_label.pack(side=tk.LEFT)
        
        date_label = ttk.Label(header_frame, text=datetime.now().strftime("%B %d, %Y"), style='Subtitle.TLabel')
        date_label.pack(side=tk.RIGHT)
        
        # Statistics cards
        self.create_stats_section()
        
        # Recent activity
        self.create_recent_activity()
        
        # Quick actions
        self.create_quick_actions()
    
    def create_stats_section(self):
        """Create statistics cards"""
        stats_frame = ttk.Frame(self.scrollable_frame, style='Main.TFrame')
        stats_frame.pack(fill=tk.X, pady=(0, 20))
        
        # Section title
        stats_title = ttk.Label(stats_frame, text="Overview", font=('Arial', 14, 'bold'), style='Main.TLabel')
        stats_title.pack(anchor=tk.W, pady=(0, 10))
        
        # Stats cards container
        cards_frame = ttk.Frame(stats_frame, style='Main.TFrame')
        cards_frame.pack(fill=tk.X)
        
        # Configure grid weights
        for i in range(4):
            cards_frame.columnconfigure(i, weight=1)
        
        # Create stat cards
        self.stat_cards = {}
        stat_items = [
            ('tasks', 'Tasks', '0', 'Completed Today'),
            ('habits', 'Habits', '0', 'Current Streak'),
            ('goals', 'Goals', '0', 'In Progress'),
            ('focus', 'Focus Time', '0m', 'Today')
        ]
        
        for i, (key, title, value, subtitle) in enumerate(stat_items):
            card = self.create_stat_card(cards_frame, title, value, subtitle)
            card.grid(row=0, column=i, padx=5, pady=5, sticky='ew')
            self.stat_cards[key] = card
    
    def create_stat_card(self, parent, title, value, subtitle):
        """Create individual statistics card"""
        card_frame = ttk.Frame(parent, style='Card.TFrame', padding=15)
        
        # Title
        title_label = ttk.Label(card_frame, text=title, font=('Arial', 12, 'bold'), style='Card.TLabel')
        title_label.pack(anchor=tk.W)
        
        # Value
        value_label = ttk.Label(card_frame, text=value, font=('Arial', 24, 'bold'), style='Card.TLabel')
        value_label.pack(anchor=tk.W, pady=(5, 0))
        
        # Subtitle
        subtitle_label = ttk.Label(card_frame, text=subtitle, font=('Arial', 10), style='Card.TLabel')
        subtitle_label.pack(anchor=tk.W)
        
        # Store labels for updates
        card_frame.title_label = title_label
        card_frame.value_label = value_label
        card_frame.subtitle_label = subtitle_label
        
        return card_frame
    
    def create_recent_activity(self):
        """Create recent activity section"""
        activity_frame = ttk.Frame(self.scrollable_frame, style='Main.TFrame')
        activity_frame.pack(fill=tk.X, pady=(0, 20))
        
        # Section title
        activity_title = ttk.Label(activity_frame, text="Recent Activity", font=('Arial', 14, 'bold'), style='Main.TLabel')
        activity_title.pack(anchor=tk.W, pady=(0, 10))
        
        # Activity list
        self.activity_frame = ttk.Frame(activity_frame, style='Card.TFrame', padding=15)
        self.activity_frame.pack(fill=tk.X)
        
        # Activity list will be populated in refresh method
        self.activity_listbox = tk.Listbox(
            self.activity_frame,
            height=6,
            font=('Arial', 10),
            relief=tk.FLAT,
            highlightthickness=0
        )
        self.activity_listbox.pack(fill=tk.X)
    
    def create_quick_actions(self):
        """Create quick actions section"""
        actions_frame = ttk.Frame(self.scrollable_frame, style='Main.TFrame')
        actions_frame.pack(fill=tk.X, pady=(0, 20))
        
        # Section title
        actions_title = ttk.Label(actions_frame, text="Quick Actions", font=('Arial', 14, 'bold'), style='Main.TLabel')
        actions_title.pack(anchor=tk.W, pady=(0, 10))
        
        # Actions buttons
        buttons_frame = ttk.Frame(actions_frame, style='Main.TFrame')
        buttons_frame.pack(fill=tk.X)
        
        # Configure grid
        for i in range(3):
            buttons_frame.columnconfigure(i, weight=1)
        
        # Quick action buttons
        actions = [
            ('Add Task', self.quick_add_task),
            ('Start Focus', self.quick_start_focus),
            ('Add Note', self.quick_add_note)
        ]
        
        for i, (text, command) in enumerate(actions):
            btn = ttk.Button(buttons_frame, text=text, style='Main.TButton', command=command)
            btn.grid(row=0, column=i, padx=5, pady=5, sticky='ew')
    
    def quick_add_task(self):
        """Quick add task dialog"""
        from tkinter import simpledialog
        title = simpledialog.askstring("Add Task", "Enter task title:")
        if title:
            self.db.create_task(title)
            self.refresh()
    
    def quick_start_focus(self):
        """Quick start focus session"""
        # This would typically switch to focus panel and start timer
        pass
    
    def quick_add_note(self):
        """Quick add note dialog"""
        from tkinter import simpledialog
        title = simpledialog.askstring("Add Note", "Enter note title:")
        if title:
            self.db.create_note(title)
            self.refresh()
    
    def refresh(self):
        """Refresh dashboard data"""
        self.update_statistics()
        self.update_recent_activity()
    
    def update_statistics(self):
        """Update statistics cards"""
        try:
            stats = self.db.get_statistics()
            
            # Update task stats
            completed_today = len([t for t in self.db.get_tasks('completed') 
                                 if t['updated_at'].startswith(date.today().isoformat())])
            self.stat_cards['tasks'].value_label.configure(text=str(completed_today))
            
            # Update habit stats
            habits = self.db.get_habits()
            avg_streak = sum(h['streak'] for h in habits) // len(habits) if habits else 0
            self.stat_cards['habits'].value_label.configure(text=str(avg_streak))
            
            # Update goal stats
            active_goals = len([g for g in self.db.get_goals() if g['status'] == 'active'])
            self.stat_cards['goals'].value_label.configure(text=str(active_goals))
            
            # Update focus time
            today_sessions = self.db.get_focus_sessions(date.today().isoformat())
            total_time = sum(s['duration'] for s in today_sessions if s['completed'])
            self.stat_cards['focus'].value_label.configure(text=f"{total_time}m")
            
        except Exception as e:
            print(f"Error updating statistics: {e}")
    
    def update_recent_activity(self):
        """Update recent activity list"""
        try:
            self.activity_listbox.delete(0, tk.END)
            
            # Get recent items from different sources
            recent_tasks = self.db.get_tasks()[:3]
            recent_notes = self.db.get_notes()[:2]
            
            # Add to activity list
            for task in recent_tasks:
                status_icon = "✅" if task['status'] == 'completed' else "📝"
                self.activity_listbox.insert(tk.END, f"{status_icon} Task: {task['title']}")
            
            for note in recent_notes:
                self.activity_listbox.insert(tk.END, f"📝 Note: {note['title']}")
            
            if self.activity_listbox.size() == 0:
                self.activity_listbox.insert(tk.END, "No recent activity")
                
        except Exception as e:
            print(f"Error updating recent activity: {e}")
    
    def show(self):
        """Show dashboard"""
        self.frame.pack(fill=tk.BOTH, expand=True)
    
    def hide(self):
        """Hide dashboard"""
        self.frame.pack_forget()
    
    def apply_theme(self, theme, text_config):
        """Apply theme to dashboard"""
        # Update activity listbox
        self.activity_listbox.configure(
            bg=theme['input_bg'],
            fg=theme['fg'],
            selectbackground=theme['primary'],
            selectforeground='white'
        )
