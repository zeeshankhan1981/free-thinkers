# Free Thinkers

A minimalist, local-first web-based chat interface for interacting with LLMs.

## Features

- Clean, intuitive interface
- Multiple LLM models with GPU acceleration:
  - Mistral 7B - Fast, general-purpose tasks
  - Llama 3.2 - Versatile, instruction-following tasks
  - Gemma 2B - Creative writing and artistic responses
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
5. View conversation history by clicking the History button

## Technical Specifications

For detailed technical specifications, see [TECHNICAL.md](TECHNICAL.md)

## License

MIT License
