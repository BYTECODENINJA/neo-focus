"""
Configuration management
"""

import json
import os
import logging

class ConfigManager:
    def __init__(self, config_file='config.json'):
        self.config_file = config_file
        self.config = {}
        self.logger = logging.getLogger(__name__)
        
        # Default configuration
        self.defaults = {
            'theme': 'purple',
            'font_size': 11,
            'autosave_enabled': True,
            'autosave_interval': 30,
            'notifications_enabled': True,
            'start_minimized': False,
            'window_width': 1400,
            'window_height': 900,
            'window_x': None,
            'window_y': None
        }
        
        self.load()
    
    def load(self):
        """Load configuration from file"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    self.config = json.load(f)
                self.logger.info("Configuration loaded successfully")
            else:
                self.config = self.defaults.copy()
                self.save()
                self.logger.info("Created default configuration")
                
        except Exception as e:
            self.logger.error(f"Failed to load configuration: {e}")
            self.config = self.defaults.copy()
    
    def save(self):
        """Save configuration to file"""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=2)
            self.logger.info("Configuration saved successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to save configuration: {e}")
    
    def get(self, key, default=None):
        """Get configuration value"""
        return self.config.get(key, default or self.defaults.get(key))
    
    def set(self, key, value):
        """Set configuration value"""
        self.config[key] = value
        self.save()
    
    def reset_to_defaults(self):
        """Reset configuration to defaults"""
        self.config = self.defaults.copy()
        self.save()
        self.logger.info("Configuration reset to defaults")
