"""
Tasks management component
"""

import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
from datetime import datetime, date

class TasksPanel:
    def __init__(self, parent, database, theme_manager):
        self.parent = parent
        self.db = database
        self.theme_manager = theme_manager
        
        self.create_tasks_panel()
    
    def create_tasks_panel(self):
        """Create tasks management interface"""
        # Main frame
        self.frame = ttk.Frame(self.parent, style='Main.TFrame')
        
        # Header
        header_frame = ttk.Frame(self.frame, style='Main.TFrame')
        header_frame.pack(fill=tk.X, pady=(0, 20))
        
        title_label = ttk.Label(header_frame, text="Tasks", style='Title.TLabel')
        title_label.pack(side=tk.LEFT)
        
        # Add task button
        add_btn = ttk.Button(header_frame, text="+ Add Task", style='Main.TButton', command=self.add_task)
        add_btn.pack(side=tk.RIGHT)
        
        # Filter frame
        filter_frame = ttk.Frame(self.frame, style='Main.TFrame')
        filter_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Label(filter_frame, text="Filter:", style='Main.TLabel').pack(side=tk.LEFT, padx=(0, 10))
        
        self.filter_var = tk.StringVar(value="all")
        filter_options = [("All", "all"), ("Pending", "pending"), ("Completed", "completed")]
        
        for text, value in filter_options:
            rb = ttk.Radiobutton(filter_frame, text=text, variable=self.filter_var, 
                               value=value, command=self.refresh)
            rb.pack(side=tk.LEFT, padx=(0, 10))
        
        # Tasks list frame
        list_frame = ttk.Frame(self.frame, style='Card.TFrame', padding=10)
        list_frame.pack(fill=tk.BOTH, expand=True)
        
        # Create treeview for tasks
        columns = ('Title', 'Priority', 'Status', 'Due Date', 'Created')
        self.tasks_tree = ttk.Treeview(list_frame, columns=columns, show='headings', height=15)
        
        # Configure columns
        self.tasks_tree.heading('Title', text='Title')
        self.tasks_tree.heading('Priority', text='Priority')
        self.tasks_tree.heading('Status', text='Status')
        self.tasks_tree.heading('Due Date', text='Due Date')
        self.tasks_tree.heading('Created', text='Created')
        
        self.tasks_tree.column('Title', width=300)
        self.tasks_tree.column('Priority', width=100)
        self.tasks_tree.column('Status', width=100)
        self.tasks_tree.column('Due Date', width=120)
        self.tasks_tree.column('Created', width=120)
        
        # Scrollbar for treeview
        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.tasks_tree.yview)
        self.tasks_tree.configure(yscrollcommand=scrollbar.set)
        
        # Pack treeview and scrollbar
        self.tasks_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Context menu
        self.create_context_menu()
        
        # Bind events
        self.tasks_tree.bind('<Double-1>', self.edit_task)
        self.tasks_tree.bind('<Button-3>', self.show_context_menu)
    
    def create_context_menu(self):
        """Create context menu for tasks"""
        self.context_menu = tk.Menu(self.frame, tearoff=0)
        self.context_menu.add_command(label="Edit", command=self.edit_task)
        self.context_menu.add_command(label="Complete", command=self.complete_task)
        self.context_menu.add_command(label="Delete", command=self.delete_task)
    
    def show_context_menu(self, event):
        """Show context menu"""
        item = self.tasks_tree.identify_row(event.y)
        if item:
            self.tasks_tree.selection_set(item)
            self.context_menu.post(event.x_root, event.y_root)
    
    def add_task(self):
        """Add new task dialog"""
        dialog = TaskDialog(self.frame, "Add Task")
        if dialog.result:
            task_data = dialog.result
            try:
                self.db.create_task(
                    title=task_data['title'],
                    description=task_data['description'],
                    priority=task_data['priority'],
                    due_date=task_data['due_date']
                )
                self.refresh()
                messagebox.showinfo("Success", "Task added successfully!")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to add task: {e}")
    
    def edit_task(self, event=None):
        """Edit selected task"""
        selection = self.tasks_tree.selection()
        if not selection:
            return
        
        item = selection[0]
        task_id = self.tasks_tree.item(item)['values'][0]  # Assuming ID is stored as first value
        
        # Get task data
        tasks = self.db.get_tasks()
        task = next((t for t in tasks if t['id'] == task_id), None)
        
        if task:
            dialog = TaskDialog(self.frame, "Edit Task", task)
            if dialog.result:
                task_data = dialog.result
                try:
                    self.db.update_task(task_id, **task_data)
                    self.refresh()
                    messagebox.showinfo("Success", "Task updated successfully!")
                except Exception as e:
                    messagebox.showerror("Error", f"Failed to update task: {e}")
    
    def complete_task(self):
        """Mark selected task as completed"""
        selection = self.tasks_tree.selection()
        if not selection:
            return
        
        item = selection[0]
        values = self.tasks_tree.item(item)['values']
        task_id = values[0]  # Assuming ID is stored
        
        try:
            self.db.update_task(task_id, status='completed')
            self.refresh()
            messagebox.showinfo("Success", "Task completed!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to complete task: {e}")
    
    def delete_task(self):
        """Delete selected task"""
        selection = self.tasks_tree.selection()
        if not selection:
            return
        
        if messagebox.askyesno("Confirm", "Are you sure you want to delete this task?"):
            item = selection[0]
            values = self.tasks_tree.item(item)['values']
            task_id = values[0]  # Assuming ID is stored
            
            try:
                self.db.delete_task(task_id)
                self.refresh()
                messagebox.showinfo("Success", "Task deleted!")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to delete task: {e}")
    
    def refresh(self):
        """Refresh tasks list"""
        # Clear existing items
        for item in self.tasks_tree.get_children():
            self.tasks_tree.delete(item)
        
        # Get tasks based on filter
        filter_status = self.filter_var.get()
        if filter_status == "all":
            tasks = self.db.get_tasks()
        else:
            tasks = self.db.get_tasks(filter_status)
        
        # Populate treeview
        for task in tasks:
            # Format dates
            created_date = task['created_at'][:10] if task['created_at'] else ''
            due_date = task['due_date'] if task['due_date'] else ''
            
            self.tasks_tree.insert('', tk.END, values=(
                task['id'],  # Hidden ID for operations
                task['title'],
                task['priority'].title(),
                task['status'].title(),
                due_date,
                created_date
            ))
    
    def show(self):
        """Show tasks panel"""
        self.frame.pack(fill=tk.BOTH, expand=True)
    
    def hide(self):
        """Hide tasks panel"""
        self.frame.pack_forget()
    
    def apply_theme(self, theme, text_config):
        """Apply theme to tasks panel"""
        # Configure treeview
        style = ttk.Style()
        style.configure('Treeview', 
                       background=theme['input_bg'],
                       foreground=theme['fg'],
                       fieldbackground=theme['input_bg'])
        style.configure('Treeview.Heading',
                       background=theme['secondary_bg'],
                       foreground=theme['fg'])

