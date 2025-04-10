import os
import secrets
from pathlib import Path

# Base directory of the application
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# User data directory (keeping consistent with existing app)
USER_DATA_DIR = Path(os.path.expanduser("~/.freethinkers/"))

# Ensure user data directory exists
USER_DATA_DIR.mkdir(parents=True, exist_ok=True)

class Config:
    """Base configuration class."""
    # Generate a secret key for sessions and CSRF protection
    SECRET_KEY = os.environ.get('SECRET_KEY') or secrets.token_hex(32)
    
    # SQLite database path (in the user data directory)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        f'sqlite:///{USER_DATA_DIR}/freethinkers.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Session configuration
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = True
    PERMANENT_SESSION_LIFETIME = 86400  # 24 hours in seconds

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    
class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    
class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
