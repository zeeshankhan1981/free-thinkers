from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys
import requests
from pathlib import Path
import json
import uuid
from datetime import datetime

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.model_management import model_management

app = Flask(__name__)
app.template_folder = 'app/templates'
CORS(app)

# Configuration
HISTORY_DIR = Path(os.path.expanduser("~/.freethinkers/history/"))
MAX_HISTORY = 100

# Model-specific parameters
MODEL_PARAMS = {
    "mistral-7b": {
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40,
        "speed_settings": {
            "slow": {"temperature": 0.8, "top_p": 0.9, "top_k": 50},
            "medium": {"temperature": 0.7, "top_p": 0.95, "top_k": 40},
            "fast": {"temperature": 0.6, "top_p": 0.9, "top_k": 30}
        },
        "prompt_guide": {
            "use_case_title": "Fast, general-purpose tasks, concise outputs",
            "use_case": "This model is optimized for fast, general-purpose tasks, concise outputs.",
            "example_prompt": "Summarize the main points of 'The Great Gatsby' in 100 words.",
            "tip": "Keep the prompt short and straightforward for best results."
        },
        "limits": {
            "max_tokens": 2048,
            "max_input_chars": 320
        }
    },
    "llama3.2": {
        "temperature": 0.7,
        "top_p": 0.9,
        "top_k": 40,
        "speed_settings": {
            "slow": {"temperature": 0.8, "top_p": 0.9, "top_k": 50},
            "medium": {"temperature": 0.7, "top_p": 0.9, "top_k": 40},
            "fast": {"temperature": 0.6, "top_p": 0.8, "top_k": 30}
        },
        "prompt_guide": {
            "use_case_title": "General-purpose tasks, balanced outputs",
            "use_case": "This model is optimized for general-purpose tasks with balanced outputs.",
            "example_prompt": "Explain the concept of quantum entanglement in simple terms.",
            "tip": "Use clear, concise language for best results."
        },
        "limits": {
            "max_tokens": 2048,
            "max_input_chars": 320
        }
    },
    "gemma-2b-it": {
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40,
        "speed_settings": {
            "slow": {"temperature": 0.8, "top_p": 0.9, "top_k": 50},
            "medium": {"temperature": 0.7, "top_p": 0.95, "top_k": 40},
            "fast": {"temperature": 0.6, "top_p": 0.9, "top_k": 30}
        },
        "prompt_guide": {
            "use_case_title": "Creative writing, artistic responses, nuanced storytelling",
            "use_case": "Creative writing, artistic responses, nuanced storytelling",
            "example_prompt": "Write a short story about a dragon who befriends a human child.",
            "tip": "Best for creative and imaginative writing tasks, like storytelling and poetry."
        },
        "limits": {
            "max_tokens": 1536,
            "max_input_chars": 320
        }
    }
}

# Ensure history directory exists
HISTORY_DIR.mkdir(parents=True, exist_ok=True)

def get_thread_path(thread_id):
    """Get the path to a thread's JSON file."""
    return HISTORY_DIR / f"{thread_id}.json"

def save_thread(thread_id, model, messages):
    """Save a thread to disk."""
    thread_data = {
        "id": thread_id,
        "model": model,
        "messages": messages,
        "created_at": datetime.now().isoformat()
    }
    
    thread_path = get_thread_path(thread_id)
    with open(thread_path, 'w') as f:
        json.dump(thread_data, f, indent=2)

def load_history():
    """Load all thread history from disk."""
    # Ensure history directory exists
    HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    
    threads = []
    try:
        # Sort by modification time to get newest first
        json_files = sorted(HISTORY_DIR.glob("*.json"), 
                          key=lambda x: x.stat().st_mtime, 
                          reverse=True)[:MAX_HISTORY]
        
        for file in json_files:
            try:
                with open(file, 'r') as f:
                    thread = json.load(f)
                    threads.append(thread)
            except Exception as e:
                print(f"Error loading thread file {file}: {e}")
                continue
    except Exception as e:
        print(f"Error loading history: {e}")
    
    print(f"Loaded {len(threads)} threads from history")
    return threads

def get_thread(thread_id):
    """Load a specific thread from disk."""
    thread_path = get_thread_path(thread_id)
    if thread_path.exists():
        with open(thread_path, 'r') as f:
            return json.load(f)
    return None

# Register blueprints
app.register_blueprint(model_management, url_prefix='/model_management')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/models')
def get_models():
    """Return list of available models."""
    return jsonify(list(MODEL_PARAMS.keys()))

@app.route('/api/model_guides')
def get_model_guides():
    """Return prompt guides for all models."""
    guides = {}
    for model, params in MODEL_PARAMS.items():
        if 'prompt_guide' in params:
            guides[model] = {
                'guide': params['prompt_guide'],
                'limits': params['limits']
            }
    return jsonify(guides)

