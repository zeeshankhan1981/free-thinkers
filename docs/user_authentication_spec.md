# Free Thinkers: Multi-User Authentication System Specification

## Overview
This document outlines the specifications for implementing a flexible user authentication and account management system for Free Thinkers, allowing both guest usage and registered user accounts with enhanced features.

## Core Requirements

### 1. Authentication Modes

#### Guest Mode
- Allow immediate access without registration (current functionality)
- Generate an anonymous session ID for temporary chat history 
- Store conversations in browser local storage
- Provide a clear upgrade path to register and save existing chats
- Guest sessions expire after browser close or a set period (configurable, default 24 hours)

#### Registered User Mode
- Standard username/password authentication
- Secure password handling using bcrypt
- Session-based authentication with Flask-Login
- "Remember me" functionality
- OAuth integration as a future enhancement

### 2. User Management

#### Account Creation
- Simple registration form (username, email, password)
- Username availability checking
- Password strength requirements
- Terms of service and privacy policy acceptance
- Email verification (optional in initial implementation)

#### Profile Management
- Basic profile settings page
- Password change functionality
- Account preferences storage

#### Password Recovery
- Simple password reset mechanism
- Time-limited reset tokens

### 3. Authorization and Permissions

#### Basic Access Control
- User types: Guest, Registered User
- Feature access based on user type
- Admin features as future enhancement

#### Content Management
- Private conversations (default)
- Conversation organization (basic)

### 4. Data Management

#### Local-First Architecture
- Local SQLite database for user data
- File-based storage compatible with existing ~/.freethinkers structure
- Graceful migration of guest data to registered accounts

#### User Preferences
- Store basic UI preferences (dark/light mode, etc.)
- Model preferences and custom parameters
- Conversation history management

## Technical Implementation

### Frontend Components

#### Authentication UI
- Clean, accessible login/registration forms
- Modal-based authentication flow
- Persistent login state management

#### User Profile UI
- Simple profile settings page
- Basic preference management

#### Guest Experience
- Subtle indicators for guest status
- Periodic reminders to register (non-intrusive)
- One-click upgrade path that preserves data

### Backend Architecture

#### Authentication Service
- Flask-Login for session management
- Simple password hashing with bcrypt
- Basic rate limiting

#### User Data Management
- SQLite database with option to migrate to PostgreSQL later
- Simple user and conversation models
- Compatible with existing file structure

#### Security Implementation
- HTTPS for production environments
- CSRF protection via Flask
- Secure password storage

## Database Schema (SQLite)

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT 1,
    is_verified BOOLEAN DEFAULT 0
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_guest BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);
```

### User Preferences Table
```sql
CREATE TABLE user_preferences (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
    theme VARCHAR(20) DEFAULT 'light',
    default_model VARCHAR(50),
    preferred_parameters TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Implementation Phases

### Phase 1: Foundation (2 weeks)
- SQLite database setup
- Basic authentication backend
- User registration and login flows
- Session management with Flask-Login
- Simple profile page

### Phase 2: User Experience (2 weeks)
- Basic profile management UI
- Preference storage
- Guest-to-registered conversion
- Conversation history integration

### Phase 3: Enhancements (Optional)
- Email verification
- Password reset functionality
- Basic sharing mechanisms

## Security Considerations

### Data Protection
- Store only hashed passwords (bcrypt)
- Apply principle of least privilege
- Regular security audits

### Authentication Security
- Prevent brute force attacks with basic rate limiting
- Use secure, HTTP-only cookies for sessions
- Apply basic CORS policies

## User Experience Guidelines

### Authentication Flow
- Minimize friction in the registration process
- Provide clear error messages
- Make the value proposition for registration clear

### Guest Experience
- Don't interrupt the core experience
- Provide clear benefits for registration
- Make data migration seamless
- Allow full core functionality without registration

### Registered User Benefits
- Data persistence guarantees
- Customization options

## API Endpoints

### Authentication Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/session
```

### User Management Endpoints
```
GET  /api/users/me
PUT  /api/users/me/preferences
```

## Testing Requirements

### Authentication Testing
- Basic unit tests for auth functionality
- Integration tests for user flows
- Security validation

## Compatibility Notes

This authentication system is designed to seamlessly integrate with the existing Free Thinkers application architecture:

- Works with the current file-based history system
- Maintains compatibility with the current Flask backend
- Uses the existing static file structure
- Preserves the same UI framework