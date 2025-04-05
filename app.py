from flask import Flask, render_template, request, jsonify, send_from_directory, session
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
app.secret_key = os.urandom(24)  # Generate a secure secret key for sessions
CORS(app)

# Configuration
HISTORY_DIR = Path(os.path.expanduser("~/.freethinkers/history/"))
MAX_HISTORY = 100

# Make sure history directory exists with proper permissions
HISTORY_DIR.mkdir(parents=True, exist_ok=True)
try:
    # Ensure the directory is readable and writable
    os.chmod(HISTORY_DIR, 0o755)
    print(f"History directory ready: {HISTORY_DIR}")
except Exception as e:
    print(f"Warning: Could not set permissions on history directory: {e}")

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
        "num_gpu": 1,
        "num_thread": 8,
        "num_batch": 2,
        "f16_kv": True,
        "low_vram": True,
        "speed_settings": {
            "slow": {"temperature": 0.8, "top_p": 0.9, "top_k": 50},
            "medium": {"temperature": 0.7, "top_p": 0.95, "top_k": 40},
            "fast": {"temperature": 0.6, "top_p": 0.9, "top_k": 30, "max_tokens": 512}
        },
        "prompt_guide": {
            "use_case_title": "Creative writing, artistic responses, nuanced storytelling",
            "use_case": "Creative writing, artistic responses, nuanced storytelling",
            "example_prompt": "Write a short story about a dragon who befriends a human child.",
            "tip": "Best for creative and imaginative writing tasks, like storytelling and poetry."
        },
        "limits": {
            "max_tokens": 1024,
            "max_input_chars": 256
        }
    }
}

