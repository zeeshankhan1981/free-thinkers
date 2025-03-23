from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import requests
import json
import uuid
from datetime import datetime
import requests
from pathlib import Path

app = Flask(__name__, template_folder='app/templates')
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5000"}})

# Configuration
HISTORY_DIR = Path(os.path.expanduser("~/.freethinkers/history/"))
MAX_HISTORY = 100

# Model-specific parameters
MODEL_PARAMS = {
    "mistral-7b": {
        "max_tokens": 2048,
        "max_context": 4096,
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40,
        "speed_settings": {
            "slow": {"temperature": 0.8, "top_p": 0.9, "top_k": 50},
            "medium": {"temperature": 0.7, "top_p": 0.95, "top_k": 40},
            "fast": {"temperature": 0.6, "top_p": 0.9, "top_k": 30}
        }
    },
    "llama3-q8": {
        "max_tokens": 2048,
        "max_context": 4096,
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40,
        "speed_settings": {
            "slow": {"temperature": 0.8, "top_p": 0.9, "top_k": 50},
            "medium": {"temperature": 0.7, "top_p": 0.95, "top_k": 40},
            "fast": {"temperature": 0.6, "top_p": 0.9, "top_k": 30}
        }
    },
    "llama3-f16": {
        "max_tokens": 2048,
        "max_context": 4096,
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40,
        "speed_settings": {
            "slow": {"temperature": 0.8, "top_p": 0.9, "top_k": 50},
            "medium": {"temperature": 0.7, "top_p": 0.95, "top_k": 40},
            "fast": {"temperature": 0.6, "top_p": 0.9, "top_k": 30}
        }
    },
    "gemma-2b-it": {
        "max_tokens": 1024,
        "max_context": 2048,
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40,
        "speed_settings": {
            "slow": {"temperature": 0.8, "top_p": 0.9, "top_k": 50},
            "medium": {"temperature": 0.7, "top_p": 0.95, "top_k": 40},
            "fast": {"temperature": 0.6, "top_p": 0.9, "top_k": 30}
        }
    }
}

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
    threads = []
    for file in sorted(HISTORY_DIR.glob("*.json"), reverse=True)[:MAX_HISTORY]:
        with open(file, 'r') as f:
            thread = json.load(f)
            threads.append(thread)
    return threads

def get_thread(thread_id):
    """Load a specific thread from disk."""
    thread_path = get_thread_path(thread_id)
    if thread_path.exists():
        with open(thread_path, 'r') as f:
            return json.load(f)
    return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/models')
def get_models():
    """Return list of available models."""
    return jsonify(list(MODEL_PARAMS.keys()))

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat requests and stream responses."""
    data = request.json
    message = data.get('message', '')
    model = data.get('model', 'mistral-7b')
    speed = data.get('speed', 'medium')
    
    if model not in MODEL_PARAMS:
        return jsonify({"error": "Invalid model"}), 400
    
    # Validate message length
    if len(message) > 320:
        message = message[:320]  # Truncate if too long
        
    # Get model parameters
    base_params = MODEL_PARAMS[model]
    speed_params = base_params['speed_settings'][speed]
    
    # Prepare the prompt for Ollama
    prompt = f"{message}\nAssistant:"
    
    # Call Ollama API
    response = requests.post(
        'http://127.0.0.1:11434/api/generate',
        json={
            'model': model,
            'prompt': prompt,
            'stream': True,
            'temperature': speed_params['temperature'],
            'top_p': speed_params['top_p'],
            'top_k': speed_params['top_k'],
            'max_tokens': base_params['max_tokens']
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

@app.route('/api/history')
def get_history():
    """Return list of all saved threads."""
    threads = load_history()
    return jsonify(threads)

@app.route('/api/history/save', methods=['POST'])
def save_thread_endpoint():
    """Save current thread to history."""
    data = request.json
    thread_id = str(uuid.uuid4())
    save_thread(thread_id, data['model'], data['messages'])
    return jsonify({"thread_id": thread_id})

@app.route('/api/history/<thread_id>')
def get_thread_endpoint(thread_id):
    """Get a specific thread."""
    thread = get_thread(thread_id)
    if thread:
        return jsonify(thread)
    return jsonify({"error": "Thread not found"}), 404

if __name__ == '__main__':
    # Ensure history directory exists
    HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    
    # Run the application
    app.run(debug=True, port=5000)
