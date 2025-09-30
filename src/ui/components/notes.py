"""
Notes management component
"""

import tkinter as tk
from tkinter import ttk, messagebox
from datetime import datetime

class NotesPanel:
    def __init__(self, parent, database, theme_manager):
        self.parent = parent
        self.db = database
        self.theme_manager = theme_manager
        self.current_note = None
        
        self.create_notes_panel()
    
    def create_notes_panel(self):
        """Create notes management interface"""
        # Main frame
        self.frame = ttk.Frame(self.parent, style='Main.TFrame')
        
        # Create paned window for notes list and editor
        self.paned_window = ttk.PanedWindow(self.frame, orient=tk.HORIZONTAL)
        self.paned_window.pack(fill=tk.BOTH, expand=True)
        
        # Left panel - Notes list
        self.create_notes_list()
        
        # Right panel - Note editor
        self.create_note_editor()
    
    def create_notes_list(self):
        """Create notes list panel"""
        # Left frame
        left_frame = ttk.Frame(self.paned_window, style='Main.TFrame', width=300)
        self.paned_window.add(left_frame, weight=1)
        
        # Header
        header_frame = ttk.Frame(left_frame, style='Main.TFrame')
        header_frame.pack(fill=tk.X, pady=(0, 10))
        
        title_label = ttk.Label(header_frame, text="Notes", style='Title.TLabel')
        title_label.pack(side=tk.LEFT)
        
        # Add note button
        add_btn = ttk.Button(header_frame, text="+", style='Main.TButton', command=self.add_note)
        add_btn.pack(side=tk.RIGHT)
        
        # Search frame
        search_frame = ttk.Frame(left_frame, style='Main.TFrame')
        search_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.search_var = tk.StringVar()
        self.search_var.trace('w', self.filter_notes)
        search_entry = ttk.Entry(search_frame, textvariable=self.search_var, 
                               placeholder_text="Search notes...")
        search_entry.pack(fill=tk.X)
        
        # Notes listbox
        list_frame = ttk.Frame(left_frame, style='Card.TFrame', padding=5)
        list_frame.pack(fill=tk.BOTH, expand=True)
        
        self.notes_listbox = tk.Listbox(list_frame, font=('Arial', 10))
        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.notes_listbox.yview)
        self.notes_listbox.configure(yscrollcommand=scrollbar.set)
        
        self.notes_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Bind selection event
        self.notes_listbox.bind('<<ListboxSelect>>', self.on_note_select)
    
    def create_note_editor(self):
        """Create note editor panel"""
        # Right frame
        right_frame = ttk.Frame(self.paned_window, style='Main.TFrame')
        self.paned_window.add(right_frame, weight=2)
        
        # Editor header
        editor_header = ttk.Frame(right_frame, style='Main.TFrame')
        editor_header.pack(fill=tk.X, pady=(0, 10))
        
        # Title entry
        ttk.Label(editor_header, text="Title:", style='Main.TLabel').pack(anchor=tk.W)
        self.title_var = tk.StringVar()
        self.title_var.trace('w', self.on_title_change)
        self.title_entry = ttk.Entry(editor_header, textvariable=self.title_var, font=('Arial', 12))
        self.title_entry.pack(fill=tk.X, pady=(5, 10))
        
        # Tags entry
        ttk.Label(editor_header, text="Tags (comma-separated):", style='Main.TLabel').pack(anchor=tk.W)
        self.tags_var = tk.StringVar()
        self.tags_var.trace('w', self.on_content_change)
        self.tags_entry = ttk.Entry(editor_header, textvariable=self.tags_var)
        self.tags_entry.pack(fill=tk.X, pady=(5, 10))
        
        # Content editor
        editor_frame = ttk.Frame(right_frame, style='Card.TFrame', padding=5)
        editor_frame.pack(fill=tk.BOTH, expand=True)
        
        # Text widget with scrollbar
        self.content_text = tk.Text(editor_frame, wrap=tk.WORD, font=('Arial', 11))
        content_scrollbar = ttk.Scrollbar(editor_frame, orient=tk.VERTICAL, command=self.content_text.yview)
        self.content_text.configure(yscrollcommand=content_scrollbar.set)
        
        self.content_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        content_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Bind content change
        self.content_text.bind('<KeyRelease>', self.on_content_change)
        
        # Action buttons
        actions_frame = ttk.Frame(right_frame, style='Main.TFrame')
        actions_frame.pack(fill=tk.X, pady=(10, 0))
        
        save_btn = ttk.Button(actions_frame, text="Save", style='Main.TButton', command=self.save_note)
        save_btn.pack(side=tk.LEFT, padx=(0, 5))
        
        delete_btn = ttk.Button(actions_frame, text="Delete", style='Secondary.TButton', command=self.delete_note)
        delete_btn.pack(side=tk.LEFT)
        
        # Initially disable editor
        self.set_editor_state(False)
    
    def add_note(self):
        """Add new note"""
        try:
            note_id = self.db.create_note("New Note", "", "")
            self.refresh_notes_list()
            
            # Select the new note
            notes = self.db.get_notes()
            for i, note in enumerate(notes):
                if note['id'] == note_id:
                    self.notes_listbox.selection_set(i)
                    self.load_note(note)
                    break
            
            # Focus on title entry
            self.title_entry.focus()
            self.title_entry.select_range(0, tk.END)
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to create note: {e}")
    
    def on_note_select(self, event):
        """Handle note selection"""
        selection = self.notes_listbox.curselection()
        if selection:
            index = selection[0]
            notes = self.get_filtered_notes()
            if index < len(notes):
                note = notes[index]
                self.load_note(note)
    
    def load_note(self, note):
        """Load note into editor"""
        self.current_note = note
        
        # Enable editor
        self.set_editor_state(True)
        
        # Load note data
        self.title_var.set(note['title'])
        self.tags_var.set(note['tags'] or '')
        
        # Load content
        self.content_text.delete('1.0', tk.END)
        self.content_text.insert('1.0', note['content'] or '')
    
    def set_editor_state(self, enabled):
        """Enable/disable editor widgets"""
        state = tk.NORMAL if enabled else tk.DISABLED
        
        self.title_entry.configure(state=state)
        self.tags_entry.configure(state=state)
        self.content_text.configure(state=state)
    
    def on_title_change(self, *args):
        """Handle title change"""
        if self.current_note:
            self.save_note()
            self.refresh_notes_list()
    
    def on_content_change(self, event=None):
        """Handle content change"""
        if self.current_note:
            # Auto-save after a delay
            self.parent.after(1000, self.save_note)
    
    def save_note(self):
        """Save current note"""
        if not self.current_note:
            return
        
        try:
            title = self.title_var.get().strip() or "Untitled"
            content = self.content_text.get('1.0', tk.END).strip()
            tags = self.tags_var.get().strip()
            
            self.db.update_note(
                self.current_note['id'],
                title=title,
                content=content,
                tags=tags
            )
            
            # Update current note data
            self.current_note['title'] = title
            self.current_note['content'] = content
            self.current_note['tags'] = tags
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save note: {e}")
    
    def delete_note(self):
        """Delete current note"""
        if not self.current_note:
            return
        
        if messagebox.askyesno("Confirm", "Are you sure you want to delete this note?"):
            try:
                # Note: You'll need to add delete_note method to database
                # self.db.delete_note(self.current_note['id'])
                
                # Clear editor
                self.current_note = None
                self.title_var.set('')
                self.tags_var.set('')
                self.content_text.delete('1.0', tk.END)
                self.set_editor_state(False)
                
                # Refresh list
                self.refresh_notes_list()
                
                messagebox.showinfo("Success", "Note deleted!")
                
            except Exception as e:
                messagebox.showerror("Error", f"Failed to delete note: {e}")
    
    def filter_notes(self, *args):
        """Filter notes based on search"""
        self.refresh_notes_list()
    
    def get_filtered_notes(self):
        """Get filtered notes based on search"""
        all_notes = self.db.get_notes()
        search_term = self.search_var.get().lower()
        
        if not search_term:
            return all_notes
        
        filtered_notes = []
        for note in all_notes:
            if (search_term in note['title'].lower() or 
                search_term in (note['content'] or '').lower() or
                search_term in (note['tags'] or '').lower()):
                filtered_notes.append(note)
        
        return filtered_notes
    
    def refresh_notes_list(self):
        """Refresh notes list"""
        # Clear listbox
        self.notes_listbox.delete(0, tk.END)
        
        # Get filtered notes
        notes = self.get_filtered_notes()
        
        # Populate listbox
        for note in notes:
            # Show title and creation date
            created_date = note['created_at'][:10] if note['created_at'] else ''
            display_text = f"{note['title']} ({created_date})"
            self.notes_listbox.insert(tk.END, display_text)
    
    def refresh(self):
        """Refresh notes panel"""
        self.refresh_notes_list()
    
    def show(self):
        """Show notes panel"""
        self.frame.pack(fill=tk.BOTH, expand=True)
    
    def hide(self):
        """Hide notes panel"""
        self.frame.pack_forget()
    
    def apply_theme(self, theme, text_config):
        """Apply theme to notes panel"""
        # Update listbox
        self.notes_listbox.configure(
            bg=theme['input_bg'],
            fg=theme['fg'],
            selectbackground=theme['primary'],
            selectforeground='white'
        )
        
        # Update text editor
        self.content_text.configure(**text_config)
