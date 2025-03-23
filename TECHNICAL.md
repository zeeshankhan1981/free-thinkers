# Free Thinkers Technical Specifications

## Technical Stack

### Frontend
- **Framework**: Pure HTML/CSS/JavaScript (no frameworks like React)
- **UI Library**: Bootstrap 5.3
- **Design**: Professional flat design with light/dark mode support
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **JavaScript Features**:
  - ES6+ syntax
  - Fetch API with ReadableStream for streamed responses
  - DOM manipulation without jQuery dependency
  - Event delegation for efficient handlers

### Backend
- **Framework**: Flask 3.1.0
- **Python Version**: 3.8+
- **API**: RESTful endpoints with JSON responses
- **CORS**: Enabled for localhost development
- **Error Handling**: Comprehensive try/except blocks with graceful degradation

### LLM Integration
- **Model Manager**: Ollama 0.6.2
- **Models**: 
  - Mistral 7B (Q4_K_M) - Optimized for fast, general-purpose tasks
  - Llama 3 8B (Q8_0) - Balance of performance and quality
  - Llama 3 8B (F16) - Highest quality responses
  - Gemma 2B (Italian) - Creative writing and artistic responses

### Storage
- **Method**: JSON flat file storage
- **Location**: `~/.freethinkers/history/`
- **Format**: Thread-based JSON files with UUIDs
- **Data Structure**: Hierarchical conversations with metadata
- **Persistence**: Automatic directory creation and permissions handling

## GPU Acceleration

