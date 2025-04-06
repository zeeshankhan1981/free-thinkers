# Free Thinkers Developer Guide

## Architecture Overview

### Core Components

#### Frontend
- Modern HTML5/CSS3 interface
- Responsive design with mobile optimization
- Real-time communication using Flask-SocketIO
- Progressive Web App (PWA) capabilities

#### Backend
- Flask REST API
- Ollama integration
- Model management system
- Persistent storage for settings

### API Structure

#### Model Management
```python
# Get available models
GET /api/models

# Download new model
POST /api/models/download

# Get model status
GET /api/models/{model_id}/status

# Update model parameters
PUT /api/models/{model_id}/parameters
```

#### Conversation API
```python
# Generate response
POST /api/generate

# Get conversation history
GET /api/conversations/{conversation_id}

# Update conversation settings
PUT /api/conversations/{conversation_id}/settings
```

### Development Setup

1. Clone the repository
2. Set up virtual environment
3. Install development dependencies:
```bash
pip install -r requirements-dev.txt
```

### Code Structure
```
free-thinkers/
├── app/
│   ├── __init__.py
│   ├── routes/
│   │   ├── model_routes.py
│   │   └── chat_routes.py
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── assets/
│   └── templates/
├── docs/
├── tests/
└── utils/
```

## Development Guidelines

### Code Style
- Follow PEP 8 guidelines
- Use type hints
- Write comprehensive docstrings
- Maintain consistent naming

### Testing
- Write unit tests for API endpoints
- Test model management
- Verify UI components
- Check performance metrics

### Deployment

#### Local Development
```bash
# Start development server
FLASK_ENV=development FLASK_DEBUG=1 python app.py

# Run tests
python -m pytest

# Lint code
flake8 .
```

#### Production
```bash
# Build for production
python setup.py build

# Deploy
python setup.py deploy
```

## Contributing

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Submit a pull request
4. Wait for review

### Code Review
- Follow coding standards
- Test thoroughly
- Document changes
- Update documentation

## API Reference

### Model Management Endpoints

#### GET /api/models
- Returns list of available models
- Includes model metadata
- Caches results for performance

#### POST /api/models/download
- Downloads new model
- Tracks progress
- Provides ETA
- Handles errors gracefully

#### GET /api/models/{model_id}/status
- Returns model status
- Includes download progress
- Shows error state
- Provides ETA

### Chat API Endpoints

#### POST /api/generate
- Generates response
- Handles streaming
- Manages context
- Optimizes parameters

#### GET /api/conversations/{conversation_id}
- Retrieves conversation history
- Includes metadata
- Supports pagination
- Handles errors

## Error Handling

### Common Error Codes
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error
- 503: Service Unavailable

### Error Response Format
```json
{
    "error": {
        "code": "MODEL_DOWNLOAD_FAILED",
        "message": "Failed to download model",
        "details": {
            "model_id": "llama2-7b",
            "error_type": "NETWORK_ERROR"
        }
    }
}
```
