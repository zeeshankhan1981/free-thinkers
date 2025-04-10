#!/usr/bin/env python3
"""
Database initialization script for Free Thinkers.
Run this script to create the initial database structure.
"""

import os
import sys
from pathlib import Path
from flask import Flask
from app.models import db, User, Session, UserPreference
from config import config

# Create a minimal Flask app for database operations
app = Flask(__name__)

# Get configuration from environment or use development by default
config_name = os.environ.get('FLASK_ENV', 'development')
app.config.from_object(config[config_name])

# Initialize SQLAlchemy with the app
db.init_app(app)

def setup_database():
    """Create database tables."""
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print(f"Database initialized at: {app.config['SQLALCHEMY_DATABASE_URI']}")
        
        # Check if any users exist
        user_count = User.query.count()
        print(f"Number of users in database: {user_count}")
        
        if user_count == 0:
            print("Database is empty. You can now register users through the application.")

if __name__ == "__main__":
    setup_database()
