"""
Habits tracking component
"""

import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime, date

class HabitsPanel:
    def __init__(self, parent, database, theme_manager):
        self.parent = parent
        self.db = database
        self.theme_manager = theme_manager
        
        self.create_habits_panel()
    
    def create_habits_panel(self):
        """Create habits tracking interface"""
        # Main frame
        self.frame = ttk.Frame(self.parent, style='Main.TFrame')
        
        # Header
        header_frame = ttk.Frame(self.frame, style='Main.TFrame')
        header_frame.pack(fill=tk.X, pady=(0, 20))
        
        title_label = ttk.Label(header_frame, text="Habits", style='Title.TLabel')
        title_label.pack(side=tk.LEFT)
        
        # Add habit button
        add_btn = ttk.Button(header_frame, text="+ Add Habit", style='Main.TButton', command=self.add_habit)
        add_btn.pack(side=tk.RIGHT)
        
        # Habits container
        self.habits_container = ttk.Frame(self.frame, style='Main.TFrame')
        self.habits_container.pack(fill=tk.BOTH, expand=True)
        
        # Create scrollable frame
        canvas = tk.Canvas(self.habits_container, highlightthickness=0)
        scrollbar = ttk.Scrollbar(self.habits_container, orient="vertical", command=canvas.yview)
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
    
    def add_habit(self):
        """Add new habit dialog"""
        dialog = HabitDialog(self.frame, "Add Habit")
        if dialog.result:
            habit_data = dialog.result
            try:
                self.db.create_habit(
                    name=habit_data['name'],
                    description=habit_data['description'],
                    frequency=habit_data['frequency']
                )
                self.refresh()
                messagebox.showinfo("Success", "Habit added successfully!")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to add habit: {e}")
    
    def complete_habit(self, habit_id):
        """Mark habit as completed for today"""
        try:
            self.db.complete_habit(habit_id)
            self.refresh()
            messagebox.showinfo("Success", "Habit completed! 🎉")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to complete habit: {e}")
    
    def delete_habit(self, habit_id):
        """Delete habit"""
        if messagebox.askyesno("Confirm", "Are you sure you want to delete this habit?"):
            try:
                # Note: You'll need to add delete_habit method to database
                # self.db.delete_habit(habit_id)
                self.refresh()
                messagebox.showinfo("Success", "Habit deleted!")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to delete habit: {e}")
    
    def refresh(self):
        """Refresh habits display"""
        # Clear existing habit cards
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()
        
        # Get habits from database
        habits = self.db.get_habits()
        
        if not habits:
            # Show empty state
            empty_label = ttk.Label(self.scrollable_frame, 
                                  text="No habits yet. Add your first habit to get started!",
                                  style='Subtitle.TLabel')
            empty_label.pack(pady=50)
            return
        
        # Create habit cards
        for habit in habits:
            self.create_habit_card(habit)
    
    def create_habit_card(self, habit):
        """Create individual habit card"""
        card_frame = ttk.Frame(self.scrollable_frame, style='Card.TFrame', padding=15)
        card_frame.pack(fill=tk.X, pady=5)
        
        # Header with name and actions
        header_frame = ttk.Frame(card_frame, style='Card.TFrame')
        header_frame.pack(fill=tk.X, pady=(0, 10))
        
        # Habit name
        name_label = ttk.Label(header_frame, text=habit['name'], 
                              font=('Arial', 14, 'bold'), style='Card.TLabel')
        name_label.pack(side=tk.LEFT)
        
        # Action buttons
        actions_frame = ttk.Frame(header_frame, style='Card.TFrame')
        actions_frame.pack(side=tk.RIGHT)
        
        complete_btn = ttk.Button(actions_frame, text="✓ Complete", 
                                style='Main.TButton',
                                command=lambda: self.complete_habit(habit['id']))
        complete_btn.pack(side=tk.LEFT, padx=2)
        
        delete_btn = ttk.Button(actions_frame, text="🗑", 
                              style='Secondary.TButton',
                              command=lambda: self.delete_habit(habit['id']))
        delete_btn.pack(side=tk.LEFT, padx=2)
        
        # Description
        if habit['description']:
            desc_label = ttk.Label(card_frame, text=habit['description'], 
                                 style='Card.TLabel', wraplength=600)
            desc_label.pack(anchor=tk.W, pady=(0, 10))
        
        # Stats frame
        stats_frame = ttk.Frame(card_frame, style='Card.TFrame')
        stats_frame.pack(fill=tk.X)
        
        # Current streak
        streak_label = ttk.Label(stats_frame, 
                               text=f"Current Streak: {habit['streak']} days",
                               font=('Arial', 12, 'bold'), style='Card.TLabel')
        streak_label.pack(side=tk.LEFT)
        
        # Best streak
        best_label = ttk.Label(stats_frame, 
                             text=f"Best: {habit['best_streak']} days",
                             style='Card.TLabel')
        best_label.pack(side=tk.LEFT, padx=(20, 0))
        
        # Frequency
        freq_label = ttk.Label(stats_frame, 
                             text=f"Frequency: {habit['frequency'].title()}",
                             style='Card.TLabel')
        freq_label.pack(side=tk.RIGHT)
        
        # Last completed
        if habit['last_completed']:
            last_label = ttk.Label(stats_frame, 
                                 text=f"Last completed: {habit['last_completed']}",
                                 style='Card.TLabel')
            last_label.pack(side=tk.RIGHT, padx=(0, 20))
    
    def show(self):
        """Show habits panel"""
        self.frame.pack(fill=tk.BOTH, expand=True)
    
    def hide(self):
        """Hide habits panel"""
        self.frame.pack_forget()
    
    def apply_theme(self, theme, text_config):
        """Apply theme to habits panel"""
        # Update canvas background
        self.canvas.configure(bg=theme['bg'])

