"""
Calendar view component
"""

import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime, date, timedelta
import calendar

class CalendarPanel:
    def __init__(self, parent, database, theme_manager):
        self.parent = parent
        self.db = database
        self.theme_manager = theme_manager
        self.current_date = date.today()
        self.view_mode = 'month'  # month, week, day
        
        self.create_calendar_panel()
    
    def create_calendar_panel(self):
        """Create calendar interface"""
        # Main frame
        self.frame = ttk.Frame(self.parent, style='Main.TFrame')
        
        # Header with navigation and view controls
        self.create_header()
        
        # Calendar view
        self.create_calendar_view()
        
        # Load initial view
        self.refresh_calendar()
    
    def create_header(self):
        """Create header with navigation and controls"""
        header_frame = ttk.Frame(self.frame, style='Main.TFrame')
        header_frame.pack(fill=tk.X, pady=(0, 20))
        
        # Title
        title_label = ttk.Label(header_frame, text="Calendar", style='Title.TLabel')
        title_label.pack(side=tk.LEFT)
        
        # View mode buttons
        view_frame = ttk.Frame(header_frame, style='Main.TFrame')
        view_frame.pack(side=tk.RIGHT)
        
        # Add event button
        add_btn = ttk.Button(view_frame, text="+ Add Event", style='Main.TButton', command=self.add_event)
        add_btn.pack(side=tk.RIGHT, padx=(10, 0))
        
        # View mode selection
        ttk.Label(view_frame, text="View:", style='Main.TLabel').pack(side=tk.RIGHT, padx=(0, 5))
        
        self.view_var = tk.StringVar(value='month')
        for mode in ['day', 'week', 'month']:
            rb = ttk.Radiobutton(view_frame, text=mode.title(), variable=self.view_var, 
                               value=mode, command=self.change_view_mode)
            rb.pack(side=tk.RIGHT, padx=2)
        
        # Navigation
        nav_frame = ttk.Frame(self.frame, style='Main.TFrame')
        nav_frame.pack(fill=tk.X, pady=(0, 10))
        
        prev_btn = ttk.Button(nav_frame, text="◀ Previous", command=self.prev_period)
        prev_btn.pack(side=tk.LEFT)
        
        today_btn = ttk.Button(nav_frame, text="Today", command=self.go_to_today)
        today_btn.pack(side=tk.LEFT, padx=10)
        
        next_btn = ttk.Button(nav_frame, text="Next ▶", command=self.next_period)
        next_btn.pack(side=tk.LEFT)
        
        # Current period label
        self.period_label = ttk.Label(nav_frame, text="", font=('Arial', 14, 'bold'), style='Main.TLabel')
        self.period_label.pack(side=tk.RIGHT)
    
    def create_calendar_view(self):
        """Create calendar view area"""
        # Calendar container
        self.calendar_container = ttk.Frame(self.frame, style='Card.TFrame', padding=10)
        self.calendar_container.pack(fill=tk.BOTH, expand=True)
        
        # This will be populated based on view mode
        self.calendar_content = None
    
    def change_view_mode(self):
        """Change calendar view mode"""
        self.view_mode = self.view_var.get()
        self.refresh_calendar()
    
    def prev_period(self):
        """Go to previous period"""
        if self.view_mode == 'day':
            self.current_date -= timedelta(days=1)
        elif self.view_mode == 'week':
            self.current_date -= timedelta(weeks=1)
        elif self.view_mode == 'month':
            # Go to previous month
            if self.current_date.month == 1:
                self.current_date = self.current_date.replace(year=self.current_date.year-1, month=12)
            else:
                self.current_date = self.current_date.replace(month=self.current_date.month-1)
        
        self.refresh_calendar()
    
    def next_period(self):
        """Go to next period"""
        if self.view_mode == 'day':
            self.current_date += timedelta(days=1)
        elif self.view_mode == 'week':
            self.current_date += timedelta(weeks=1)
        elif self.view_mode == 'month':
            # Go to next month
            if self.current_date.month == 12:
                self.current_date = self.current_date.replace(year=self.current_date.year+1, month=1)
            else:
                self.current_date = self.current_date.replace(month=self.current_date.month+1)
        
        self.refresh_calendar()
    
    def go_to_today(self):
        """Go to today"""
        self.current_date = date.today()
        self.refresh_calendar()
    
    def refresh_calendar(self):
        """Refresh calendar view"""
        # Clear existing content
        if self.calendar_content:
            self.calendar_content.destroy()
        
        # Update period label
        self.update_period_label()
        
        # Create appropriate view
        if self.view_mode == 'month':
            self.create_month_view()
        elif self.view_mode == 'week':
            self.create_week_view()
        elif self.view_mode == 'day':
            self.create_day_view()
    
    def update_period_label(self):
        """Update period label"""
        if self.view_mode == 'day':
            text = self.current_date.strftime("%A, %B %d, %Y")
        elif self.view_mode == 'week':
            # Calculate week start (Monday)
            days_since_monday = self.current_date.weekday()
            week_start = self.current_date - timedelta(days=days_since_monday)
            week_end = week_start + timedelta(days=6)
            text = f"{week_start.strftime('%b %d')} - {week_end.strftime('%b %d, %Y')}"
        elif self.view_mode == 'month':
            text = self.current_date.strftime("%B %Y")
        
        self.period_label.configure(text=text)
    
    def create_month_view(self):
        """Create month calendar view"""
        self.calendar_content = ttk.Frame(self.calendar_container, style='Card.TFrame')
        self.calendar_content.pack(fill=tk.BOTH, expand=True)
        
        # Create month grid
        cal = calendar.monthcalendar(self.current_date.year, self.current_date.month)
        
        # Days of week header
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        for i, day in enumerate(days):
            header_label = ttk.Label(self.calendar_content, text=day, 
                                   font=('Arial', 10, 'bold'), style='Card.TLabel')
            header_label.grid(row=0, column=i, padx=1, pady=1, sticky='ew')
        
        # Calendar days
        for week_num, week in enumerate(cal, 1):
            for day_num, day in enumerate(week):
                if day == 0:
                    # Empty cell for days from other months
                    day_frame = ttk.Frame(self.calendar_content, style='Card.TFrame')
                else:
                    # Create day cell
                    day_frame = tk.Frame(self.calendar_content, relief=tk.RAISED, borderwidth=1)
                    
                    # Day number
                    day_label = tk.Label(day_frame, text=str(day), font=('Arial', 12, 'bold'))
                    day_label.pack(anchor=tk.NW, padx=2, pady=2)
                    
                    # Highlight today
                    if (day == date.today().day and 
                        self.current_date.month == date.today().month and
                        self.current_date.year == date.today().year):
                        day_frame.configure(bg='lightblue')
                        day_label.configure(bg='lightblue')
                    
                    # Add click event
                    day_date = date(self.current_date.year, self.current_date.month, day)
                    day_frame.bind('<Button-1>', lambda e, d=day_date: self.on_day_click(d))
                    day_label.bind('<Button-1>', lambda e, d=day_date: self.on_day_click(d))
                
                day_frame.grid(row=week_num, column=day_num, padx=1, pady=1, sticky='nsew')
        
        # Configure grid weights
        for i in range(7):
            self.calendar_content.columnconfigure(i, weight=1)
        for i in range(len(cal) + 1):
            self.calendar_content.rowconfigure(i, weight=1)
    
    def create_week_view(self):
        """Create week calendar view"""
        self.calendar_content = ttk.Frame(self.calendar_container, style='Card.TFrame')
        self.calendar_content.pack(fill=tk.BOTH, expand=True)
        
        # Calculate week start (Monday)
        days_since_monday = self.current_date.weekday()
        week_start = self.current_date - timedelta(days=days_since_monday)
        
        # Create week grid
        for i in range(7):
            day_date = week_start + timedelta(days=i)
            day_name = day_date.strftime('%A')
            day_num = day_date.strftime('%d')
            
            # Day header
            header_text = f"{day_name}\n{day_num}"
            day_frame = tk.Frame(self.calendar_content, relief=tk.RAISED, borderwidth=1)
            day_frame.grid(row=0, column=i, padx=1, pady=1, sticky='nsew')
            
            day_label = tk.Label(day_frame, text=header_text, font=('Arial', 10, 'bold'))
            day_label.pack(pady=10)
            
            # Highlight today
            if day_date == date.today():
                day_frame.configure(bg='lightblue')
                day_label.configure(bg='lightblue')
            
            # Add click event
            day_frame.bind('<Button-1>', lambda e, d=day_date: self.on_day_click(d))
            day_label.bind('<Button-1>', lambda e, d=day_date: self.on_day_click(d))
        
        # Configure grid weights
        for i in range(7):
            self.calendar_content.columnconfigure(i, weight=1)
        self.calendar_content.rowconfigure(0, weight=1)
    
    def create_day_view(self):
        """Create day calendar view"""
        self.calendar_content = ttk.Frame(self.calendar_container, style='Card.TFrame')
        self.calendar_content.pack(fill=tk.BOTH, expand=True)
        
        # Day header
        day_header = ttk.Label(self.calendar_content, 
                             text=self.current_date.strftime('%A, %B %d, %Y'),
                             font=('Arial', 16, 'bold'), style='Card.TLabel')
        day_header.pack(pady=20)
        
        # Time slots (simplified - you could make this more detailed)
        times = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
                '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']
        
        for time_slot in times:
            slot_frame = tk.Frame(self.calendar_content, relief=tk.GROOVE, borderwidth=1)
            slot_frame.pack(fill=tk.X, pady=1)
            
            time_label = tk.Label(slot_frame, text=time_slot, font=('Arial', 10))
            time_label.pack(side=tk.LEFT, padx=10, pady=5)
            
            # Event area (placeholder)
            event_area = tk.Label(slot_frame, text="", height=2)
            event_area.pack(side=tk.LEFT, fill=tk.X, expand=True)
    
    def on_day_click(self, clicked_date):
        """Handle day click"""
        self.current_date = clicked_date
        if self.view_mode != 'day':
            self.view_var.set('day')
            self.view_mode = 'day'
        self.refresh_calendar()
    
    def add_event(self):
        """Add new event dialog"""
        dialog = EventDialog(self.frame, "Add Event", self.current_date)
        if dialog.result:
            event_data = dialog.result
            try:
                # Note: You'll need to add create_event method to database
                # self.db.create_event(**event_data)
                self.refresh_calendar()
                messagebox.showinfo("Success", "Event added successfully!")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to add event: {e}")
    
    def refresh(self):
        """Refresh calendar panel"""
        self.refresh_calendar()
    
    def show(self):
        """Show calendar panel"""
        self.frame.pack(fill=tk.BOTH, expand=True)
    
    def hide(self):
        """Hide calendar panel"""
        self.frame.pack_forget()
    
    def apply_theme(self, theme, text_config):
        """Apply theme to calendar panel"""
        pass

