# Free Thinkers

A minimalist, local-first web-based chat interface for interacting with LLMs.

## Features

- Clean, intuitive interface
- Multiple LLM models with GPU acceleration:
  - Mistral 7B - Fast, general-purpose tasks
  - Llama 3.2 - Versatile, instruction-following tasks
  - Gemma 2B - Creative writing and artistic responses
- Comprehensive model management and parameter controls
- Dark/Light mode toggle
- Conversation history management
- Token and character limit indicators
- Responsive design

## Requirements

- Python 3.8+
- Flask
- Ollama
- Modern web browser

## Installation

1. Clone the repository:
```bash
git clone https://github.com/zeeshankhan1981/free-thinkers.git
cd free-thinkers
```

2. Create and activate a virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the servers (see `start_servers.sh` for automated setup):
   - Start Ollama: `ollama serve`
   - Start Flask app: `python app.py`

## Usage

1. Open your web browser and navigate to `http://localhost:5000`
2. Select a model from the dropdown
3. Type your message and click Send
4. Toggle between light and dark mode using the theme switch
5. Manage your conversations using the conversation manager
6. Configure model parameters to optimize responses

## Technical Specifications

### Technical Stack

#### Frontend
- **Framework**: Pure HTML/CSS/JavaScript (no React)
- **UI Library**: Bootstrap 5.3
- **Design**: Flat monochrome design with light/dark mode support
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari)

#### Backend
- **Framework**: Flask 3.1.0
- **Python Version**: 3.8+
- **API**: RESTful endpoints with JSON responses
- **CORS**: Enabled for localhost

#### LLM Integration
- **Model Manager**: Ollama 0.6.2
- **Models**: 
  - Mistral 7B (Q4_K_M)
  - Llama 3.2
  - Gemma 2B (Italian)
- **GPU Acceleration**: Metal for Apple Silicon
  - Environment Variables: OLLAMA_USE_METAL=true, OLLAMA_METAL=true, OLLAMA_RAM=8G
  - API Optimization: num_gpu=1, num_thread=6, f16_kv=true

#### Storage
- **Method**: JSON flat file storage
- **Location**: `~/.freethinkers/history/`
- **Format**: Thread-based JSON files with UUIDs

### API Endpoints

#### Chat Endpoint
```http
POST /api/chat
Content-Type: application/json

{
    "message": "string",
    "model": "enum[mistral-7b, llama3.2, gemma-2b-it]",
    "system_prompt": "optional string"
}
```

#### History Endpoints
```http
GET /api/history
Content-Type: application/json

{
    "threads": [
        {
            "id": "uuid",
            "model": "string",
            "messages": [
                {
                    "role": "enum[user, assistant]",
                    "content": "string"
                }
            ],
            "created_at": "ISO8601 timestamp"
        }
    ]
}
```

### Model Specifications

| Model | Parameters | Quantization | Max Context | Max Response |
|-------|------------|--------------|-------------|-------------|
| Mistral 7B | 7.2B | Q4_K_M | 4096 | 2048 |
| Llama 3.2 | 8.0B | Q4_K_M | 8192 | 4096 |
| Gemma 2B | 2.5B | - | 2048 | 1024 |

## Model Management System

The model management system in Free Thinkers serves several important purposes:

1. **Discovery and Selection**: Browse and select from available AI models based on your needs
2. **Model Information**: View detailed information about each model including size, capabilities, and optimal use cases
3. **Parameter Control**: Fine-tune model behavior through adjustable parameters
4. **Model Organization**: Categorize and organize models by type or purpose
5. **Usage Tracking**: Track model usage patterns to optimize your workflow

### Available Models

Free Thinkers supports multiple language models, each with its own strengths:

#### Gemma 3
- **gemma3:4b**: 4B parameter model optimized for general conversation and text generation
- **gemma3:1b**: Lightweight 1B parameter variant, ideal for resource-constrained environments
- **gemma-2b-it:latest**: Italian language specialized model with 2B parameters

#### Llama 3
- **llama3.1:8b**: 8B parameter model with enhanced reasoning capabilities
- **llama3.2:latest**: Latest version with improved performance and context understanding

#### Specialized Models
- **llama2-uncensored:7b**: 7B parameter model optimized for uncensored content generation
- **phi3:3.8b**: 3.8B parameter model with specialized training for various tasks
- **mistral-7b:latest**: Latest version of the Mistral model with 7B parameters
- **zephyr:latest**: Latest version of the Zephyr model, optimized for conversation

### Model Parameters

#### Temperature
- Controls the randomness of the model's output
- Range: 0.0 to 1.0
- Lower values (e.g., 0.2) make the output more deterministic and focused
- Higher values (e.g., 0.9) make the output more creative and varied
- Default: 0.7

