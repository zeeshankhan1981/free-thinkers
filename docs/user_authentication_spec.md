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
- Optional OAuth integration (Google, GitHub, etc.)
- Secure password handling using bcrypt with appropriate rounds
- JWT-based authentication with refresh token rotation
- "Remember me" functionality

### 2. User Management

#### Account Creation
- Simple registration form (username, email, password)
- Email verification flow
- Username availability checking
- Password strength requirements
- Terms of service and privacy policy acceptance

#### Profile Management
- Profile settings page
- Password change functionality
- Email update with verification
- Account deletion option (with data handling options)
- Profile picture upload (with optimization for multimodal models)

#### Password Recovery
- Secure password reset via email
- Time-limited reset tokens
- Account recovery options

### 3. Authorization and Permissions

#### Role-Based Access Control
- User roles: Guest, Standard User, Premium User, Admin
- Feature access based on role
- Admin panel for user management

#### Content Permissions
- Private conversations (default)
- Shared conversations with specific users
- Public conversations option (community sharing)
- Fine-grained permission control for shared content

### 4. Data Management

#### Conversation Syncing
- Seamless migration from guest to registered account
- Real-time conversation syncing across devices
- Offline support with sync on reconnect
- Conflict resolution strategy

#### User Preferences
- Store and sync UI preferences (dark/light mode, etc.)
- Model preferences and custom parameters
- Conversation organization preferences (folders, tags)

#### Analytics & Usage
- Track usage metrics by user (optional, with consent)
- Model usage statistics
- Performance metrics for personal optimization

## Technical Implementation

### Frontend Components

#### Authentication UI
- Clean, accessible login/registration forms
- Modal-based authentication flow
- Social login buttons (for OAuth providers)
- Persistent login state management
- Session timeout handling

#### User Profile UI
- Profile settings page
- Account management options
- Preference management interface
- Usage statistics and visualizations

#### Guest Experience
- Subtle indicators for guest status
- Periodic reminders to register (non-intrusive)
- One-click upgrade path that preserves data

### Backend Architecture

#### Authentication Service
- Flask-based authentication API endpoints
- JWT token handling and validation
- Session management
- Rate limiting and security measures

#### User Data Management
- User database schema (PostgreSQL recommended)
- Conversation data model with ownership and sharing
- Preference storage and retrieval
- Data migration mechanisms

#### Security Implementation
- HTTPS enforcement
- CSRF protection
- XSS prevention
- Rate limiting for login attempts
- Secure headers implementation

## API Endpoints

### Authentication Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh-token
POST /api/auth/logout
POST /api/auth/password-reset
POST /api/auth/verify-email
GET  /api/auth/session
```

### User Management Endpoints
```
GET    /api/users/me
PUT    /api/users/me
DELETE /api/users/me
PUT    /api/users/me/password
PUT    /api/users/me/email
POST   /api/users/me/avatar
```

### Admin Endpoints
```
GET    /api/admin/users
GET    /api/admin/users/{id}
PUT    /api/admin/users/{id}
DELETE /api/admin/users/{id}
GET    /api/admin/stats
```

### Conversation Management with Auth
```
GET    /api/conversations
POST   /api/conversations
GET    /api/conversations/{id}
PUT    /api/conversations/{id}
DELETE /api/conversations/{id}
POST   /api/conversations/{id}/share
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'standard',
    refresh_token VARCHAR(255),
    refresh_token_expires_at TIMESTAMP WITH TIME ZONE
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_guest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45),
    user_agent TEXT
);
```

### Conversations Table
```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) REFERENCES sessions(session_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT FALSE,
    folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL,
    model_used VARCHAR(50)
);
```

### Messages Table
```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    has_image BOOLEAN DEFAULT FALSE,
    image_path VARCHAR(255)
);
```

### Shared Conversations Table
```sql
CREATE TABLE shared_conversations (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    permission_level VARCHAR(20) DEFAULT 'read',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### User Preferences Table
```sql
CREATE TABLE user_preferences (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
    theme VARCHAR(20) DEFAULT 'light',
    default_model VARCHAR(50),
    preferred_parameters JSONB,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Implementation Phases

### Phase 1: Foundation (2 weeks)
- Basic authentication backend
- User registration and login flows
- Session management
- Database setup
- Simple profile page

### Phase 2: Enhanced Authentication (1 week)
- OAuth integration
- Email verification
- Password reset
- Security hardening

### Phase 3: User Experience (2 weeks)
- Profile management UI
- Preference syncing
- Guest-to-registered conversion
- Multi-device syncing

### Phase 4: Sharing & Collaboration (2 weeks)
- Conversation sharing mechanics
- Permission system
- Public/private conversation controls
- Collaborative features

### Phase 5: Admin & Analytics (1 week)
- Admin panel
- Usage statistics
- User management tools
- System monitoring

## Security Considerations

### Data Protection
- Store only hashed passwords (bcrypt)
- Encrypt sensitive user data
- Apply principle of least privilege
- Regular security audits

### Authentication Security
- Prevent brute force attacks with rate limiting
- Implement account lockout after failed attempts
- Use secure, HTTP-only cookies for tokens
- Apply strong CORS policies

### Compliance
- GDPR-compliant data handling
- Clear privacy policy
- Data export functionality
- Right to be forgotten implementation

## User Experience Guidelines

### Authentication Flow
- Minimize friction in the registration process
- Provide clear error messages
- Offer social login options for convenience
- Make the value proposition for registration clear

### Guest Experience
- Don't interrupt the core experience
- Provide clear benefits for registration
- Make data migration seamless
- Allow full core functionality without registration

### Registered User Benefits
- Cross-device syncing
- Data persistence guarantees
- Advanced features (sharing, folders, etc.)
- Customization options

## Testing Requirements

### Authentication Testing
- Unit tests for all authentication endpoints
- Integration tests for auth flows
- Security testing (pen testing)
- Load testing for authentication services

### User Flow Testing
- Guest user journey testing
- Registered user journey testing
- Conversion flow testing
- Edge cases (account recovery, etc.)

### Security Testing
- Vulnerability scanning
- Token security validation
- Password policy enforcement
- XSS/CSRF protection verification

## Monitoring and Maintenance

### Performance Monitoring
- Authentication service response times
- Database query performance
- Token validation efficiency
- Session management overhead

### Security Monitoring
- Failed login attempts
- Unusual access patterns
- Token usage anomalies
- Regular security scans

## Extensions and Future Considerations

### Enterprise Features
- SSO integration
- Team accounts
- Role hierarchies
- Audit logging

### Advanced Collaboration
- Real-time collaboration on conversations
- Comment threads on responses
- Annotations and bookmarks
- Team spaces

### Marketplace Integration
- Premium account tiers
- Subscription management
- Payment processing
- Usage-based billing