### Apple Silicon Optimization
- **Framework**: Metal (Apple's GPU API)
- **Activation**: Enabled through environment variables
  - `OLLAMA_USE_METAL=true`
  - `OLLAMA_METAL=true` 
  - `OLLAMA_RAM=8G` (Allocates specific RAM amount)
- **Layer Optimization**: 22 neural network layers processed on GPU
- **Context Settings**: Optimized batch size (512) for M-series chips
- **Thread Management**: Configured for 4-6 threads based on workload

### Inference Parameters
- **num_gpu**: 1 (Utilizes GPU for inference)
- **num_thread**: 6 (Optimized for M4 architecture)
- **mirostat**: 1 (Adaptive sampling for quality)
- **mirostat_tau**: 5.0 (Focused sampling parameter)
- **mirostat_eta**: 0.1 (Learning rate for adaptive sampling)
- **repeat_penalty**: 1.15 (Reduces repetitive outputs)
- **f16_kv**: true (Half-precision key/value processing)
- **tfs_z**: 1.0 (Tail free sampling control)

### Performance Improvements
- **Speed**: 2-4x faster response generation
- **Quality**: Maintained or improved output quality
- **Power Efficiency**: Reduced CPU usage and thermal output
- **Concurrency**: Better handling of multiple requests

## Model Specifications

| Model | Parameters | Quantization | Max Context | Max Response | Input Limit | Primary Use Case |
|-------|------------|--------------|-------------|--------------|-------------|------------------|
| Mistral 7B | 7.2B | Q4_K_M | 4096 | 2048 | 320 chars | Fast, concise outputs |
| Llama 3 8B (Q8) | 8.0B | Q8_0 | 4096 | 3072 | 320 chars | Balanced performance |
| Llama 3 8B (F16) | 8.0B | F16 | 4096 | 4096 | 320 chars | Highest quality responses |
| Gemma 2B | 2.5B | - | 2048 | 1536 | 320 chars | Creative writing tasks |

## API Endpoints

### Chat Endpoint
```http
POST /api/chat
Content-Type: application/json

{
    "message": "string",
    "model": "enum[mistral-7b, llama3-q8, llama3-f16, gemma-2b-it]",
    "speed": "enum[slow, medium, fast]",
    "use_guide": "boolean"
}
```

Response: Event stream of generated text chunks

### History Endpoints
```http
GET /api/history
Content-Type: application/json

Response:
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

```http
POST /api/history/save
Content-Type: application/json

Request:
{
    "model": "string",
    "messages": [
        {
            "role": "enum[user, assistant]",
            "content": "string"
        }
    ]
}

Response:
{
    "thread_id": "uuid",
    "status": "success"
}
```

```http
GET /api/history/thread/{thread_id}
Content-Type: application/json

Response:
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
```

### Model Guide Endpoints
```http
GET /api/model_guides
Content-Type: application/json

Response:
{
    "model_name": {
        "guide": {
            "use_case_title": "string",
            "use_case": "string",
            "example_prompt": "string",
            "tip": "string"
        },
        "limits": {
            "max_tokens": integer,
            "max_input_chars": integer
        }
    }
}
```

## Speed Settings

Each model has three speed settings that adjust the inference parameters:

| Setting | Temperature | Top-P | Top-K | Effect |
|---------|-------------|-------|-------|--------|
| Slow | 0.8 - 0.9 | 0.9 | 50 | More creative, diverse responses |
| Medium | 0.7 - 0.8 | 0.95 | 40 | Balanced creativity and focus |
| Fast | 0.6 - 0.7 | 0.9 | 30 | More deterministic, focused responses |

## Environment Variables

- `HISTORY_DIR`: Directory for storing conversation history (defaults to `~/.freethinkers/history/`)
- `MAX_HISTORY`: Maximum number of threads to keep in history (defaults to 100)
- `OLLAMA_USE_METAL`: Enable Metal GPU acceleration (true/false)
- `OLLAMA_METAL`: Enable Metal API directly (true/false)
- `OLLAMA_RAM`: Allocate specific RAM amount for Ollama (e.g., 8G)

## File Structure

```
free-thinkers/
├── app/
│   ├── static/
│   │   ├── css/
│   │   └── js/
│   └── templates/
│       └── index.html        # Main application UI
├── .venv/                    # Python virtual environment
├── app.py                    # Main Flask application
├── requirements.txt          # Python dependencies
├── start_servers.sh          # Server startup script with GPU settings
├── import_models.sh          # Model import script with GPU acceleration
└── Modelfile                 # Template for model configuration
```

## Development Guidelines

### Code Style
- **Python**: Follow PEP 8 guidelines
  - 4 space indentation
  - Maximum line length of 120 characters
  - Docstrings for all functions and classes
- **JavaScript**: ES6+ features with consistent formatting
  - 2 space indentation
  - Semicolons required
  - camelCase variable names
- **HTML**: Semantic elements with proper hierarchy
  - Bootstrap 5 grid system
  - Accessibility considerations
- **CSS**: Custom variables for theming
  - BEM naming convention
  - Dark mode compatibility

### API Request Flow
1. Client sends request to Flask endpoint
2. Flask validates and normalizes parameters
3. Request is forwarded to Ollama with optimized settings
4. Streamed response is processed in chunks
5. Each chunk is sent to client as it becomes available
6. Client assembles and renders the complete response

### GPU Acceleration Implementation
1. Environment variables set in shell scripts
2. Ollama server started with Metal acceleration
3. API requests include GPU-specific parameters
4. Model weights utilize half-precision where possible
5. Batch processing optimized for GPU architecture

### Error Handling Strategy
- **Frontend**: 
  - Graceful UI degradation
  - Clear error messages with retry options
  - Offline capability where possible
- **Backend**:
  - Comprehensive exception handling
  - Detailed logging for debugging
  - Graceful fallbacks for failed operations
- **Model Inference**:
  - Timeouts for unresponsive models
  - Fallback to CPU if GPU fails
  - Parameter validation before requests

## Performance Benchmarks

| Model | CPU Only | GPU Accelerated | Improvement |
|-------|----------|-----------------|-------------|
| Mistral 7B | ~3.5s | ~1.2s | 2.9x faster |
| Llama 3 8B (Q8) | ~4.2s | ~1.5s | 2.8x faster |
| Llama 3 8B (F16) | ~5.0s | ~1.8s | 2.7x faster |
| Gemma 2B | ~2.0s | ~0.7s | 2.8x faster |

*Benchmark based on generating response to "What is the capital of France?" on MacBook M4*

## Future Development Roadmap

1. **Advanced Model Features**
   - Fine-tuning interface
   - Custom model configuration
   - Multi-model chat comparison

2. **Enhanced Conversation Management**
   - Conversation branching
   - Advanced context management
   - Knowledge base integration

3. **Performance Optimizations**
   - Further GPU parameter tuning
   - Progressive model loading
   - Distributed inference support
   
4. **UI Enhancements**
   - Voice input/output
   - Code syntax highlighting
   - Markdown rendering
   - Image generation integration

5. **Security Features**
   - User authentication
   - Role-based access control
   - Content filtering options
