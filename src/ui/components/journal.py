"""
Journal component with rich text editing
"""

import tkinter as tk
from tkinter import ttk, messagebox, colorchooser
from datetime import datetime, date
import calendar

class JournalPanel:
    def __init__(self, parent, database, theme_manager):
        self.parent = parent
        self.db = database
        self.theme_manager = theme_manager
        self.current_date = date.today()
        self.current_entry = None
        
        self.create_journal_panel()
    
    def create_journal_panel(self):
        """Create journal interface"""
        # Main frame
        self.frame = ttk.Frame(self.parent, style='Main.TFrame')
        
        # Header with date navigation
        self.create_header()
        
        # Create paned window for calendar and editor
        self.paned_window = ttk.PanedWindow(self.frame, orient=tk.HORIZONTAL)
        self.paned_window.pack(fill=tk.BOTH, expand=True, pady=(10, 0))
        
        # Left panel - Mini calendar and mood/energy
        self.create_sidebar()
        
        # Right panel - Journal editor
        self.create_editor()
        
        # Load today's entry
        self.load_entry_for_date(self.current_date)
    
    def create_header(self):
        """Create header with date navigation"""
        header_frame = ttk.Frame(self.frame, style='Main.TFrame')
        header_frame.pack(fill=tk.X, pady=(0, 10))
        
        # Title
        title_label = ttk.Label(header_frame, text="Journal", style='Title.TLabel')
        title_label.pack(side=tk.LEFT)
        
        # Date navigation
        nav_frame = ttk.Frame(header_frame, style='Main.TFrame')
        nav_frame.pack(side=tk.RIGHT)
        
        prev_btn = ttk.Button(nav_frame, text="◀", command=self.prev_day)
        prev_btn.pack(side=tk.LEFT, padx=2)
        
        self.date_label = ttk.Label(nav_frame, text="", font=('Arial', 12, 'bold'), style='Main.TLabel')
        self.date_label.pack(side=tk.LEFT, padx=10)
        
        next_btn = ttk.Button(nav_frame, text="▶", command=self.next_day)
        next_btn.pack(side=tk.LEFT, padx=2)
        
        today_btn = ttk.Button(nav_frame, text="Today", command=self.go_to_today)
        today_btn.pack(side=tk.LEFT, padx=(10, 0))
        
        self.update_date_label()
    
    def create_sidebar(self):
        """Create sidebar with mini calendar and mood/energy"""
        sidebar_frame = ttk.Frame(self.paned_window, style='Main.TFrame', width=250)
        self.paned_window.add(sidebar_frame, weight=0)
        
        # Mini calendar
        cal_frame = ttk.Frame(sidebar_frame, style='Card.TFrame', padding=10)
        cal_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Label(cal_frame, text="Calendar", font=('Arial', 12, 'bold'), style='Card.TLabel').pack()
        
        # Simple calendar display (you could use a more sophisticated calendar widget)
        self.create_mini_calendar(cal_frame)
        
        # Mood and Energy
        mood_frame = ttk.Frame(sidebar_frame, style='Card.TFrame', padding=10)
        mood_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Label(mood_frame, text="Mood & Energy", font=('Arial', 12, 'bold'), style='Card.TLabel').pack()
        
        # Mood scale
        ttk.Label(mood_frame, text="Mood (1-10):", style='Card.TLabel').pack(anchor=tk.W, pady=(10, 0))
        self.mood_var = tk.IntVar(value=5)
        mood_scale = ttk.Scale(mood_frame, from_=1, to=10, variable=self.mood_var, 
                             orient=tk.HORIZONTAL, command=self.on_mood_change)
        mood_scale.pack(fill=tk.X, pady=5)
        
        self.mood_label = ttk.Label(mood_frame, text="😐 Neutral", style='Card.TLabel')
        self.mood_label.pack()
        
        # Energy scale
        ttk.Label(mood_frame, text="Energy (1-10):", style='Card.TLabel').pack(anchor=tk.W, pady=(10, 0))
        self.energy_var = tk.IntVar(value=5)
        energy_scale = ttk.Scale(mood_frame, from_=1, to=10, variable=self.energy_var,
                               orient=tk.HORIZONTAL, command=self.on_energy_change)
        energy_scale.pack(fill=tk.X, pady=5)
        
        self.energy_label = ttk.Label(mood_frame, text="⚡ Moderate", style='Card.TLabel')
        self.energy_label.pack()
        
        # Tags
        tags_frame = ttk.Frame(sidebar_frame, style='Card.TFrame', padding=10)
        tags_frame.pack(fill=tk.X)
        
        ttk.Label(tags_frame, text="Tags", font=('Arial', 12, 'bold'), style='Card.TLabel').pack()
        
        self.tags_var = tk.StringVar()
        self.tags_var.trace('w', self.on_content_change)
        tags_entry = ttk.Entry(tags_frame, textvariable=self.tags_var)
        tags_entry.pack(fill=tk.X, pady=(10, 0))
        
        ttk.Label(tags_frame, text="Separate with commas", font=('Arial', 9), style='Card.TLabel').pack(anchor=tk.W)
    
    def create_mini_calendar(self, parent):
        """Create a simple mini calendar"""
        cal_text = tk.Text(parent, height=8, width=20, font=('Courier', 9))
        cal_text.pack()
        
        # Generate calendar for current month
        cal = calendar.monthcalendar(self.current_date.year, self.current_date.month)
        month_name = calendar.month_name[self.current_date.month]
        
        cal_text.insert('1.0', f"  {month_name} {self.current_date.year}\n")
        cal_text.insert(tk.END, "Mo Tu We Th Fr Sa Su\n")
        
        for week in cal:
            week_str = ""
            for day in week:
                if day == 0:
                    week_str += "   "
                else:
                    if day == self.current_date.day:
                        week_str += f"[{day:2d}]"[:-1] if day < 10 else f"[{day}]"
                    else:
                        week_str += f"{day:2d} "
            cal_text.insert(tk.END, week_str + "\n")
        
        cal_text.configure(state=tk.DISABLED)
        self.cal_text = cal_text
    
    def create_editor(self):
        """Create journal editor"""
        editor_frame = ttk.Frame(self.paned_window, style='Main.TFrame')
        self.paned_window.add(editor_frame, weight=1)
        
        # Formatting toolbar
        self.create_toolbar(editor_frame)
        
        # Text editor
        text_frame = ttk.Frame(editor_frame, style='Card.TFrame', padding=5)
        text_frame.pack(fill=tk.BOTH, expand=True, pady=(10, 0))
        
        # Text widget with scrollbar
        self.text_editor = tk.Text(text_frame, wrap=tk.WORD, font=('Arial', 11), 
                                 undo=True, maxundo=50)
        text_scrollbar = ttk.Scrollbar(text_frame, orient=tk.VERTICAL, command=self.text_editor.yview)
        self.text_editor.configure(yscrollcommand=text_scrollbar.set)
        
        self.text_editor.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        text_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Bind events
        self.text_editor.bind('<KeyRelease>', self.on_content_change)
        self.text_editor.bind('<Button-1>', self.on_content_change)
        
        # Configure text tags for formatting
        self.setup_text_tags()
    
    def create_toolbar(self, parent):
        """Create formatting toolbar"""
        toolbar_frame = ttk.Frame(parent, style='Card.TFrame', padding=5)
        toolbar_frame.pack(fill=tk.X)
        
        # Font family
        ttk.Label(toolbar_frame, text="Font:", style='Card.TLabel').pack(side=tk.LEFT, padx=(0, 5))
        
        self.font_var = tk.StringVar(value="Arial")
        font_combo = ttk.Combobox(toolbar_frame, textvariable=self.font_var, width=12,
                                values=['Arial', 'Times New Roman', 'Courier New', 'Georgia', 
                                       'Verdana', 'Comic Sans MS', 'Impact', 'Trebuchet MS'])
        font_combo.pack(side=tk.LEFT, padx=(0, 10))
        font_combo.bind('<<ComboboxSelected>>', self.apply_font_family)
        
        # Font size
        ttk.Label(toolbar_frame, text="Size:", style='Card.TLabel').pack(side=tk.LEFT, padx=(0, 5))
        
        self.size_var = tk.IntVar(value=11)
        size_spinbox = tk.Spinbox(toolbar_frame, from_=8, to=24, textvariable=self.size_var, 
                                width=5, command=self.apply_font_size)
        size_spinbox.pack(side=tk.LEFT, padx=(0, 10))
        
        # Formatting buttons
        bold_btn = ttk.Button(toolbar_frame, text="B", width=3, command=self.toggle_bold)
        bold_btn.pack(side=tk.LEFT, padx=2)
        
        italic_btn = ttk.Button(toolbar_frame, text="I", width=3, command=self.toggle_italic)
        italic_btn.pack(side=tk.LEFT, padx=2)
        
        # Alignment
        left_btn = ttk.Button(toolbar_frame, text="◀", width=3, command=lambda: self.set_alignment('left'))
        left_btn.pack(side=tk.LEFT, padx=2)
        
        center_btn = ttk.Button(toolbar_frame, text="▬", width=3, command=lambda: self.set_alignment('center'))
        center_btn.pack(side=tk.LEFT, padx=2)
        
        right_btn = ttk.Button(toolbar_frame, text="▶", width=3, command=lambda: self.set_alignment('right'))
        right_btn.pack(side=tk.LEFT, padx=2)
        
        # Highlight color
        highlight_btn = ttk.Button(toolbar_frame, text="🎨", width=3, command=self.choose_highlight_color)
        highlight_btn.pack(side=tk.LEFT, padx=(10, 2))
        
        # Quick highlight colors
        colors = ['yellow', 'lightgreen', 'lightblue', 'pink', 'lightcoral', 'lightyellow']
        for color in colors:
            color_btn = tk.Button(toolbar_frame, bg=color, width=2, height=1,
                                command=lambda c=color: self.apply_highlight(c))
            color_btn.pack(side=tk.LEFT, padx=1)
    
    def setup_text_tags(self):
        """Setup text formatting tags"""
        # Font styles
        self.text_editor.tag_configure('bold', font=('Arial', 11, 'bold'))
        self.text_editor.tag_configure('italic', font=('Arial', 11, 'italic'))
        self.text_editor.tag_configure('bold_italic', font=('Arial', 11, 'bold italic'))
        
        # Alignments
        self.text_editor.tag_configure('left', justify='left')
        self.text_editor.tag_configure('center', justify='center')
        self.text_editor.tag_configure('right', justify='right')
        
        # Highlight colors
        colors = ['yellow', 'lightgreen', 'lightblue', 'pink', 'lightcoral', 'lightyellow']
        for color in colors:
            self.text_editor.tag_configure(f'highlight_{color}', background=color)
    
    def apply_font_family(self, event=None):
        """Apply font family to selected text"""
        try:
            if self.text_editor.tag_ranges(tk.SEL):
                font_family = self.font_var.get()
                size = self.size_var.get()
                self.text_editor.tag_add('custom_font', tk.SEL_FIRST, tk.SEL_LAST)
                self.text_editor.tag_configure('custom_font', font=(font_family, size))
        except tk.TclError:
            pass
    
    def apply_font_size(self):
        """Apply font size to selected text"""
        try:
            if self.text_editor.tag_ranges(tk.SEL):
                font_family = self.font_var.get()
                size = self.size_var.get()
                self.text_editor.tag_add('custom_size', tk.SEL_FIRST, tk.SEL_LAST)
                self.text_editor.tag_configure('custom_size', font=(font_family, size))
        except tk.TclError:
            pass
    
    def toggle_bold(self):
        """Toggle bold formatting"""
        try:
            if self.text_editor.tag_ranges(tk.SEL):
                self.text_editor.tag_add('bold', tk.SEL_FIRST, tk.SEL_LAST)
        except tk.TclError:
            pass
    
    def toggle_italic(self):
        """Toggle italic formatting"""
        try:
            if self.text_editor.tag_ranges(tk.SEL):
                self.text_editor.tag_add('italic', tk.SEL_FIRST, tk.SEL_LAST)
        except tk.TclError:
            pass
    
    def set_alignment(self, alignment):
        """Set text alignment"""
        try:
            if self.text_editor.tag_ranges(tk.SEL):
                self.text_editor.tag_add(alignment, tk.SEL_FIRST, tk.SEL_LAST)
        except tk.TclError:
            # Apply to current line if no selection
            current_line = self.text_editor.index(tk.INSERT).split('.')[0]
            self.text_editor.tag_add(alignment, f"{current_line}.0", f"{current_line}.end")
    
    def choose_highlight_color(self):
        """Choose custom highlight color"""
        color = colorchooser.askcolor(title="Choose highlight color")
        if color[1]:  # If a color was selected
            self.apply_highlight(color[1])
    
    def apply_highlight(self, color):
        """Apply highlight color to selected text"""
        try:
            if self.text_editor.tag_ranges(tk.SEL):
                tag_name = f'highlight_{color}'
                self.text_editor.tag_add(tag_name, tk.SEL_FIRST, tk.SEL_LAST)
                self.text_editor.tag_configure(tag_name, background=color)
        except tk.TclError:
            pass
    
    def prev_day(self):
        """Go to previous day"""
        from datetime import timedelta
        self.save_current_entry()
        self.current_date -= timedelta(days=1)
        self.update_date_label()
        self.load_entry_for_date(self.current_date)
    
    def next_day(self):
        """Go to next day"""
        from datetime import timedelta
        self.save_current_entry()
        self.current_date += timedelta(days=1)
        self.update_date_label()
        self.load_entry_for_date(self.current_date)
    
    def go_to_today(self):
        """Go to today"""
        self.save_current_entry()
        self.current_date = date.today()
        self.update_date_label()
        self.load_entry_for_date(self.current_date)
    
    def update_date_label(self):
        """Update date label"""
        self.date_label.configure(text=self.current_date.strftime("%B %d, %Y"))
    
    def load_entry_for_date(self, entry_date):
        """Load journal entry for specific date"""
        date_str = entry_date.isoformat()
        entry = self.db.get_journal_entry_by_date(date_str)
        
        if entry:
            self.current_entry = entry
            
            # Load content
            self.text_editor.delete('1.0', tk.END)
            self.text_editor.insert('1.0', entry['content'] or '')
            
            # Load mood and energy
            self.mood_var.set(entry['mood'])
            self.energy_var.set(entry['energy'])
            
            # Load tags
            self.tags_var.set(entry['tags'] or '')
            
        else:
            # Create new entry
            self.current_entry = None
            self.text_editor.delete('1.0', tk.END)
            self.mood_var.set(5)
            self.energy_var.set(5)
            self.tags_var.set('')
        
        # Update mood and energy labels
        self.update_mood_label()
        self.update_energy_label()
    
    def on_mood_change(self, value):
        """Handle mood change"""
        self.update_mood_label()
        self.save_current_entry()
    
    def on_energy_change(self, value):
        """Handle energy change"""
        self.update_energy_label()
        self.save_current_entry()
    
    def update_mood_label(self):
        """Update mood label with emoji"""
        mood = self.mood_var.get()
        mood_emojis = {
            1: "😢 Very Sad", 2: "😞 Sad", 3: "😕 Down", 4: "😐 Okay", 5: "😐 Neutral",
            6: "🙂 Good", 7: "😊 Happy", 8: "😄 Very Happy", 9: "😁 Excited", 10: "🤩 Ecstatic"
        }
        self.mood_label.configure(text=mood_emojis.get(mood, "😐 Neutral"))
    
    def update_energy_label(self):
        """Update energy label with emoji"""
        energy = self.energy_var.get()
        energy_emojis = {
            1: "😴 Exhausted", 2: "😪 Very Tired", 3: "😑 Tired", 4: "😐 Low", 5: "⚡ Moderate",
            6: "🔋 Good", 7: "⚡ High", 8: "🔥 Very High", 9: "💪 Energetic", 10: "🚀 Super Charged"
        }
        self.energy_label.configure(text=energy_emojis.get(energy, "⚡ Moderate"))
    
    def on_content_change(self, event=None):
        """Handle content change"""
        # Auto-save after a delay
        self.parent.after(2000, self.save_current_entry)
    
    def save_current_entry(self):
        """Save current journal entry"""
        try:
            content = self.text_editor.get('1.0', tk.END).strip()
            mood = self.mood_var.get()
            energy = self.energy_var.get()
            tags = self.tags_var.get().strip()
            date_str = self.current_date.isoformat()
            
            # Only save if there's content or mood/energy has changed from default
            if content or mood != 5 or energy != 5 or tags:
                entry_id = self.db.create_journal_entry(date_str, content, mood, energy, tags)
                
                # Update current entry reference
                if not self.current_entry:
                    self.current_entry = {
                        'id': entry_id,
                        'date': date_str,
                        'content': content,
                        'mood': mood,
                        'energy': energy,
                        'tags': tags
                    }
                
        except Exception as e:
            print(f"Error saving journal entry: {e}")
    
    def refresh(self):
        """Refresh journal panel"""
        self.load_entry_for_date(self.current_date)
    
    def show(self):
        """Show journal panel"""
        self.frame.pack(fill=tk.BOTH, expand=True)
    
    def hide(self):
        """Hide journal panel"""
        self.frame.pack_forget()
    
    def apply_theme(self, theme, text_config):
        """Apply theme to journal panel"""
        # Update text editor
        self.text_editor.configure(**text_config)
        
        # Update calendar text
        if hasattr(self, 'cal_text'):
            self.cal_text.configure(
                bg=theme['input_bg'],
                fg=theme['fg']
            )