#### Top P (Nucleus Sampling)
- Controls the diversity of the model's output by sampling from the top P% of the probability distribution
- Range: 0.0 to 1.0
- Lower values (e.g., 0.5) make the output more focused and deterministic
- Higher values (e.g., 0.9) make the output more diverse and creative
- Default: 0.95

#### Top K
- Controls the diversity of the model's output by sampling from the top K most likely tokens
- Range: 1 to 100
- Lower values (e.g., 10) make the output more focused and deterministic
- Higher values (e.g., 50) make the output more diverse and creative
- Default: 40

#### Repetition Penalty
- Controls how much the model penalizes repeated tokens
- Range: 1.0 to 2.0
- Lower values (e.g., 1.0) allow more repetition
- Higher values (e.g., 1.5) discourage repetition
- Default: 1.1

#### Context Window
- Controls the maximum number of tokens the model can remember
- Range: 1024 to 4096
- Lower values (e.g., 1024) make the model faster but with less context
- Higher values (e.g., 4096) make the model slower but with more context
- Default: 2048

### Preset Settings

#### Creative Mode
- Temperature: 0.8
- Top P: 0.9
- Top K: 50
- Repetition Penalty: 1.1
- Context Window: 2048
- Best for: Creative writing, story generation, brainstorming

#### Balanced Mode
- Temperature: 0.7
- Top P: 0.95
- Top K: 40
- Repetition Penalty: 1.1
- Context Window: 2048
- Best for: General tasks, question answering, summarization

#### Precise Mode
- Temperature: 0.6
- Top P: 0.8
- Top K: 30
- Repetition Penalty: 1.2
- Context Window: 2048
- Best for: Technical writing, code generation, factual tasks

### Model Selection Guidelines

1. **Mistral-7B**
   - Best for: Fast responses, general tasks, concise outputs
   - Use when: Speed is important, results need to be quick
   - Avoid when: Need highly technical or specialized output

2. **LLaMA 3.2**
   - Best for: Balanced performance, general-purpose tasks
   - Use when: Need balanced performance between speed and quality
   - Avoid when: Need extremely fast responses or specialized tasks

3. **Gemma 3**
   - Best for: General conversation, text generation, and creative writing
   - Use when: Need a model for everyday conversation and writing tasks
   - Avoid when: Need highly technical or specialized output

4. **Llama 3**
   - Best for: Complex reasoning, latest performance, and specialized tasks
   - Use when: Need a model for tasks that require advanced reasoning and understanding
   - Avoid when: Need extremely fast responses or general-purpose tasks

5. **Specialized Models**
   - Best for: Specific tasks such as uncensored content generation, Italian language tasks, and conversational AI
   - Use when: Need a model for a specific task or language
   - Avoid when: Need general-purpose or balanced performance

## UI Design

The Free Thinkers UI is designed to be clean, intuitive, and distraction-free:

- **Clean Interface**: Minimalist design focusing on the conversation
- **Dark/Light Mode**: Toggle between themes for comfort in different environments
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: Keyboard shortcuts, proper contrast, and semantic HTML
- **Instant Feedback**: Visual indicators for message status, loading, and actions

## Development Roadmap

### Completed Features
- [x] Basic chat functionality
- [x] Multiple model support
- [x] Conversation management
- [x] Parameter controls
- [x] Dark/light mode
- [x] Model management system
- [x] Usage statistics
- [x] Performance optimizations

### Upcoming Features
- [ ] Plugins/tools system
- [ ] RAG (Retrieval-Augmented Generation)
- [ ] Multi-user support
- [ ] Mobile optimization
- [ ] Enhanced documentation
- [ ] Community features

## Troubleshooting

### Common Issues

1. **Repetitive Output**
   - Increase repetition penalty
   - Decrease temperature
   - Adjust top P and top K

2. **Incoherent Output**
   - Decrease temperature
   - Adjust top P and top K
   - Increase context window

3. **Slow Responses**
   - Decrease context window
   - Use balanced or precise preset
   - Check system resources

### Performance Tips

1. **GPU Acceleration**
   - Ensure GPU acceleration is enabled in settings
   - Monitor GPU usage
   - Adjust parameters for optimal performance

2. **Resource Management**
   - Monitor system memory usage
   - Adjust context window based on available resources
   - Consider reducing parameters for resource-constrained environments

## Environment Variables

- `HISTORY_DIR`: Directory for storing conversation history (defaults to `~/.freethinkers/history/`)
- `MAX_HISTORY`: Maximum number of threads to keep in history (defaults to 100)
- `OLLAMA_USE_METAL`: Set to "true" to enable Metal acceleration on Apple Silicon
- `OLLAMA_METAL`: Set to "true" to enable Metal acceleration on Apple Silicon
- `OLLAMA_RAM`: Set to the amount of RAM to allocate to Ollama (e.g. "8G")

## License

MIT License