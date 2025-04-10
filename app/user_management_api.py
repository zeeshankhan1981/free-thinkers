from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from app.models import db, User, UserPreferences, Conversation
from datetime import datetime
import os
from pathlib import Path

# Create a blueprint for user management routes
user_management_api = Blueprint('user_management_api', __name__)

# Path to store user preferences
USER_PREFS_DIR = Path(os.path.expanduser("~/.freethinkers/user_preferences/"))
USER_PREFS_DIR.mkdir(parents=True, exist_ok=True)

@user_management_api.route('/api/users/me', methods=['GET'])
@login_required
def get_current_user():
    """Get current user profile - minimal implementation."""
    return jsonify({
        'id': current_user.id,
        'username': current_user.username,
        'email': current_user.email,
        'created_at': current_user.created_at.isoformat(),
        'last_login': current_user.last_login.isoformat() if current_user.last_login else None,
        'is_admin': current_user.is_admin,
        'is_active': current_user.is_active
    }), 200

@user_management_api.route('/api/users/me/preferences', methods=['GET'])
@login_required
def get_user_preferences():
    preferences = current_user.preferences
    if not preferences:
        return jsonify({
            'theme': 'light',
            'model_preferences': {},
            'conversation_settings': {}
        }), 200
    
    return jsonify({
        'theme': preferences.theme,
        'model_preferences': preferences.model_preferences or {},
        'conversation_settings': preferences.conversation_settings or {}
    }), 200

@user_management_api.route('/api/users/me/preferences', methods=['PUT'])
@login_required
def update_user_preferences():
    data = request.get_json()
    preferences = current_user.preferences
    
    if not preferences:
        preferences = UserPreferences(user_id=current_user.id)
        db.session.add(preferences)
    
    if 'theme' in data:
        preferences.theme = data['theme']
    if 'model_preferences' in data:
        preferences.model_preferences = data['model_preferences']
    if 'conversation_settings' in data:
        preferences.conversation_settings = data['conversation_settings']
    
    db.session.commit()
    return jsonify({'message': 'Preferences updated successfully'}), 200

@user_management_api.route('/api/users/me/conversations', methods=['GET'])
@login_required
def get_user_conversations():
    conversations = current_user.conversations.order_by(Conversation.updated_at.desc()).all()
    return jsonify([{
        'id': conv.id,
        'title': conv.title,
        'created_at': conv.created_at.isoformat(),
        'updated_at': conv.updated_at.isoformat(),
        'is_private': conv.is_private,
        'tags': conv.tags
    } for conv in conversations]), 200

@user_management_api.route('/api/users/me/profile', methods=['PUT'])
@login_required
def update_profile():
    data = request.get_json()
    
    if 'username' in data and data['username'] != current_user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        current_user.username = data['username']
    
    if 'email' in data and data['email'] != current_user.email:
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        current_user.email = data['email']
    
    if 'password' in data:
        current_user.set_password(data['password'])
    
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'}), 200