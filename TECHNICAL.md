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
  - Llama 3 8B (Q8_0)
  - Llama 3 8B (F16)
  - Gemma 2B (Italian)

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
    "model": "enum[mistral-7b, llama3-q8, llama3-f16, gemma-2b-it]",
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

| Model | Parameters | Quantization | Max Context | Max Response |
|-------|------------|--------------|-------------|-------------|
| Mistral 7B | 7.2B | Q4_K_M | 4096 | 2048 |
| Llama 3 8B (Q8) | 8.0B | Q8_0 | 4096 | 2048 |
| Llama 3 8B (F16) | 8.0B | F16 | 4096 | 2048 |
| Gemma 2B | 2.5B | - | 2048 | 1024 |

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