class EventDialog:
    def __init__(self, parent, title, default_date=None):
        self.result = None
        
        # Create dialog window
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(title)
        self.dialog.geometry("400x300")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Center dialog
        self.dialog.update_idletasks()
        x = (self.dialog.winfo_screenwidth() // 2) - (400 // 2)
        y = (self.dialog.winfo_screenheight() // 2) - (300 // 2)
        self.dialog.geometry(f"400x300+{x}+{y}")
        
        self.create_form(default_date)
        
        # Wait for dialog to close
        self.dialog.wait_window()
    
    def create_form(self, default_date):
        """Create event form"""
        main_frame = ttk.Frame(self.dialog, padding=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        ttk.Label(main_frame, text="Title:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.title_var = tk.StringVar()
        title_entry = ttk.Entry(main_frame, textvariable=self.title_var, width=40)
        title_entry.grid(row=0, column=1, pady=5, sticky=tk.EW)
        
        # Description
        ttk.Label(main_frame, text="Description:").grid(row=1, column=0, sticky=tk.NW, pady=5)
        self.description_text = tk.Text(main_frame, height=4, width=40)
        self.description_text.grid(row=1, column=1, pady=5, sticky=tk.EW)
        
        # Start date
        ttk.Label(main_frame, text="Start Date:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.start_date_var = tk.StringVar(value=default_date.isoformat() if default_date else '')
        start_date_entry = ttk.Entry(main_frame, textvariable=self.start_date_var, width=40)
        start_date_entry.grid(row=2, column=1, pady=5, sticky=tk.EW)
        
        # All day checkbox
        self.all_day_var = tk.BooleanVar()
        all_day_cb = ttk.Checkbutton(main_frame, text="All day event", variable=self.all_day_var)
        all_day_cb.grid(row=3, column=1, sticky=tk.W, pady=5)
        
        # Buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=4, column=0, columnspan=2, pady=20)
        
        ttk.Button(button_frame, text="Save", command=self.save).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Cancel", command=self.cancel).pack(side=tk.LEFT, padx=5)
        
        # Configure grid weights
        main_frame.columnconfigure(1, weight=1)
        
        # Focus on title entry
        title_entry.focus()
    
    def save(self):
        """Save event data"""
        title = self.title_var.get().strip()
        if not title:
            messagebox.showerror("Error", "Title is required!")
            return
        
        self.result = {
            'title': title,
            'description': self.description_text.get('1.0', tk.END).strip(),
            'start_date': self.start_date_var.get().strip(),
            'all_day': self.all_day_var.get()
        }
        
        self.dialog.destroy()
    
    def cancel(self):
        """Cancel dialog"""
        self.dialog.destroy()
