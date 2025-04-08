from flask import Blueprint, request, jsonify, session, current_app
import os
import json
import uuid
import datetime
from functools import wraps
from pathlib import Path

# Create a blueprint for authentication routes
auth = Blueprint('auth', __name__)

# Path to store user data
USER_DIR = Path(os.path.expanduser("~/.freethinkers/users/"))
USER_DIR.mkdir(parents=True, exist_ok=True)

# In-memory user and session stores
users = {}
sessions = {}

# Simple JWT simulation (no actual JWT required for now)
jwt_secret = os.urandom(24)

@auth.route('/api/auth/guest-session', methods=['POST'])
def create_guest_session():
    """Create a guest session."""
    # Generate a unique guest ID
    guest_id = f"guest_{uuid.uuid4()}"
    
    # Create a session
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        'user_id': guest_id,
        'username': 'Guest',
        'created_at': datetime.datetime.utcnow().isoformat(),
        'expires_at': (datetime.datetime.utcnow() + datetime.timedelta(hours=24)).isoformat(),
        'is_guest': True
    }
    
    # Set session cookie
    session['session_id'] = session_id
    session['guest_id'] = guest_id
    
    return jsonify({
        'message': 'Guest session created!',
        'session_id': session_id,
        'guest_id': guest_id
    }), 201