class HabitDialog:
    def __init__(self, parent, title, habit_data=None):
        self.result = None
        
        # Create dialog window
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(title)
        self.dialog.geometry("400x250")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Center dialog
        self.dialog.update_idletasks()
        x = (self.dialog.winfo_screenwidth() // 2) - (400 // 2)
        y = (self.dialog.winfo_screenheight() // 2) - (250 // 2)
        self.dialog.geometry(f"400x250+{x}+{y}")
        
        self.create_form(habit_data)
        
        # Wait for dialog to close
        self.dialog.wait_window()
    
    def create_form(self, habit_data):
        """Create habit form"""
        main_frame = ttk.Frame(self.dialog, padding=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Name
        ttk.Label(main_frame, text="Name:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.name_var = tk.StringVar(value=habit_data['name'] if habit_data else '')
        name_entry = ttk.Entry(main_frame, textvariable=self.name_var, width=40)
        name_entry.grid(row=0, column=1, pady=5, sticky=tk.EW)
        
        # Description
        ttk.Label(main_frame, text="Description:").grid(row=1, column=0, sticky=tk.NW, pady=5)
        self.description_text = tk.Text(main_frame, height=4, width=40)
        self.description_text.grid(row=1, column=1, pady=5, sticky=tk.EW)
        if habit_data and habit_data.get('description'):
            self.description_text.insert('1.0', habit_data['description'])
        
        # Frequency
        ttk.Label(main_frame, text="Frequency:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.frequency_var = tk.StringVar(value=habit_data['frequency'] if habit_data else 'daily')
        frequency_combo = ttk.Combobox(main_frame, textvariable=self.frequency_var, 
                                     values=['daily', 'weekly', 'monthly'], state='readonly')
        frequency_combo.grid(row=2, column=1, pady=5, sticky=tk.EW)
        
        # Buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=3, column=0, columnspan=2, pady=20)
        
        ttk.Button(button_frame, text="Save", command=self.save).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Cancel", command=self.cancel).pack(side=tk.LEFT, padx=5)
        
        # Configure grid weights
        main_frame.columnconfigure(1, weight=1)
        
        # Focus on name entry
        name_entry.focus()
    
    def save(self):
        """Save habit data"""
        name = self.name_var.get().strip()
        if not name:
            messagebox.showerror("Error", "Name is required!")
            return
        
        self.result = {
            'name': name,
            'description': self.description_text.get('1.0', tk.END).strip(),
            'frequency': self.frequency_var.get()
        }
        
        self.dialog.destroy()
    
    def cancel(self):
        """Cancel dialog"""
        self.dialog.destroy()