TOKEN_COUNTS = {
    "mistral-7b": {
        "max_tokens": 2048,
        "tokenizer": "default"
    },
    "llama3.2": {
        "max_tokens": 2048,
        "tokenizer": "default"
    },
    "gemma-2b-it": {
        "max_tokens": 1024,
        "tokenizer": "default"
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
    # Ensure history directory exists
    HISTORY_DIR.mkdir(parents=True, exist_ok=True)
    
    threads = []
    try:
        # Check if directory exists and has files
        if not HISTORY_DIR.exists() or not any(HISTORY_DIR.iterdir()):
            print(f"History directory empty or not accessible: {HISTORY_DIR}")
            return threads
            
        # Sort by modification time to get newest first
        json_files = sorted(HISTORY_DIR.glob("*.json"), 
                          key=lambda x: x.stat().st_mtime, 
                          reverse=True)[:MAX_HISTORY]
        
        print(f"Found {len(json_files)} history files")
        
        for file in json_files:
            try:
                with open(file, 'r') as f:
                    thread = json.load(f)
                    # Validate thread structure
                    if not isinstance(thread, dict) or 'id' not in thread or 'messages' not in thread:
                        print(f"Invalid thread format in {file}")
                        continue
                    if not isinstance(thread['messages'], list):
                        print(f"Invalid messages format in {file}")
                        continue
                    threads.append(thread)
            except json.JSONDecodeError as e:
                print(f"JSON error in thread file {file}: {e}")
                continue
            except Exception as e:
                print(f"Error loading thread file {file}: {e}")
                continue
    except Exception as e:
        print(f"Error loading history: {e}")
    
    print(f"Loaded {len(threads)} valid threads from history")
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

@app.route('/api/chat', methods=['GET', 'POST'])
def chat():
    # Check for SSE (Server-Sent Events) request
    if request.method == 'GET':
        # Get parameters from the session
        model = session.get('model', 'mistral-7b')
        messages = session.get('messages', [])
        parameters = session.get('parameters', {})
        
        if not messages:
            return jsonify({"error": "No messages in session. Send a POST request first."}), 400
        
        # Format messages for Ollama
        prompt = ""
        for msg in messages:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            if role == 'user':
                prompt += f"User: {content}\n"
            elif role == 'assistant':
                prompt += f"Assistant: {content}\n"
        
        # Add final assistant prompt
        prompt += "Assistant:"
            
        def generate_events():
            try:
                # Get parameters from session
                temperature = float(parameters.get('temperature', 0.7))
                top_p = float(parameters.get('top_p', 0.95))
                top_k = int(parameters.get('top_k', 40))
                repetition_penalty = float(parameters.get('repetition_penalty', 1.1))
                
                # Get model parameters
                model_params = MODEL_PARAMS.get(model, {})
                max_tokens = model_params.get('limits', {}).get('max_tokens', 2048)
                
                print(f"Streaming for model: {model}")
                print(f"Temperature: {temperature}, Top-P: {top_p}, Top-K: {top_k}")
                
                # Default Ollama parameters
                ollama_params = {
                    'model': model,
                    'prompt': prompt,
                    'stream': True,
                    'temperature': temperature,
                    'top_p': top_p,
                    'top_k': top_k,
                    'max_tokens': max_tokens,
                    'num_gpu': 1,
                    'num_thread': 6,
                    'mirostat': model_params.get('mirostat', 2),
                    'mirostat_tau': model_params.get('mirostat_tau', 0.7),
                    'mirostat_eta': model_params.get('mirostat_eta', 0.1),
                    'repeat_penalty': repetition_penalty,
                    'seed': -1,
                    'f16_kv': True,
                    'tfs_z': model_params.get('tfs_z', 1.0),
                }
                
                # Add model-specific parameters
                if model == 'gemma-2b-it':
                    ollama_params.update({
                        'num_thread': model_params.get('num_thread', 8),
                        'num_batch': model_params.get('num_batch', 2),
                        'low_vram': model_params.get('low_vram', True),
                        'max_tokens': min(model_params.get('limits', {}).get('max_tokens', 1024), max_tokens)
                    })
                
                print(f"Using Ollama parameters: {ollama_params}")
                
                # Make request to Ollama
                response = requests.post(
                    'http://127.0.0.1:11434/api/generate',
                    json=ollama_params,
                    stream=True,
                    timeout=300
                )
                
                for line in response.iter_lines():
                    if line:
                        try:
                            chunk = json.loads(line)
                            if 'response' in chunk:
                                yield f"data: {json.dumps({'content': chunk['response']})}\n\n"
                        except json.JSONDecodeError as e:
                            print(f"JSON decode error: {e}, line: {line}")
                            continue
                            
                # End of stream
                yield f"data: {json.dumps({'done': True})}\n\n"
                
            except Exception as e:
                print(f"Error in stream: {str(e)}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
                yield f"data: {json.dumps({'done': True})}\n\n"
        
        return app.response_class(generate_events(), mimetype='text/event-stream')
    
    # Handle POST request (initialize chat)
    elif request.method == 'POST':
        data = request.get_json()
        messages = data.get('messages', [])
        model = data.get('model', 'mistral-7b')
        
        # Extract parameters
        parameters = {
            'temperature': float(data.get('temperature', 0.7)),
            'top_p': float(data.get('top_p', 0.95)),
            'top_k': int(data.get('top_k', 40)),
            'repetition_penalty': float(data.get('repetition_penalty', 1.1)),
            'context_window': int(data.get('context_window', 2048))
        }
        
        print(f"Received chat request for model: {model}")
        print(f"Parameters: {parameters}")
        print(f"Message count: {len(messages)}")
        
        # Validate model
        if model not in MODEL_PARAMS:
            return jsonify({"error": f"Model '{model}' not found"}), 404
        
        try:
            # Validate messages
            if not messages:
                return jsonify({"error": "No messages provided"}), 400
            
            # Store in session for the GET request
            session['model'] = model
            session['messages'] = messages
            session['parameters'] = parameters
            
            return jsonify({"status": "ok", "message": "Chat initialized"})
            
        except Exception as e:
            print(f"Error initializing chat: {e}")
            return jsonify({
                'error': 'Failed to initialize chat',
                'error_info': str(e)
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

@app.route('/api/token_count', methods=['POST'])
def count_tokens():
    """Count tokens in a message for a specific model."""
    try:
        data = request.json
        if not data:
            print("Token count API received empty request")
            return jsonify({
                'token_count': 0,
                'max_tokens': 2048,
                'percentage': 0,
                'status': 'success'
            })
            
        model = data.get('model', 'mistral-7b')
        text = data.get('text', '')
        
        # For Ollama models, use a simpler approach to count tokens
        # Approximate token count based on words and characters
        words = len(text.split())
        chars = len(text)
        
        # Simple approximation: ~4 chars per token on average
        token_count = max(1, int(chars / 4))
        
        # Get model-specific limits
        model_info = TOKEN_COUNTS.get(model, {
            'max_tokens': 2048,
            'tokenizer': 'default'
        })
        
        return jsonify({
            'token_count': token_count,
            'max_tokens': model_info['max_tokens'],
            'percentage': (token_count / model_info['max_tokens']) * 100,
            'status': 'success'
        })
            
    except Exception as e:
        print(f"Error counting tokens: {str(e)}")
        # Return a default response instead of an error
        return jsonify({
            'token_count': 0,
            'max_tokens': 2048,
            'percentage': 0,
            'status': 'success',
            'error_info': str(e)
        })

@app.route('/api/models/<model_name>')
def get_model_details(model_name):
    """Get details about a specific model."""
    try:
        # Check if model exists in our model params
        if model_name in MODEL_PARAMS:
            # For now, return some basic info
            return jsonify({
                'name': model_name,
                'size': 1024 * 1024 * 500,  # Placeholder size (500MB)
                'modified': datetime.now().isoformat(),
                'parameters': MODEL_PARAMS[model_name]
            })
        
        # Try to get info from Ollama
        response = requests.get(f'http://localhost:11434/api/show', 
                               json={'name': model_name})
        
        if response.status_code == 200:
            model_info = response.json()
            return jsonify({
                'name': model_name,
                'size': model_info.get('size', 0),
                'modified': model_info.get('modified', datetime.now().isoformat()),
                'parameters': MODEL_PARAMS.get(model_name, {})
            })
        else:
            return jsonify({'error': 'Model not found'}), 404
            
    except Exception as e:
        print(f"Error getting model details: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/download', methods=['POST'])
def download_model():
    """Download a new model."""
    try:
        data = request.json
        model_name = data.get('name')
        
        if not model_name:
            return jsonify({'error': 'Model name is required'}), 400
        
        # Call Ollama API to pull the model
        response = requests.post('http://localhost:11434/api/pull',
                                json={'name': model_name})
        
        if response.status_code == 200:
            # Add the model to our MODEL_PARAMS if it's not there
            if model_name not in MODEL_PARAMS:
                MODEL_PARAMS[model_name] = {
                    'temperature': 0.7,
                    'top_p': 0.95,
                    'top_k': 40,
                    'repetition_penalty': 1.1,
                    'context_window': 2048,
                    'speed_settings': {
                        'slow': {'temperature': 0.8, 'top_p': 0.9, 'top_k': 50},
                        'medium': {'temperature': 0.7, 'top_p': 0.95, 'top_k': 40},
                        'fast': {'temperature': 0.6, 'top_p': 0.9, 'top_k': 30}
                    }
                }
            
            return jsonify({'message': f'Model {model_name} downloaded successfully'})
        else:
            return jsonify({'error': 'Failed to download model'}), 500
            
    except Exception as e:
        print(f"Error downloading model: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Free Thinkers - Local AI Chat Interface')
    parser.add_argument('--port', type=int, default=5000, help='Port to run the application on')
    parser.add_argument('--host', type=str, default='127.0.0.1', help='Host to run the application on')
    args = parser.parse_args()
    
    app.run(host=args.host, port=args.port, debug=True)
