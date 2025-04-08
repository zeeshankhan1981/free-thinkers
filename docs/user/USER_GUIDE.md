# Free Thinkers User Guide

## Introduction
Free Thinkers is a local-first language model chat interface that allows you to interact with various AI models directly on your machine without relying on cloud services.

## Getting Started

### Prerequisites
- macOS (Apple Silicon recommended)
- Python 3.13+
- Ollama 0.6.2+

### Installation
1. Clone the repository:
```bash
git clone https://github.com/zeeshankhan1981/free-thinkers.git
cd free-thinkers
```

2. Create and activate virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the servers:
```bash
./start_servers.sh
```

## Using Free Thinkers

### Model Management
Free Thinkers features a comprehensive model management system:

#### Model Categories
Models are automatically categorized by family:
- Llama (3.x, 2.x)
- Mistral
- Gemma
- Phi
- Zephyr

#### Model Features
- Real-time progress tracking for downloads
- Speed and ETA estimation
- Visual badges for model types
- Persistent settings across sessions

### Conversation Features
- Real-time responses with loading indicators
- Model-specific parameter optimization
- Context-aware prompt generation
- Conversation history management

### Settings
- Model-specific parameter tuning
- Custom presets
- Usage statistics
- Performance optimization settings

### Authentication & User Management

#### Account Types
- **Guest Mode**: Immediate access with local storage
- **Registered User**: Full access with account features

#### Authentication Methods
- Email/password login
- OAuth2 social login
- "Remember me" option for persistent sessions

#### Account Management
- Profile settings
- Password management
- Email verification
- Session management
- Usage statistics

#### Security Features
- Secure password hashing
- JWT-based session management
- Role-based access control
- Audit logging

## Troubleshooting

### Common Issues
1. **Slow Responses**
   - Check model parameters
   - Reduce context window
   - Verify GPU acceleration

2. **Model Download Issues**
   - Check internet connection
   - Verify disk space
   - Check progress tracking

3. **Performance Issues**
   - Adjust model parameters
   - Use smaller models
   - Enable GPU acceleration

## Tips and Best Practices

### Model Usage
- Use smaller models for quick tasks
- Larger models for complex reasoning
- Adjust parameters based on task
- Monitor usage statistics

### Performance Optimization
- Enable GPU acceleration
- Adjust context window
- Use appropriate model size
- Monitor system resources
