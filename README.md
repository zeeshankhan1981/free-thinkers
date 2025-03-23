# Free Thinkers

A minimalist, local-first web-based chat interface for interacting with local Large Language Models (LLMs) using Ollama and llama.cpp.

## Features

- **Clean, Professional UI**
  - Intuitive interface with flat design
  - Responsive layout for desktop and mobile devices
  - Dark/Light mode toggle with persistent settings
  - Character counter with visual indicators
  
- **Advanced Model Support**
  - Multiple LLM models: Mistral 7B, Llama 3 8B, Gemma 2B
  - Model-specific prompt guides and tokenizers
  - Optimized inference with GPU acceleration on Apple Silicon
  - Customizable model parameters (temperature, top-k, top-p)
  
- **Conversation Management**
  - Save and load conversation history
  - Thread-based organization
  - Clean JSON storage format
  - Fast, responsive history navigation
  
- **Performance Optimization**
  - Metal GPU acceleration for Apple Silicon
  - Adaptive token limits for each model
  - Streamed responses for improved UX
  - Memory-efficient processing

## Requirements

- Python 3.8+
- Flask 3.1.0+
- Ollama 0.6.2+
- Modern web browser with JavaScript enabled
- Apple Silicon Mac (M1/M2/M3/M4) for GPU acceleration

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

4. Import models (this will download the models if not already present):
```bash
chmod +x import_models.sh
./import_models.sh
```

5. Start the application:
```bash
chmod +x start_servers.sh
./start_servers.sh
```

6. Open your browser and navigate to `http://localhost:5000`

## Usage

### Model Selection
Select the appropriate model based on your needs:
- **Mistral 7B**: Fast, general-purpose tasks, concise outputs (2048 token limit)
- **Llama 3 8B (Q8)**: Balanced performance and quality (3072 token limit)
- **Llama 3 8B (F16)**: Highest quality responses (4096 token limit)
- **Gemma 2B**: Creative writing and artistic responses (1536 token limit)

### Character Limits
Each model has a maximum input character limit of 320 characters. The UI provides visual feedback as you approach this limit:
- Normal: Gray counter
- Warning (>80%): Yellow counter
- Critical (>95%): Red counter

### History Management
- Save conversations to history with the "Save" button
- Access previous conversations via the History panel
- Load a previous conversation to continue where you left off

### GPU Acceleration
On Apple Silicon Macs, Free Thinkers automatically utilizes Metal GPU acceleration for dramatically improved performance. This is enabled by default and optimized for:
- Faster response generation (2-4x speedup)
- Improved handling of complex prompts
- Reduced power consumption compared to CPU-only mode

## Technical Specifications

For detailed technical specifications, including API documentation, model parameters, and GPU acceleration details, see [TECHNICAL.md](TECHNICAL.md).

## Version History

- v0.1.4: GPU acceleration for Apple Silicon (March 2025)
- v0.1.3: Character limits and prompt guide fixes (March 2025)
- v0.1.2: Simplified model guide UI (March 2025)
- v0.0.8: UI improvements with flat design (February 2025)

## License

MIT License
