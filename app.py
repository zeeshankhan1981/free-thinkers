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
from app.templates_api import templates_api
from app.parameter_profiles_api import parameter_profiles_api
from app.context_manager_api import context_manager_api
from app.model_chain_api import model_chain_api

# Explicitly setting correct paths for templates and static files
app = Flask(__name__, 
           template_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app/templates'),
           static_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static'))
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
            "max_tokens": 4096,  # Increased for better user experience
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
        "gpu_layers": 40,  # Llama models benefit from more GPU layers
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
            "max_tokens": 4096,  # Increased for better user experience
            "max_input_chars": 2048
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
        "num_thread": 8,
        "num_batch": 4,
        "max_tokens": 1024,     # Limit output tokens for faster responses
        "use_gpu": True,        # Force GPU usage for better performance
        "gpu_layers": 42,       # Optimize GPU utilization
        "low_vram": False,      # Assuming sufficient GPU memory
        "speed_settings": {
            "slow": {"temperature": 0.75, "top_p": 0.9, "top_k": 40, "max_tokens": 2048},
            "medium": {"temperature": 0.65, "top_p": 0.85, "top_k": 30, "max_tokens": 1024},
            "fast": {"temperature": 0.5, "top_p": 0.75, "top_k": 20, "max_tokens": 512}
        },
        "prompt_guide": {
            "use_case_title": "Multimodal image analysis and description",
            "use_case": "This model can analyze images and provide descriptions or answer questions about them.",
            "example_prompt": "What's in this image? Provide a detailed description.",
            "tip": "For best results, upload clear images and ask specific questions about the content."
        },
        "limits": {
            "max_tokens": 4096,  # Increased for better user experience
            "max_input_chars": 2048
        }
    }
}

# Add specific model configs for models detected in the Ollama installation
def initialize_model_params():
    """Initialize model parameters for all available models."""
    try:
        # Get all available models from Ollama
        response = requests.get('http://localhost:11434/api/tags')
        if response.status_code == 200:
            models = response.json().get('models', [])
            
            for model in models:
                model_name = model['name']
                # If the model doesn't have parameters yet, set default ones
                if model_name not in MODEL_PARAMS:
                    # Create a deep copy of default params to avoid reference issues
                    params = json.loads(json.dumps(DEFAULT_MODEL_PARAMS))
                    
                    # Customize based on model family if possible
                    family = model.get('details', {}).get('family', '').lower()
                    parameter_size = model.get('details', {}).get('parameter_size', '').lower()
                    
                    # Set model-specific prompt guides
                    if model_name == "gemma3:4b":
                        params['prompt_guide'] = {
                            "use_case_title": "Reasoning and creative content generation",
                            "use_case": "This 4B Gemma3 model excels at medium-complexity reasoning tasks, creative content generation, and factual responses.",
                            "example_prompt": "Explain what causes the Northern Lights and why they appear in different colors.",
                            "tip": "Works well with prompts that ask for step-by-step explanations or creative content creation."
                        }
                    elif model_name == "llama3.1:8b":
                        params['prompt_guide'] = {
                            "use_case_title": "Advanced reasoning and coding assistance",
                            "use_case": "This 8B Llama3.1 model has strong reasoning and coding capabilities, with good general knowledge.",
                            "example_prompt": "Write a Python function to implement binary search and explain the algorithm.",
                            "tip": "Particularly effective for coding tasks and technical explanations that need precise reasoning."
                        }
                    elif model_name == "llama2-uncensored:7b":
                        params['prompt_guide'] = {
                            "use_case_title": "Unrestricted creative content",
                            "use_case": "This uncensored Llama2 model has fewer content restrictions and works well for creative and speculative explorations.",
                            "example_prompt": "Write a grimdark fantasy story opening with morally gray characters.",
                            "tip": "Best for creative writing with mature themes where standard models might be more restrictive."
                        }
                    elif model_name == "phi3:3.8b":
                        params['prompt_guide'] = {
                            "use_case_title": "Concise explanations and code snippets",
                            "use_case": "This 3.8B Phi3 model is excellent for shorter, precise responses and performs well on coding despite its compact size.",
                            "example_prompt": "Explain the difference between mutexes and semaphores in concurrent programming.",
                            "tip": "Keep prompts focused and specific for best results with this compact but efficient model."
                        }
                    elif model_name == "zephyr:latest":
                        params['prompt_guide'] = {
                            "use_case_title": "Well-rounded assistant with good instruction following",
                            "use_case": "This Zephyr model excels at following instructions precisely and providing helpful, balanced responses.",
                            "example_prompt": "Create a meal plan for a vegetarian athlete, including macronutrient breakdown.",
                            "tip": "Best when given clear, specific instructions with any constraints clearly stated."
                        }
                    elif model_name == "gemma3:1b":
                        params['prompt_guide'] = {
                            "use_case_title": "Fast responses for simple queries",
                            "use_case": "This 1B Gemma3 model is very efficient for simple questions and basic tasks, with fast inference times.",
                            "example_prompt": "What are three ways to reduce daily water usage at home?",
                            "tip": "Keep questions straightforward and expectations modest - this is a very compact model."
                        }
                    # For models that aren't specifically handled, use family-based defaults
                    elif 'llama' in family:
                        params['prompt_guide'] = {
                            "use_case_title": "Versatile language tasks and reasoning",
                            "use_case": "This LLaMA-based model handles a variety of language tasks with good reasoning capabilities.",
                            "example_prompt": "Compare and contrast renewable energy sources, focusing on efficiency and environmental impact.",
                            "tip": "Performs well with a wide range of tasks from creative writing to reasoning and analysis."
                        }
                    elif 'gemma' in family:
                        params['prompt_guide'] = {
                            "use_case_title": "Efficient and balanced responses",
                            "use_case": "This Gemma model provides balanced performance with good efficiency for everyday tasks.",
                            "example_prompt": "Summarize the key events of World War II in chronological order.",
                            "tip": "Great for factual content and summaries with a good balance of detail and brevity."
                        }
                    elif 'mistral' in family:
                        params['prompt_guide'] = {
                            "use_case_title": "Strong reasoning with efficient processing",
                            "use_case": "This Mistral model offers excellent reasoning capabilities with efficient processing.",
                            "example_prompt": "Explain how GPUs accelerate machine learning workloads compared to CPUs.",
                            "tip": "Excels at explanations that require logical reasoning and connecting concepts."
                        }
                    elif 'phi' in family:
                        params['prompt_guide'] = {
                            "use_case_title": "Compact but capable assistant",
                            "use_case": "This Phi model delivers impressive performance for its compact size, especially on coding and logic tasks.",
                            "example_prompt": "Write a function to check if a string is a palindrome, with examples.",
                            "tip": "Despite its smaller parameter count, works well for coding and logical reasoning tasks."
                        }
                    
                    # Set the model parameters
                    MODEL_PARAMS[model_name] = params
                    print(f"Added parameters and prompt guide for model: {model_name}")
            
            print(f"Initialized parameters for {len(MODEL_PARAMS)} models")
    except Exception as e:
        print(f"Error initializing model parameters: {str(e)}")

