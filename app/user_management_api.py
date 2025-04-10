from flask import Blueprint, request, jsonify, current_app
import datetime
import os
import json
from pathlib import Path
from flask_login import login_required, current_user

from app.models import db, User, UserPreference

# Create a blueprint for user management routes
user_management_api = Blueprint('user_management_api', __name__)

# Path to store user preferences (keeping for compatibility)
USER_PREFS_DIR = Path(os.path.expanduser("~/.freethinkers/user_preferences/"))
USER_PREFS_DIR.mkdir(parents=True, exist_ok=True)

@user_management_api.route('/api/users/me', methods=['GET'])
def get_current_user():
    """Get current user profile info."""
    if current_user.is_authenticated:
        # Get user preferences
        preferences = {}
        if current_user.preferences:
            preferences = {
                'theme': current_user.preferences.theme,
                'default_model': current_user.preferences.default_model
            }
            
            # Parse preferred parameters if exists
            if current_user.preferences.preferred_parameters:
                try:
                    pref_params = json.loads(current_user.preferences.preferred_parameters)
                    preferences['preferred_parameters'] = pref_params
                except:
                    preferences['preferred_parameters'] = {}
        
        return jsonify({
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email,
            'is_guest': False,
            'preferences': preferences
        }), 200
    
    # If not authenticated, return guest info
    return jsonify({
        'id': 'guest',
        'username': 'Guest',
        'is_guest': True
    }), 200

@user_management_api.route('/api/users/me/preferences', methods=['PUT'])
@login_required
def update_preferences():
    """Update user preferences."""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    try:
        # Get or create user preferences
        preferences = current_user.preferences
        if not preferences:
            preferences = UserPreference(user_id=current_user.id)
            db.session.add(preferences)
        
        # Update theme if provided
        if 'theme' in data:
            preferences.theme = data['theme']
        
        # Update default model if provided
        if 'default_model' in data:
            preferences.default_model = data['default_model']
        
        # Update preferred parameters if provided
        if 'preferred_parameters' in data:
            preferences.preferred_parameters = json.dumps(data['preferred_parameters'])
        
        # Update timestamp
        preferences.updated_at = datetime.datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Preferences updated successfully',
            'preferences': {
                'theme': preferences.theme,
                'default_model': preferences.default_model,
                'preferred_parameters': json.loads(preferences.preferred_parameters) if preferences.preferred_parameters else {}
            }
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500