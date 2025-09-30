"""
Theme management for the application
"""

class ThemeManager:
    def __init__(self, config):
        self.config = config
        self.current_theme = config.get('theme', 'purple')
        
        # Define themes
        self.themes = {
            'purple': {
                'name': 'Purple Theme',
                'bg': '#f8fafc',
                'fg': '#1e293b',
                'primary': '#8b5cf6',
                'primary_hover': '#7c3aed',
                'primary_pressed': '#6d28d9',
                'secondary': '#64748b',
                'secondary_bg': '#e2e8f0',
                'card_bg': '#ffffff',
                'sidebar_bg': '#f1f5f9',
                'input_bg': '#ffffff',
                'border': '#e2e8f0',
                'success': '#10b981',
                'warning': '#f59e0b',
                'error': '#ef4444',
                'info': '#3b82f6'
            },
            'dark': {
                'name': 'Black Theme',
                'bg': '#000000',
                'fg': '#e2e8f0',
                'primary': '#8b5cf6',
                'primary_hover': '#7c3aed',
                'primary_pressed': '#6d28d9',
                'secondary': '#64748b',
                'secondary_bg': '#1a1a1a',
                'card_bg': '#0a0a0a',
                'sidebar_bg': '#050505',
                'input_bg': '#1a1a1a',
                'border': '#333333',
                'success': '#10b981',
                'warning': '#f59e0b',
                'error': '#ef4444',
                'info': '#3b82f6'
            }
        }
    
    def get_current_theme(self):
        """Get current theme colors"""
        return self.themes.get(self.current_theme, self.themes['purple'])
    
    def set_theme(self, theme_name):
        """Set current theme"""
        if theme_name in self.themes:
            self.current_theme = theme_name
            self.config.set('theme', theme_name)
    
    def toggle_theme(self):
        """Toggle between light and dark themes"""
        if self.current_theme == 'purple':
            self.set_theme('dark')
        else:
            self.set_theme('purple')
    
    def get_theme_names(self):
        """Get list of available theme names"""
        return list(self.themes.keys())
