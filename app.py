import os
import sys
import argparse
from pathlib import Path
import json
import requests

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import our application factory
from app import create_app

# Configuration
HISTORY_DIR = Path(os.path.expanduser("~/.freethinkers/history/"))
HISTORY_DIR.mkdir(parents=True, exist_ok=True)
MAX_HISTORY = 100

# Default model parameters
DEFAULT_MODEL_PARAMS = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "num_gpu": 1,
    "num_thread": 6,
    "f16_kv": True,
    "speed_settings": {
        "slow": {"temperature": 0.8, "top_p": 0.9, "top_k": 50},
        "medium": {"temperature": 0.7, "top_p": 0.95, "top_k": 40},
        "fast": {"temperature": 0.6, "top_p": 0.9, "top_k": 30}
    },
    "prompt_guide": {
        "use_case_title": "General-purpose tasks",
        "use_case": "This model is suitable for general-purpose tasks.",
        "example_prompt": "Explain the concept of machine learning in simple terms.",
        "tip": "Use clear, concise language for best results."
    },
    "limits": {
        "max_tokens": 4096,
        "max_input_chars": 2048
    }
}

# Model-specific parameters
MODEL_PARAMS = {
    "mistral-7b": {
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40,
        "num_gpu": 1,
        "num_thread": 8,
        "num_batch": 4,
        "f16_kv": True,
        "use_gpu": True,
        "gpu_layers": 36,
        "low_vram": False,
        "speed_settings": {
            "slow": {"temperature": 0.8, "top_p": 0.9, "top_k": 50, "max_tokens": 2048},
            "medium": {"temperature": 0.7, "top_p": 0.95, "top_k": 40, "max_tokens": 1024},
            "fast": {"temperature": 0.6, "top_p": 0.9, "top_k": 30, "max_tokens": 512}
        },
        "prompt_guide": {
            "use_case_title": "Fast, general-purpose tasks, concise outputs",
            "use_case": "This model is optimized for fast, general-purpose tasks, concise outputs.",
            "example_prompt": "Summarize the main points of 'The Great Gatsby' in 100 words.",
            "tip": "Keep the prompt short and straightforward for best results."
        },
        "limits": {
            "max_tokens": 4096,
            "max_input_chars": 2048
        }
    },
    "llama3.2": {
        "temperature": 0.7,
        "top_p": 0.9,
        "top_k": 40,
        "num_gpu": 1,
        "num_thread": 8,
        "num_batch": 4,
        "f16_kv": True,
        "use_gpu": True,
        "gpu_layers": 40,
        "low_vram": False,
        "speed_settings": {
            "slow": {"temperature": 0.8, "top_p": 0.9, "top_k": 50, "max_tokens": 2048},
            "medium": {"temperature": 0.7, "top_p": 0.9, "top_k": 40, "max_tokens": 1024},
            "fast": {"temperature": 0.6, "top_p": 0.8, "top_k": 30, "max_tokens": 512}
        },
        "prompt_guide": {
            "use_case_title": "General-purpose tasks, balanced outputs",
            "use_case": "This model is optimized for general-purpose tasks with balanced outputs.",
            "example_prompt": "Explain the concept of quantum entanglement in simple terms.",
            "tip": "Use clear, concise language for best results."
        },
        "limits": {
            "max_tokens": 4096,
            "max_input_chars": 2048
        }
    },
    "llava-phi3:latest": {
        "temperature": 0.65,
        "top_p": 0.85,
        "top_k": 30,
        "num_gpu": 1,
        "f16_kv": True,
        "num_thread": 4,
        "num_batch": 1,
        "max_tokens": 512,
        "use_gpu": True,
        "gpu_layers": 32,
        "low_vram": True,
        "mirostat": 1,
        "mirostat_eta": 0.1,
        "mirostat_tau": 5.0,
        "speed_settings": {
            "slow": {"temperature": 0.7, "top_p": 0.9, "top_k": 30, "max_tokens": 768},
            "medium": {"temperature": 0.6, "top_p": 0.85, "top_k": 20, "max_tokens": 512},
            "fast": {"temperature": 0.5, "top_p": 0.75, "top_k": 10, "max_tokens": 256}
        },
        "prompt_guide": {
            "use_case_title": "Multimodal image analysis and description",
            "use_case": "This model can analyze images and provide descriptions or answer questions about them.",
            "example_prompt": "What's in this image? Provide a detailed description.",
            "tip": "For best results, upload clear images and ask specific questions about the content."
        },
        "limits": {
            "max_tokens": 4096,
            "max_input_chars": 2048
        }
    }
}

# Function to initialize model parameters is preserved
def initialize_model_params():
    """Initialize model parameters for all available models."""
    try:
        # Get all available models from Ollama
        # Note: This is wrapped in a try/except block since Ollama might not be running
        try:
            response = requests.get('http://localhost:11434/api/tags', timeout=1)
            if response.status_code == 200:
                models = response.json().get('models', [])
                
                for model in models:
                    model_name = model['name']
                    # If the model doesn't have parameters yet, set default ones
                    if model_name not in MODEL_PARAMS:
                        # Create a deep copy of default params to avoid reference issues
                        params = json.loads(json.dumps(DEFAULT_MODEL_PARAMS))
                        
                        # Add specific configurations based on model name if needed
                        # Add the new model to the parameters dictionary
                        MODEL_PARAMS[model_name] = params
        except requests.exceptions.RequestException:
            print("Ollama server not available, skipping model parameter initialization")
    except Exception as e:
        print(f"Error initializing model parameters: {e}")

# Initialize model parameters on startup
initialize_model_params()

# Create the application with model parameters
def create_app_with_config():
    app = create_app()
    # Add model parameters to app config
    app.config['MODEL_PARAMS'] = MODEL_PARAMS
    app.config['DEFAULT_MODEL_PARAMS'] = DEFAULT_MODEL_PARAMS
    return app

# Create the application
app = create_app_with_config()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Free Thinkers - Local AI Chat Interface')
    parser.add_argument('--host', default='127.0.0.1', help='Host to bind to')
    parser.add_argument('--port', type=int, default=5000, help='Port to bind to')
    parser.add_argument('--debug', action='store_true', help='Run in debug mode')
    args = parser.parse_args()
    
    # Run the application
    app.run(host=args.host, port=args.port, debug=args.debug)
