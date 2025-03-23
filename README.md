# Free Thinkers LLM Application

A minimalist, local-first web-based chat interface designed for researchers, writers, and independent thinkers to converse with LLMs using Ollama and llama.cpp.

## Project Overview

Free Thinkers is a web application that provides a clean, distraction-free interface for interacting with local LLMs. It's built with privacy and performance in mind, running entirely on your machine without any cloud dependencies.

## Technical Stack

### Frontend
- **Framework**: Pure HTML/CSS/JavaScript (no React)
- **UI Library**: Bootstrap 5.3
- **Design**: Flat monochrome design with light/dark mode support
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari)

### Backend
- **Framework**: Flask 3.1.0
- **Python Version**: 3.11+
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

## Installation

1. Clone the repository:
```bash
git clone git@github.com:zeeshankhan1981/free-thinkers.git
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

4. Ensure Ollama is running:
```bash
ollama serve
```

5. Start the application:
```bash
python app.py
```

## Usage

1. Open your browser and navigate to `http://127.0.0.1:5000`
2. Select your preferred model from the dropdown
3. Type your message and press Enter or click Send
4. Responses will stream in real-time
5. Use the history sidebar to view past conversations

## Features

- Real-time streaming responses
- Model switching on the fly
- Local storage of conversations
- Light/Dark mode support
- Mobile-responsive design
- System prompt customization
- Thread export functionality
- Markdown support in responses

## Technical Specifications

### API Endpoints

```http
POST /api/chat
Content-Type: application/json

{
    "message": "string",
    "model": "enum[llama3-q8, llama3-f16, mistral-7b, gemma-2b-it]",
    "system_prompt": "optional string"
}
```

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

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository.
