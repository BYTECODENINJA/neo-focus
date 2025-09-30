"""
Goals management component
"""

import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime, date

class GoalsPanel:
    def __init__(self, parent, database, theme_manager):
        self.parent = parent
        self.db = database
        self.theme_manager = theme_manager
        
        self.create_goals_panel()
    
    def create_goals_panel(self):
        """Create goals management interface"""
        # Main frame
        self.frame = ttk.Frame(self.parent, style='Main.TFrame')
        
        # Header
        header_frame = ttk.Frame(self.frame, style='Main.TFrame')
        header_frame.pack(fill=tk.X, pady=(0, 20))
        
        title_label = ttk.Label(header_frame, text="Goals", style='Title.TLabel')
        title_label.pack(side=tk.LEFT)
        
        # Add goal button
        add_btn = ttk.Button(header_frame, text="+ Add Goal", style='Main.TButton', command=self.add_goal)
        add_btn.pack(side=tk.RIGHT)
        
        # Goals container
        self.goals_container = ttk.Frame(self.frame, style='Main.TFrame')
        self.goals_container.pack(fill=tk.BOTH, expand=True)
        
        # Create scrollable frame
        canvas = tk.Canvas(self.goals_container, highlightthickness=0)
        scrollbar = ttk.Scrollbar(self.goals_container, orient="vertical", command=canvas.yview)
        self.scrollable_frame = ttk.Frame(canvas, style='Main.TFrame')
        
        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        self.canvas = canvas
    
    def add_goal(self):
        """Add new goal dialog"""
        dialog = GoalDialog(self.frame, "Add Goal")
        if dialog.result:
            goal_data = dialog.result
            try:
                self.db.create_goal(
                    title=goal_data['title'],
                    description=goal_data['description'],
                    category=goal_data['category'],
                    target_value=goal_data['target_value'],
                    due_date=goal_data['due_date']
                )
                self.refresh()
                messagebox.showinfo("Success", "Goal added successfully!")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to add goal: {e}")
    
    def update_progress(self, goal_id, current_progress):
        """Update goal progress"""
        try:
            self.db.update_goal_progress(goal_id, current_progress)
            self.refresh()
        except Exception as e:
            messagebox.showerror("Error", f"Failed to update progress: {e}")
    
    def refresh(self):
        """Refresh goals display"""
        # Clear existing goal cards
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()
        
        # Get goals from database
        goals = self.db.get_goals()
        
        if not goals:
            # Show empty state
            empty_label = ttk.Label(self.scrollable_frame, 
                                  text="No goals yet. Set your first goal to get started!",
                                  style='Subtitle.TLabel')
            empty_label.pack(pady=50)
            return
        
        # Create goal cards
        for goal in goals:
            self.create_goal_card(goal)
    
    def create_goal_card(self, goal):
        """Create individual goal card"""
        card_frame = ttk.Frame(self.scrollable_frame, style='Card.TFrame', padding=15)
        card_frame.pack(fill=tk.X, pady=5)
        
        # Header with title and category
        header_frame = ttk.Frame(card_frame, style='Card.TFrame')
        header_frame.pack(fill=tk.X, pady=(0, 10))
        
        # Goal title
        title_label = ttk.Label(header_frame, text=goal['title'], 
                              font=('Arial', 14, 'bold'), style='Card.TLabel')
        title_label.pack(side=tk.LEFT)
        
        # Category badge
        if goal['category']:
            category_label = ttk.Label(header_frame, text=goal['category'], 
                                     style='Card.TLabel',
                                     font=('Arial', 10))
            category_label.pack(side=tk.RIGHT)
        
        # Description
        if goal['description']:
            desc_label = ttk.Label(card_frame, text=goal['description'], 
                                 style='Card.TLabel', wraplength=600)
            desc_label.pack(anchor=tk.W, pady=(0, 10))
        
        # Progress section
        progress_frame = ttk.Frame(card_frame, style='Card.TFrame')
        progress_frame.pack(fill=tk.X, pady=(0, 10))
        
        # Progress bar
        progress_percentage = (goal['current_value'] / goal['target_value']) * 100 if goal['target_value'] > 0 else 0
        
        progress_label = ttk.Label(progress_frame, 
                                 text=f"Progress: {goal['current_value']}/{goal['target_value']} ({progress_percentage:.1f}%)",
                                 style='Card.TLabel')
        progress_label.pack(anchor=tk.W)
        
        # Progress bar
        progress_bar = ttk.Progressbar(progress_frame, length=400, mode='determinate')
        progress_bar['value'] = progress_percentage
        progress_bar.pack(anchor=tk.W, pady=(5, 0))
        
        # Controls frame
        controls_frame = ttk.Frame(card_frame, style='Card.TFrame')
        controls_frame.pack(fill=tk.X)
        
        # Progress update controls
        update_frame = ttk.Frame(controls_frame, style='Card.TFrame')
        update_frame.pack(side=tk.LEFT)
        
        ttk.Label(update_frame, text="Update progress:", style='Card.TLabel').pack(side=tk.LEFT)
        
        progress_var = tk.IntVar(value=goal['current_value'])
        progress_spinbox = tk.Spinbox(update_frame, from_=0, to=goal['target_value'], 
                                    textvariable=progress_var, width=10)
        progress_spinbox.pack(side=tk.LEFT, padx=5)
        
        update_btn = ttk.Button(update_frame, text="Update", 
                              command=lambda: self.update_progress(goal['id'], progress_var.get()))
        update_btn.pack(side=tk.LEFT, padx=5)
        
        # Status and due date
        info_frame = ttk.Frame(controls_frame, style='Card.TFrame')
        info_frame.pack(side=tk.RIGHT)
        
        status_label = ttk.Label(info_frame, text=f"Status: {goal['status'].title()}", 
                               style='Card.TLabel')
        status_label.pack(side=tk.RIGHT, padx=(0, 10))
        
        if goal['due_date']:
            due_label = ttk.Label(info_frame, text=f"Due: {goal['due_date']}", 
                                style='Card.TLabel')
            due_label.pack(side=tk.RIGHT, padx=(0, 10))
    
    def show(self):
        """Show goals panel"""
        self.frame.pack(fill=tk.BOTH, expand=True)
    
    def hide(self):
        """Hide goals panel"""
        self.frame.pack_forget()
    
    def apply_theme(self, theme, text_config):
        """Apply theme to goals panel"""
        # Update canvas background
        self.canvas.configure(bg=theme['bg'])

