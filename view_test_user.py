#!/usr/bin/env python3
"""
Script to view the test user credentials in the database.
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

# Initialize database
db.init_app(app)

def view_users():
    """View all users in the database."""
    with app.app_context():
        users = User.query.all()
        print(f"Found {len(users)} users in database.")
        
        for user in users:
            print(f"\nUser ID: {user.id}")
            print(f"Username: {user.username}")
            print(f"Email: {user.email}")
            print(f"Is Active: {user.is_active}")
            print(f"Is Verified: {user.is_verified}")
            print(f"Created At: {user.created_at}")
            print(f"Last Login: {user.last_login}")
            
            # Show preferences if they exist
            if user.preferences:
                print("\nPreferences:")
                print(f"Theme: {user.preferences.theme}")
                print(f"Default Model: {user.preferences.default_model}")
                print(f"Other Preferences: {user.preferences.preferred_parameters}")
            else:
                print("\nNo preferences set.")

if __name__ == "__main__":
    view_users()
