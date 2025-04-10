# Free Thinkers API Reference

## Authentication API

### POST /api/auth/register

#### Description
Register a new user account.

#### Request
```json
{
    "username": "string",
    "email": "string",
    "password": "string"
}
```

#### Response
```json
{
    "message": "User registered successfully",
    "user_id": "integer"
}
```

### POST /api/auth/login

#### Description
Authenticate an existing user.

#### Request
```json
{
    "username": "string",
    "password": "string"
}
```

#### Response
```json
{
    "message": "Login successful",
    "user_id": "integer"
}
```

### POST /api/auth/logout

#### Description
Logout the current user.

#### Response
```json
{
    "message": "Logged out successfully"
}
```

### GET /api/auth/session

#### Description
Get current session information.

#### Response
```json
{
    "user_id": "integer",
    "username": "string",
    "is_authenticated": "boolean"
}
```

## User Management API

### GET /api/user/profile

#### Description
Get the current user's profile information.

#### Response
```json
{
    "user": {
        "id": "integer",
        "username": "string",
        "email": "string",
        "preferences": {
            "theme": "string",
            "default_model": "string",
            "other_preferences": "object"
        }
    }
}
```

### PUT /api/user/preferences

#### Description
Update user preferences.

#### Request
```json
{
    "preferences": {
        "theme": "string",
        "default_model": "string",
        "other_preferences": "object"
    }
}
```

#### Response
```json
{
    "message": "Preferences updated successfully"
}
```

## Model Management API

### GET /api/models

#### Description
Fetches a list of available models with their metadata.

#### Response
```json
{
    "models": [
        {
            "id": "llama2-7b",
            "name": "LLaMA 2",
            "size": "7B",
            "family": "Llama",
            "status": "ready",
            "parameters": {
                "temperature": 0.7,
                "top_p": 0.9,
                "top_k": 40
            }
        }
    ]
}
```

### POST /api/models/download

#### Description
Downloads a new model from the registry.

#### Request
```json
{
    "model_id": "llama2-7b",
    "source": "registry"
}
```

#### Response
```json
{
    "status": "downloading",
    "progress": 0.0,
    "eta": "PT10M",
    "speed": "50MB/s"
}
```

### GET /api/models/{model_id}/status

#### Description
Gets the current status of a model download.

#### Response
```json
{
    "status": "downloading",
    "progress": 0.45,
    "eta": "PT5M",
    "speed": "45MB/s"
}
```

## Chat API

### POST /api/generate

#### Description
Generates a response from the selected model.

#### Request
```json
{
    "model": "llama2-7b",
    "prompt": "Write a story about...",
    "parameters": {
        "temperature": 0.7,
        "top_p": 0.9,
        "top_k": 40
    }
}
```

#### Response
```json
{
    "response": "Once upon a time...",
    "usage": {
        "tokens": 150,
        "time": "PT2S"
    }
}
```

### GET /api/conversations/{conversation_id}

#### Description
Retrieves a conversation history.

#### Response
```json
{
    "conversation": {
        "id": "conv_123",
        "messages": [
            {
                "role": "user",
                "content": "Hello",
                "timestamp": "2025-04-06T08:14:23-04:00"
            },
            {
                "role": "assistant",
                "content": "Hi there!",
                "timestamp": "2025-04-06T08:14:24-04:00"
            }
        ]
    }
}
```

## Error Responses

### Common Error Formats

#### Model Not Found
```json
{
    "error": {
        "code": "MODEL_NOT_FOUND",
        "message": "Model not found",
        "details": {
            "model_id": "llama2-7b"
        }
    }
}
```

#### Download Failed
```json
{
    "error": {
        "code": "DOWNLOAD_FAILED",
        "message": "Failed to download model",
        "details": {
            "model_id": "llama2-7b",
            "error_type": "NETWORK_ERROR"
        }
    }
}
```

## WebSocket API

### Connection
```javascript
const socket = new WebSocket('ws://localhost:5000/ws');
```

### Events

#### Model Status Updates
```javascript
{
    "type": "model_status",
    "data": {
        "model_id": "llama2-7b",
        "status": "downloading",
        "progress": 0.45
    }
}
```

#### Chat Updates
```javascript
{
    "type": "chat_update",
    "data": {
        "conversation_id": "conv_123",
        "message": {
            "role": "assistant",
            "content": "Hi there!"
        }
    }
}
```

## Authentication

### API Keys
```javascript
const apiKey = 'your_api_key';
const headers = {
    'Authorization': `Bearer ${apiKey}`
};
```

### Session Management
```javascript
const session = {
    'user_id': 'user_123',
    'expires_at': '2025-04-07T08:14:23-04:00'
};
```

## Rate Limiting

### Request Limits
- 100 requests per minute
- 1000 requests per hour
- 10000 requests per day

### Rate Limit Response
```json
{
    "error": {
        "code": "RATE_LIMIT_EXCEEDED",
        "message": "Rate limit exceeded",
        "details": {
            "limit": 100,
            "reset_in": "PT1M"
        }
    }
}
```

## Caching

### Response Caching
```javascript
{
    "cache": {
        "status": "HIT",
        "ttl": "PT1H",
        "size": "10KB"
    }
}
```

### Model Caching
```javascript
{
    "cache": {
        "status": "HIT",
        "ttl": "PT24H",
        "size": "7GB"
    }
}
```

## Performance Metrics

### Response Times
```javascript
{
    "metrics": {
        "response_time": "PT2S",
        "tokens_per_second": 50,
        "memory_usage": "10GB"
    }
}
```

### Model Performance
```javascript
{
    "metrics": {
        "inference_time": "PT1S",
        "gpu_utilization": 85,
        "memory_usage": "7GB"
    }
}
```

## Security

### API Security
- HTTPS required
- Rate limiting
- API key validation
- Request signing

### Data Security
- Encrypted storage
- Secure transmission
- Access control
- Audit logging
