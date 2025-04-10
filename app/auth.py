from flask import Blueprint, request, jsonify, session, current_app, redirect, url_for, flash, render_template
import os
import json
import uuid
import datetime
from functools import wraps
from pathlib import Path
from flask_login import LoginManager, login_user, logout_user, login_required, current_user

from app.models import db, User, Session, UserPreference

# Create a blueprint for authentication routes
auth = Blueprint('auth', __name__)

# Initialize LoginManager (will be configured in app factory)
login_manager = LoginManager()
login_manager.login_view = 'auth.login_page'  # Specify the login route

@login_manager.user_loader
def load_user(user_id):
    """Load user by ID for Flask-Login."""
    return User.query.get(int(user_id))

# Path to store user data (keeping for compatibility)
USER_DIR = Path(os.path.expanduser("~/.freethinkers/users/"))
USER_DIR.mkdir(parents=True, exist_ok=True)

@auth.route('/login', methods=['GET'])
def login_page():
    """Display the login page."""
    # If user is already logged in, redirect to home
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    # Check if user was just registered
    registered = request.args.get('registered', False)
    
    return render_template('login.html', registered=registered)

@auth.route('/register', methods=['GET'])
def register_page():
    """Display the registration page."""
    # If user is already logged in, redirect to home
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    return render_template('register.html')

@auth.route('/logout', methods=['GET'])
@login_required
def logout_page():
    """Logout and redirect to login page."""
    logout_user()
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('auth.login_page'))

@auth.route('/reset-password', methods=['GET'])
def reset_password_request():
    """Display the password reset request page."""
    # Placeholder for future implementation
    flash('Password reset functionality is not yet implemented.', 'info')
    return redirect(url_for('auth.login_page'))

@auth.route('/api/auth/guest-session', methods=['POST'])
def create_guest_session():
    """Create a guest session."""
    # Generate a unique guest ID
    guest_id = f"guest_{uuid.uuid4()}"
    
    # Create a session
    session_id = str(uuid.uuid4())
    
    # Store session info in database
    new_session = Session(
        session_id=session_id,
        is_guest=True
    )
    
    # Add user agent and IP if available
    if request.headers.get('User-Agent'):
        new_session.user_agent = request.headers.get('User-Agent')
    if request.remote_addr:
        new_session.ip_address = request.remote_addr
    
    # Set expiration (24 hours from now)
    new_session.expires_at = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    
    try:
        db.session.add(new_session)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
    # Set session cookie
    session['session_id'] = session_id
    session['guest_id'] = guest_id
    
    return jsonify({
        'message': 'Guest session created!',
        'session_id': session_id,
        'guest_id': guest_id
    }), 201

@auth.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user."""
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if username or email already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    # Create new user
    try:
        new_user = User(
            username=data['username'],
            email=data['email'],
            password=data['password']
        )
        
        # Create default preferences
        new_pref = UserPreference(user=new_user)
        
        db.session.add(new_user)
        db.session.add(new_pref)
        db.session.commit()
        
        # If guest data exists, we'll migrate it later
        
        return jsonify({
            'message': 'User registered successfully',
            'username': new_user.username
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth.route('/api/auth/login', methods=['POST'])
def login():
    """Login a user."""
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing username or password'}), 400
    
    # Find the user
    user = User.query.filter_by(username=data['username']).first()
    
    # Check if user exists and password is correct
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    # Update last login time
    user.last_login = datetime.datetime.utcnow()
    
    # Create a new session
    session_id = str(uuid.uuid4())
    new_session = Session(
        session_id=session_id,
        user_id=user.id,
        is_guest=False
    )
    
    # Add user agent and IP if available
    if request.headers.get('User-Agent'):
        new_session.user_agent = request.headers.get('User-Agent')
    if request.remote_addr:
        new_session.ip_address = request.remote_addr
    
    # Set session expiration (24 hours or 30 days if remember me)
    remember = data.get('remember', False)
    if remember:
        new_session.expires_at = datetime.datetime.utcnow() + datetime.timedelta(days=30)
    else:
        new_session.expires_at = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    
    try:
        db.session.add(new_session)
        db.session.commit()
        
        # Login the user with Flask-Login
        login_user(user, remember=remember)
        
        # Store session info
        session['session_id'] = session_id
        
        return jsonify({
            'message': 'Login successful',
            'username': user.username
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    """Logout a user."""
    try:
        # Get current session
        session_id = session.get('session_id')
        if session_id:
            # Mark session as expired
            current_session = Session.query.filter_by(session_id=session_id).first()
            if current_session:
                current_session.expires_at = datetime.datetime.utcnow()
                db.session.commit()
        
        # Clear Flask-Login session
        logout_user()
        
        # Clear Flask session
        session.clear()
        
        return jsonify({'message': 'Logout successful'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth.route('/api/auth/session', methods=['GET'])
def get_session_info():
    """Get current session information."""
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'username': current_user.username,
            'is_guest': False
        }), 200
    
    # Check for guest session
    if session.get('guest_id'):
        return jsonify({
            'authenticated': False,
            'username': 'Guest',
            'is_guest': True,
            'guest_id': session.get('guest_id')
        }), 200
    
    return jsonify({
        'authenticated': False,
        'is_guest': False
    }), 200