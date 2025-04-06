# Free Thinkers Technical Specifications

## Technical Stack

### Frontend
- **Framework**: Pure HTML/CSS/JavaScript (no React)
- **UI Library**: Bootstrap 5.3
- **Design**: Flat monochrome design with light/dark mode support
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari)

### Backend
- **Framework**: Flask 3.1.0
- **Python Version**: 3.8+
- **API**: RESTful endpoints with JSON responses
- **CORS**: Enabled for localhost

### LLM Integration
- **Model Manager**: Ollama 0.6.2
- **Models**: 
  - Mistral 7B (Q4_K_M)
  - Llama 3.2
  - Gemma 2B (Italian)
  - Llava Phi3
- **GPU Acceleration**: Metal for Apple Silicon
  - Environment Variables: OLLAMA_USE_METAL=true, OLLAMA_METAL=true, OLLAMA_RAM=8G
  - API Optimization: num_gpu=1, num_thread=6, f16_kv=true

### Storage
- **Method**: JSON flat file storage
- **Location**: `~/.freethinkers/history/`
- **Format**: Thread-based JSON files with UUIDs

## API Endpoints

### Chat Endpoint
```http
POST /api/chat
Content-Type: application/json

{
    "message": "string",
    "model": "enum[mistral-7b, llama3.2, gemma-2b-it]",
    "system_prompt": "optional string"
}
```

### Image Chat Endpoint
```http
POST /api/chat_with_image
Content-Type: multipart/form-data

{
    "message": "string",
    "model": "enum[llava-phi3]",
    "image": "file",
    "system_prompt": "optional string"
}
```

### History Endpoints
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

| Model | Parameters | Quantization | Max Context | Max Response | Capabilities |
|-------|------------|--------------|-------------|-------------|--------------|
| Mistral 7B | 7.2B | Q4_K_M | 4096 | 2048 | Text-only |
| Llama 3.2 | 8.0B | Q4_K_M | 8192 | 4096 | Text-only |
| Gemma 2B | 2.5B | - | 2048 | 1024 | Text-only |
| Llava Phi3 | 3.8B | Q4_K_M | 4096 | 2048 | Text + Image |

## Environment Variables

- `HISTORY_DIR`: Directory for storing conversation history (defaults to `~/.freethinkers/history/`)
- `MAX_HISTORY`: Maximum number of threads to keep in history (defaults to 100)

## File Structure

```
free-thinkers/
├── app/
│   ├── static/
│   │   ├── css/
│   │   └── js/
│   └── templates/
├── .venv/
├── requirements.txt
├── start_servers.sh
├── import_models.sh
├── load_models.sh
└── Modelfile
```

## Development Guidelines

### Code Style
- Python: Follow PEP 8 guidelines
- JavaScript: Use ES6+ features
- HTML: Semantic elements with proper structure
- CSS: BEM methodology with custom variables

### Testing
- Unit tests for API endpoints
- Integration tests for model interactions
- UI tests using Cypress or similar tool

### Security
- Input sanitization
- Rate limiting
- CORS configuration
- Secure file storage

## Performance Considerations

- Streamed responses for large model outputs
- Efficient JSON serialization/deserialization
- Memory management for long conversations
- Optimized model loading and switching

## Error Handling

- Graceful degradation for model failures
- User-friendly error messages
- Logging for debugging
- Retry mechanisms for failed requests

## Future Improvements

1. Model fine-tuning support
2. Advanced conversation context management
3. Export/import conversation threads
4. Additional model formats and quantizations
5. Performance optimizations for large models