@app.route('/api/model_guide/<model_name>')
def get_model_guide(model_name):
    """Return guide for a specific model."""
    if model_name in MODEL_PARAMS and 'prompt_guide' in MODEL_PARAMS[model_name]:
        response = {
            'guide': MODEL_PARAMS[model_name]['prompt_guide'],
            'limits': MODEL_PARAMS[model_name]['limits']
        }
        return jsonify(response)
    return jsonify({"error": "Model guide not found"}), 404

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '')
    model = data.get('model', 'llama2')
    parameters = data.get('parameters', {
        'temperature': 0.7,
        'top_p': 0.95,
        'top_k': 40,
        'repetition_penalty': 1.1,
        'context_window': 2048
    })

    try:
        # Get the model parameters
        model_params = MODEL_PARAMS.get(model, {})
        
        # Combine default parameters with user parameters
        final_params = {
            'temperature': float(parameters.get('temperature', 0.7)),
            'top_p': float(parameters.get('top_p', 0.95)),
            'top_k': int(parameters.get('top_k', 40)),
            'repetition_penalty': float(parameters.get('repetition_penalty', 1.1)),
            'num_gpu': 1,
            'num_thread': 6,
            'mirostat': model_params.get('mirostat', 2),
            'mirostat_tau': model_params.get('mirostat_tau', 0.7),
            'mirostat_eta': model_params.get('mirostat_eta', 0.1),
            'f16_kv': True,
            'repeat_penalty': float(parameters.get('repetition_penalty', 1.1)),
            'tfs_z': model_params.get('tfs_z', 1.0)
        }

        # Stream the response
        response = requests.post(
            'http://127.0.0.1:11434/api/generate',
            json={
                'model': model,
                'prompt': f"{message}\nAssistant:",
                'stream': True,
                'temperature': final_params['temperature'],
                'top_p': final_params['top_p'],
                'top_k': final_params['top_k'],
                'max_tokens': MODEL_PARAMS[model]['limits']['max_tokens'],
                # GPU acceleration parameters
                'num_gpu': final_params['num_gpu'],           # Use GPU acceleration 
                'num_thread': final_params['num_thread'],        # Optimized for M4 chip
                'mirostat': final_params['mirostat'],          # Enable adaptive sampling for better response quality
                'mirostat_tau': final_params['mirostat_tau'],    # Lower tau for more focused sampling
                'mirostat_eta': final_params['mirostat_eta'],    # Learning rate for mirostat algorithm
                'repeat_penalty': final_params['repeat_penalty'], # Slightly increased to avoid repetition
                'seed': -1,             # Random seed for reproducibility (-1 for random)
                'f16_kv': final_params['f16_kv'],         # Use half-precision for keys/values to speed up processing
                'tfs_z': final_params['tfs_z'],           # Control tail free sampling
            },
            stream=True,
            timeout=300  # 5 minute timeout
        )
        
        def generate():
            try:
                for line in response.iter_lines():
                    if line:
                        try:
                            chunk = json.loads(line)
                            if 'response' in chunk:
                                yield chunk['response']
                        except json.JSONDecodeError:
                            continue
            except requests.exceptions.Timeout:
                pass  # Timeout is handled by the frontend
            except Exception as e:
                print(f"Error in response generation: {e}")
                pass
        
        return app.response_class(generate(), mimetype='text/event-stream')

    except Exception as e:
        print(f"Error in chat: {str(e)}")
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/api/guided_chat', methods=['POST'])
def guided_chat():
    """Handle guided chat with prompt recommendations."""
    data = request.json
    message = data.get('message', '')
    model = data.get('model', 'mistral-7b')
    
    if model not in MODEL_PARAMS:
        return jsonify({"error": "Invalid model"}), 400
    
    # Get the guide for this model
    guide = MODEL_PARAMS[model].get('prompt_guide', {})
    
    # If no message provided, use the example prompt
    if not message and 'example_prompt' in guide:
        message = guide['example_prompt']
    
    # Forward to the regular chat endpoint
    response = chat()
    
    # Add guide information to the response (only for non-streaming responses)
    # For streaming, the frontend would need to request the guide separately
    return response

@app.route('/api/history')
def get_history():
    """Return list of all saved threads."""
    threads = load_history()
    return jsonify(threads)

@app.route('/api/history/save', methods=['POST'])
def save_thread_endpoint():
    """Save current thread to history."""
    try:
        data = request.get_json()
        if not data or 'model' not in data or 'messages' not in data:
            print("Invalid save request data:", data)
            return jsonify({"error": "Invalid data format"}), 400
            
        thread_id = str(uuid.uuid4())
        save_thread(thread_id, data['model'], data['messages'])
        return jsonify({"thread_id": thread_id, "status": "success"})
    except Exception as e:
        print(f"Error saving thread: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/history/<thread_id>')
def get_thread_endpoint(thread_id):
    """Get a specific thread."""
    thread = get_thread(thread_id)
    if thread:
        return jsonify(thread)
    return jsonify({"error": "Thread not found"}), 404

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
