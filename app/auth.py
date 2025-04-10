from flask import Blueprint, request, jsonify, session, current_app
from flask_login import login_user, logout_user, login_required, current_user
from app.models import db, User
import bcrypt
import datetime
import jwt
from functools import wraps
import uuid
import os

# Create a blueprint for authentication routes
auth = Blueprint('auth', __name__)

# JWT configuration
JWT_SECRET = os.urandom(24)
JWT_EXPIRATION = 24 * 60 * 60  # 24 hours

# Session management
def create_session(user):
    session['user_id'] = user.id
    session['username'] = user.username
    session['is_guest'] = False
    user.last_login = datetime.datetime.utcnow()
    db.session.commit()

def generate_jwt(user):
    payload = {
        'user_id': user.id,
        'username': user.username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

@auth.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    user = User(
        username=data['username'],
        email=data['email']
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    create_session(user)
    token = generate_jwt(user)
    
    return jsonify({
        'message': 'Registration successful',
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }), 201

@auth.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    
    if not user or not user.check_password(data.get('password')):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is inactive'}), 403
    
    create_session(user)
    token = generate_jwt(user)
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }), 200

@auth.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200

@auth.route('/api/auth/guest-session', methods=['POST'])
def create_guest_session():
    guest_id = f"guest_{uuid.uuid4()}"
    session['user_id'] = guest_id
    session['is_guest'] = True
    return jsonify({
        'message': 'Guest session created',
        'guest_id': guest_id
    }), 201

@auth.route('/api/auth/verify-token', methods=['GET'])
def verify_token():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'error': 'No token provided'}), 401
    
    try:
        data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return jsonify({'valid': True, 'user_id': data['user_id']}), 200
    except:
        return jsonify({'valid': False}), 401

# Token required decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
            
            if not current_user.is_active:
                return jsonify({'error': 'Account is inactive'}), 403
            
        except:
            return jsonify({'error': 'Token is invalid'}), 401
        
        return f(*args, **kwargs)
    return decorated