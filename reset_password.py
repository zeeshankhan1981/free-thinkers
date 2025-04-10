#!/usr/bin/env python3
"""
Script to reset the test user's password in the database.
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

def reset_test_user_password():
    """Reset the test user's password."""
    with app.app_context():
        # Find the test user
        user = User.query.filter_by(username='testuser').first()
        
        if not user:
            print("Test user not found. Creating a new test user.")
            # Create new test user
            new_user = User(
                username='testuser',
                email='test@example.com',
                password='password123'
            )
            
            # Create default preferences
            new_pref = UserPreference(user=new_user)
            
            db.session.add(new_user)
            db.session.add(new_pref)
            db.session.commit()
            
            print(f"Created new test user with username: testuser and password: password123")
        else:
            # Reset the password
            user.set_password('password123')
            db.session.commit()
            
            print(f"Reset password for user: {user.username}")
            print(f"New credentials:\nUsername: {user.username}\nPassword: password123")

if __name__ == "__main__":
    reset_test_user_password()
