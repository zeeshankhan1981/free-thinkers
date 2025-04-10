#!/usr/bin/env python3
"""
Create a test user for the Free Thinkers application.
"""

import os
import sys
from flask import Flask
from app.models import db, User, UserPreference
from config import config

# Create a minimal Flask app for database operations
app = Flask(__name__)

# Get configuration from environment or use development by default
config_name = os.environ.get('FLASK_ENV', 'development')
app.config.from_object(config[config_name])

# Initialize SQLAlchemy with the app
db.init_app(app)

def create_test_user(username, email, password):
    """Create a test user in the database."""
    with app.app_context():
        # Check if user already exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            print(f"User '{username}' already exists.")
            return False
        
        try:
            # Create new user
            new_user = User(
                username=username,
                email=email,
                password=password
            )
            
            # Create default preferences
            new_pref = UserPreference(user=new_user)
            
            db.session.add(new_user)
            db.session.add(new_pref)
            db.session.commit()
            
            print(f"Test user '{username}' created successfully!")
            print(f"Username: {username}")
            print(f"Password: {password}")
            print(f"Email: {email}")
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating test user: {e}")
            return False

if __name__ == "__main__":
    # Default test user credentials
    test_username = "testuser"
    test_email = "test@example.com"
    test_password = "password123"
    
    # Allow override from command line
    if len(sys.argv) >= 4:
        test_username = sys.argv[1]
        test_email = sys.argv[2]
        test_password = sys.argv[3]
    
    create_test_user(test_username, test_email, test_password)