class GoalDialog:
    def __init__(self, parent, title, goal_data=None):
        self.result = None
        
        # Create dialog window
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(title)
        self.dialog.geometry("450x350")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Center dialog
        self.dialog.update_idletasks()
        x = (self.dialog.winfo_screenwidth() // 2) - (450 // 2)
        y = (self.dialog.winfo_screenheight() // 2) - (350 // 2)
        self.dialog.geometry(f"450x350+{x}+{y}")
        
        self.create_form(goal_data)
        
        # Wait for dialog to close
        self.dialog.wait_window()
    
    def create_form(self, goal_data):
        """Create goal form"""
        main_frame = ttk.Frame(self.dialog, padding=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        ttk.Label(main_frame, text="Title:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.title_var = tk.StringVar(value=goal_data['title'] if goal_data else '')
        title_entry = ttk.Entry(main_frame, textvariable=self.title_var, width=40)
        title_entry.grid(row=0, column=1, pady=5, sticky=tk.EW)
        
        # Description
        ttk.Label(main_frame, text="Description:").grid(row=1, column=0, sticky=tk.NW, pady=5)
        self.description_text = tk.Text(main_frame, height=4, width=40)
        self.description_text.grid(row=1, column=1, pady=5, sticky=tk.EW)
        if goal_data and goal_data.get('description'):
            self.description_text.insert('1.0', goal_data['description'])
        
        # Category
        ttk.Label(main_frame, text="Category:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.category_var = tk.StringVar(value=goal_data['category'] if goal_data else '')
        category_combo = ttk.Combobox(main_frame, textvariable=self.category_var, 
                                    values=['Personal', 'Professional', 'Health', 'Learning', 'Financial'])
        category_combo.grid(row=2, column=1, pady=5, sticky=tk.EW)
        
        # Target value
        ttk.Label(main_frame, text="Target Value:").grid(row=3, column=0, sticky=tk.W, pady=5)
        self.target_var = tk.IntVar(value=goal_data['target_value'] if goal_data else 1)
        target_spinbox = tk.Spinbox(main_frame, from_=1, to=10000, textvariable=self.target_var, width=40)
        target_spinbox.grid(row=3, column=1, pady=5, sticky=tk.EW)
        
        # Due date
        ttk.Label(main_frame, text="Due Date:").grid(row=4, column=0, sticky=tk.W, pady=5)
        self.due_date_var = tk.StringVar(value=goal_data['due_date'] if goal_data and goal_data.get('due_date') else '')
        due_date_entry = ttk.Entry(main_frame, textvariable=self.due_date_var, width=40)
        due_date_entry.grid(row=4, column=1, pady=5, sticky=tk.EW)
        
        # Buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=5, column=0, columnspan=2, pady=20)
        
        ttk.Button(button_frame, text="Save", command=self.save).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Cancel", command=self.cancel).pack(side=tk.LEFT, padx=5)
        
        # Configure grid weights
        main_frame.columnconfigure(1, weight=1)
        
        # Focus on title entry
        title_entry.focus()
    
    def save(self):
        """Save goal data"""
        title = self.title_var.get().strip()
        if not title:
            messagebox.showerror("Error", "Title is required!")
            return
        
        target_value = self.target_var.get()
        if target_value <= 0:
            messagebox.showerror("Error", "Target value must be greater than 0!")
            return
        
        self.result = {
            'title': title,
            'description': self.description_text.get('1.0', tk.END).strip(),
            'category': self.category_var.get().strip(),
            'target_value': target_value,
            'due_date': self.due_date_var.get().strip() or None
        }
        
        self.dialog.destroy()
    
    def cancel(self):
        """Cancel dialog"""
        self.dialog.destroy()