# Initialize model parameters on startup
initialize_model_params()

TOKEN_COUNTS = {
    "mistral-7b": {
        "max_tokens": 4096,
        "tokenizer": "default"
    },
    "llama3.2": {
        "max_tokens": 4096,
        "tokenizer": "default"
    },
    "gemma-2b-it": {
        "max_tokens": 4096,
        "tokenizer": "default"
    },
    "llava-phi3:latest": {
        "max_tokens": 4096,
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
app.register_blueprint(templates_api, url_prefix='/templates')
app.register_blueprint(parameter_profiles_api)
app.register_blueprint(context_manager_api)
app.register_blueprint(model_chain_api)

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
                
                # Enhanced Ollama parameters with GPU optimization
                ollama_params = {
                    'model': model,
                    'prompt': prompt,
                    'stream': True,
                    'temperature': temperature,
                    'top_p': top_p,
                    'top_k': top_k,
                    'max_tokens': model_params.get('max_tokens', 1024),
                    'num_gpu': model_params.get('num_gpu', 1),
                    'num_thread': model_params.get('num_thread', 8),
                    'num_batch': model_params.get('num_batch', 4),
                    'mirostat': model_params.get('mirostat', 0),  # Disable mirostat for speed
                    'repeat_penalty': repetition_penalty,
                    'seed': -1,
                    'f16_kv': model_params.get('f16_kv', True),
                    'use_gpu': model_params.get('use_gpu', True), # Ensure GPU usage
                    'gpu_layers': model_params.get('gpu_layers', 42), # Optimize GPU layer split
                    'tfs_z': model_params.get('tfs_z', 1.0),
                }
                
                # Add model-specific parameters for multimodal handling
                if model.startswith('llava'):
                    ollama_params.update({
                        'num_thread': model_params.get('num_thread', 8),
                        'num_batch': model_params.get('num_batch', 4),
                        'gpu_layers': model_params.get('gpu_layers', 42),
                        'use_gpu': True
                    })
                elif model == 'gemma-2b-it':
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

@app.route('/api/chat_with_image', methods=['POST'])
def chat_with_image():
    """Handle chat with image upload for multimodal models."""
    try:
        # Get form data
        model = request.form.get('model', 'llava-phi3:latest')
        prompt = request.form.get('prompt', '')
        temperature = float(request.form.get('temperature', 0.7))
        top_p = float(request.form.get('top_p', 0.95))
        top_k = int(request.form.get('top_k', 40))
        
        # Check if image is in the request
        if 'image' not in request.files:
            return jsonify({"error": "No image uploaded"}), 400
            
        image_file = request.files['image']
        
        # Validate image file
        if image_file.filename == '':
            return jsonify({"error": "Empty image file"}), 400
            
        # Check if it's a valid image type
        if not image_file.content_type.startswith('image/'):
            return jsonify({"error": "Invalid file type. Please upload an image."}), 400
        
        # Read the image file and encode to base64
        import base64
        image_data = base64.b64encode(image_file.read()).decode('utf-8')
        
        # Format the prompt for the multimodal model
        # For Ollama's llava-phi3, we format with image data directly in the prompt
        formatted_prompt = prompt if prompt else "Describe this image in detail."
        
        # Log info about the request
        print(f"Processing image request with model: {model}")
        print(f"Image type: {image_file.content_type}, Prompt: {formatted_prompt}")
        
        def generate_events():
            try:
                # Get model parameters for optimization
                model_params = MODEL_PARAMS.get(model, {})
                max_tokens = model_params.get('limits', {}).get('max_tokens', 2048)
                
                print(f"Streaming for model: {model}")
                print(f"Temperature: {temperature}, Top-P: {top_p}, Top-K: {top_k}")
                
                # Prepare optimized Ollama API request
                ollama_request = {
                    'model': model,
                    'prompt': formatted_prompt,
                    'stream': True,
                    'images': [image_data],  # Pass base64 image data to Ollama
                    'temperature': temperature,
                    'top_p': top_p,
                    'top_k': top_k,
                    'max_tokens': model_params.get('max_tokens', 1024),
                    'num_gpu': model_params.get('num_gpu', 1),
                    'num_thread': model_params.get('num_thread', 8),
                    'num_batch': model_params.get('num_batch', 4),
                    'f16_kv': model_params.get('f16_kv', True),
                    'use_gpu': model_params.get('use_gpu', True), # Ensure GPU usage
                    'gpu_layers': model_params.get('gpu_layers', 42), # Optimize GPU layer split
                    'cache_mode': 'balanced'  # Optimize cache usage
                }
                
                # Add model-specific parameters for multimodal handling
                if model.startswith('llava'):
                    ollama_request.update({
                        'num_thread': model_params.get('num_thread', 8),
                        'num_batch': model_params.get('num_batch', 4),
                        'gpu_layers': model_params.get('gpu_layers', 42),
                        'use_gpu': True
                    })
                elif model == 'gemma-2b-it':
                    ollama_request.update({
                        'num_thread': model_params.get('num_thread', 8),
                        'num_batch': model_params.get('num_batch', 2),
                        'low_vram': model_params.get('low_vram', True),
                        'max_tokens': min(model_params.get('limits', {}).get('max_tokens', 1024), max_tokens)
                    })
                
                print(f"Using Ollama parameters: {ollama_request}")
                
                # Make request to Ollama
                response = requests.post(
                    'http://127.0.0.1:11434/api/generate',
                    json=ollama_request,
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
                print(f"Error in image processing stream: {str(e)}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
                yield f"data: {json.dumps({'done': True})}\n\n"
        
        return app.response_class(generate_events(), mimetype='text/event-stream')
        
    except Exception as e:
        print(f"Error in chat_with_image: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/guided_chat', methods=['POST'])
def guided_chat():
    """Handle guided chat with prompt recommendations."""
    data = request.json
    message = data.get('message', '')
    model = data.get('model', 'mistral-7b')
    template_id = data.get('template_id', None)
    template_values = data.get('template_values', {})
    
    if model not in MODEL_PARAMS:
        return jsonify({"error": "Invalid model"}), 400
    
    # If template_id is provided, use it to generate a prompt
    if template_id:
        try:
            from app.prompt_templates import fill_template
            message = fill_template(template_id, model, **template_values)
        except Exception as e:
            return jsonify({"error": f"Template error: {str(e)}"}), 400
    # Otherwise, fallback to the old guide behavior
    else:
        # Get the guide for this model
        guide = MODEL_PARAMS[model].get('prompt_guide', {})
        
        # If no message provided, use the example prompt
        if not message and 'example_prompt' in guide:
            message = guide['example_prompt']
    
    # Set the message in data
    data['message'] = message
    
    # Save the original message in request so it's available to the chat function
    request.json = data
    
    # Forward to the regular chat endpoint
    response = chat()
    
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
