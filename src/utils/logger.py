"""
Logging configuration
"""

import logging
import os
from datetime import datetime

def setup_logger(log_level=logging.INFO):
    """Setup application logging"""
    
    # Create logs directory if it doesn't exist
    log_dir = 'logs'
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    # Create log filename with date
    log_filename = os.path.join(log_dir, f"aura_focus_{datetime.now().strftime('%Y%m%d')}.log")
    
    # Configure logging
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_filename),
            logging.StreamHandler()  # Also log to console
        ]
    )
    
    # Create logger
    logger = logging.getLogger('aura_focus')
    logger.info("Logging system initialized")
    
    return logger