class TaskDialog:
    def __init__(self, parent, title, task_data=None):
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
        
        self.create_form(task_data)
        
        # Wait for dialog to close
        self.dialog.wait_window()
    
    def create_form(self, task_data):
        """Create task form"""
        main_frame = ttk.Frame(self.dialog, padding=20)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Title
        ttk.Label(main_frame, text="Title:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.title_var = tk.StringVar(value=task_data['title'] if task_data else '')
        title_entry = ttk.Entry(main_frame, textvariable=self.title_var, width=40)
        title_entry.grid(row=0, column=1, pady=5, sticky=tk.EW)
        
        # Description
        ttk.Label(main_frame, text="Description:").grid(row=1, column=0, sticky=tk.NW, pady=5)
        self.description_text = tk.Text(main_frame, height=5, width=40)
        self.description_text.grid(row=1, column=1, pady=5, sticky=tk.EW)
        if task_data and task_data.get('description'):
            self.description_text.insert('1.0', task_data['description'])
        
        # Priority
        ttk.Label(main_frame, text="Priority:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.priority_var = tk.StringVar(value=task_data['priority'] if task_data else 'medium')
        priority_combo = ttk.Combobox(main_frame, textvariable=self.priority_var, 
                                    values=['low', 'medium', 'high'], state='readonly')
        priority_combo.grid(row=2, column=1, pady=5, sticky=tk.EW)
        
        # Due date
        ttk.Label(main_frame, text="Due Date:").grid(row=3, column=0, sticky=tk.W, pady=5)
        self.due_date_var = tk.StringVar(value=task_data['due_date'] if task_data and task_data.get('due_date') else '')
        due_date_entry = ttk.Entry(main_frame, textvariable=self.due_date_var, width=40)
        due_date_entry.grid(row=3, column=1, pady=5, sticky=tk.EW)
        
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
        """Save task data"""
        title = self.title_var.get().strip()
        if not title:
            messagebox.showerror("Error", "Title is required!")
            return
        
        self.result = {
            'title': title,
            'description': self.description_text.get('1.0', tk.END).strip(),
            'priority': self.priority_var.get(),
            'due_date': self.due_date_var.get().strip() or None
        }
        
        self.dialog.destroy()
    
    def cancel(self):
        """Cancel dialog"""
        self.dialog.destroy()
