from flask import Flask, render_template, send_from_directory, jsonify, request, session
import os
import json
import requests
import uuid
from datetime import datetime
from pathlib import Path
from flask_login import current_user
from flask_cors import CORS

from app.models import db
from app.auth import auth, login_manager
from app.conversation_api import conversation_api
from app.user_management_api import user_management_api
from app.model_management import model_management
from app.templates_api import templates_api
from app.parameter_profiles_api import parameter_profiles_api
from app.context_manager_api import context_manager_api
from app.model_chain_api import model_chain_api
from app.system_monitor_api import system_monitor_api
from app.prompt_chain_api import prompt_chain_api
from app.retrieval_api import retrieval_api
from .model_strategies_api import model_strategies_api

# Path to store history
HISTORY_DIR = Path(os.path.expanduser("~/.freethinkers/history/"))
HISTORY_DIR.mkdir(parents=True, exist_ok=True)
MAX_HISTORY = 100

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

def create_app(config_object='config.Config'):
    """Application factory for creating the Flask application."""
    app = Flask(__name__, static_folder='../static', template_folder='templates')
    
    # Load configuration
    app.config.from_object(config_object)
    
    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    
    # Enable CORS
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(auth)
    app.register_blueprint(conversation_api, url_prefix='/api')
    app.register_blueprint(user_management_api, url_prefix='/api')
    app.register_blueprint(model_management, url_prefix='/model_management')
    app.register_blueprint(templates_api, url_prefix='/templates')
    app.register_blueprint(parameter_profiles_api)
    app.register_blueprint(context_manager_api)
    app.register_blueprint(model_chain_api)
    app.register_blueprint(system_monitor_api)
    app.register_blueprint(prompt_chain_api, url_prefix='/api/prompt-chain')
    app.register_blueprint(retrieval_api)
    app.register_blueprint(model_strategies_api, url_prefix='/api/model-strategies')
    
    # Context processor for adding global variables to templates
    @app.context_processor
    def inject_user():
        """Inject user information into all templates."""
        return dict(current_user=current_user)
    
    # Route to serve index.html
    @app.route('/')
    def index():
        """Serve the main application page."""
        return render_template('index.html')
    
    # Route for user profile
    @app.route('/profile')
    def profile():
        """Serve the user profile page."""
        return render_template('profile.html')
    
    # Chat API endpoints
    @app.route('/api/chat', methods=['GET', 'POST'])
    def chat():
        """Handle chat requests with Ollama."""
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
                    
                    # Get model parameters
                    model_params = app.config.get('MODEL_PARAMS', {}).get(model, {})
                    
                    print(f"Streaming for model: {model}")
                    print(f"Temperature: {temperature}, Top-P: {top_p}, Top-K: {top_k}")
                    
                    # Ollama parameters
                    ollama_params = {
                        'model': model,
                        'prompt': prompt,
                        'stream': True,
                        'temperature': temperature,
                        'top_p': top_p,
                        'top_k': top_k
                    }
                    
                    # Add other params if available in model_params
                    for key in ['num_gpu', 'num_thread', 'num_batch', 'f16_kv', 'use_gpu', 'gpu_layers']:
                        if key in model_params:
                            ollama_params[key] = model_params[key]
                    
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
                'top_k': int(data.get('top_k', 40))
            }
            
            print(f"Received chat request for model: {model}")
            print(f"Parameters: {parameters}")
            print(f"Message count: {len(messages)}")
            
            # Validate model
            if model not in app.config.get('MODEL_PARAMS', {}):
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
    
    # Handle image-based chat
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
            formatted_prompt = prompt if prompt else "Describe this image in detail."
            
            # Log info about the request
            print(f"Processing image request with model: {model}")
            print(f"Image type: {image_file.content_type}, Prompt: {formatted_prompt}")
            
            def generate_events():
                try:
                    # Get model parameters for optimization
                    model_params = app.config.get('MODEL_PARAMS', {}).get(model, {})
                    
                    # Prepare Ollama API request
                    ollama_request = {
                        'model': model,
                        'prompt': formatted_prompt,
                        'stream': True,
                        'images': [image_data],  # Pass base64 image data to Ollama
                        'temperature': temperature,
                        'top_p': top_p,
                        'top_k': top_k
                    }
                    
                    # Add other params if available in model_params
                    for key in ['num_gpu', 'num_thread', 'num_batch', 'f16_kv', 'use_gpu', 'gpu_layers']:
                        if key in model_params:
                            ollama_request[key] = model_params[key]
                    
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
    
    # Route to get available models from Ollama
    @app.route('/api/models', methods=['GET'])
    def get_models():
        """Get a list of available models from Ollama."""
        try:
            # Direct request to Ollama API
            response = requests.get('http://127.0.0.1:11434/api/tags', timeout=5)
            
            if response.ok:
                data = response.json()
                if 'models' in data and isinstance(data['models'], list):
                    # Return the list of model names from Ollama
                    model_names = [model['name'] for model in data['models']]
                    print(f"Available models: {model_names}")
                    return jsonify(model_names)
                else:
                    print("Unexpected response format from Ollama API:", data)
                    return jsonify([]), 500
            else:
                print(f"Error connecting to Ollama API: {response.status_code} {response.reason}")
                return jsonify({"error": f"Failed to get models: {response.status_code}"}), response.status_code
        except Exception as e:
            print(f"Exception while getting models: {e}")
            return jsonify({"error": f"Error fetching models: {str(e)}"}), 500

    # Proxy endpoint for Ollama API
    @app.route('/api/ollama/<path:subpath>', methods=['GET', 'POST', 'PUT', 'DELETE'])
    def ollama_proxy(subpath):
        """Proxy requests to Ollama API."""
        try:
            # Forward request to Ollama
            ollama_url = f'http://127.0.0.1:11434/api/{subpath}'
            
            # Forward the request method, headers, and body
            method = request.method
            headers = {k: v for k, v in request.headers.items() if k.lower() not in ['host', 'content-length']}
            data = request.get_data()
            
            # Make the request to Ollama
            response = requests.request(
                method=method,
                url=ollama_url,
                headers=headers,
                data=data,
                stream=True,
                timeout=60
            )
            
            # Return the response from Ollama
            return (response.content, response.status_code, response.headers.items())
        except Exception as e:
            print(f"Error proxying to Ollama API: {e}")
            return jsonify({"error": f"Error proxying to Ollama API: {str(e)}"}), 500
    
    # History API endpoints
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
    
    # API endpoints from original app.py
    @app.route('/api/model_guide/<model_name>')
    def get_model_guide(model_name):
        """Return guide for a specific model."""
        if model_name in app.config.get('MODEL_PARAMS', {}) and 'prompt_guide' in app.config.get('MODEL_PARAMS', {}).get(model_name, {}):
            response = {
                'guide': app.config.get('MODEL_PARAMS', {}).get(model_name, {}).get('prompt_guide', {}),
                'limits': app.config.get('MODEL_PARAMS', {}).get(model_name, {}).get('limits', {})
            }
            return jsonify(response)
        return jsonify({"error": "Model guide not found"}), 404
    
    @app.route('/api/model_guides')
    def get_model_guides():
        """Return prompt guides for all models."""
        guides = {}
        for model, params in app.config.get('MODEL_PARAMS', {}).items():
            if 'prompt_guide' in params:
                guides[model] = {
                    'guide': params['prompt_guide'],
                    'limits': params['limits']
                }
        return jsonify(guides)
    
    @app.route('/api/prompt_guides')
    def get_prompt_guides():
        """Return prompt guides for all models."""
        try:
            # Comprehensive guides based on prompt engineering roadmap
            guides = {
                # Large language models
                'llama3.1:8b': {
                    'title': 'Llama 3.1 (8B) - Detailed Reasoning',
                    'useCases': 'Ideal for complex reasoning, logic puzzles, and creative writing. This model excels at step-by-step problem solving and detailed explanations.',
                    'examples': 'Explain the process of photosynthesis and how it relates to global carbon cycles.',
                    'tips': 'Use chain-of-thought prompting by asking the model to "think step by step" for best results.'
                },
                'llama3.2:latest': {
                    'title': 'Llama 3.2 - General Purpose',
                    'useCases': 'A versatile, general-purpose model for everyday tasks, creative writing, and information retrieval.',
                    'examples': 'What are the key differences between nuclear fusion and nuclear fission?',
                    'tips': 'For complex queries, try breaking them down into sequential parts for more accurate responses.'
                },
                'mistral-7b:latest': {
                    'title': 'Mistral 7B - Precise Information',
                    'useCases': 'Excellent for factual information, code explanation, and technical content. This model prioritizes accuracy.',
                    'examples': 'Explain how TCP/IP protocols ensure reliable data transmission across networks.',
                    'tips': 'Use clear, explicit instructions and consider formatting requirements for structured outputs.'
                },
                
                # Smaller/specialized models
                'phi3:3.8b': {
                    'title': 'Phi-3 (3.8B) - Concise Reasoning',
                    'useCases': 'Optimized for reasoning tasks despite its smaller size. Good for when you need efficient, concise responses.',
                    'examples': 'What are three key considerations when designing a sustainable urban transportation system?',
                    'tips': 'This model works well with few-shot examples when you need specific response formats.'
                },
                'gemma3:4b': {
                    'title': 'Gemma 3 (4B) - Efficient Assistant',
                    'useCases': 'A compact but capable model for general information and assistance with lower compute requirements.',
                    'examples': 'Give me a quick explanation of how blockchain technology works.',
                    'tips': 'Provide clear context and be specific with your requirements for best results.'
                },
                'gemma3:1b': {
                    'title': 'Gemma 3 (1B) - Quick Responses',
                    'useCases': 'Ultra-lightweight model for basic tasks and quick responses when efficiency is prioritized over detail.',
                    'examples': 'What are three healthy breakfast ideas that take less than 10 minutes to prepare?',
                    'tips': 'Keep queries simple and focused. Avoid complex reasoning tasks.'
                },
                'zephyr:latest': {
                    'title': 'Zephyr - Instruction Following',
                    'useCases': 'Excellent at following precise instructions and formatting requirements. Good for structured outputs.',
                    'examples': 'Create a 5-day itinerary for visiting Tokyo, with each day focused on a different area of the city.',
                    'tips': 'Use clear formatting instructions like "respond with a numbered list" or "format as a table".'
                },
                
                # Code models
                'codegemma:2b': {
                    'title': 'CodeGemma (2B) - Code Generation',
                    'useCases': 'Specialized for programming tasks, code explanation, and debugging assistance.',
                    'examples': 'Write a Python function that checks if a string is a valid palindrome, ignoring spaces and punctuation.',
                    'tips': 'Specify the programming language, desired functionality, and any specific requirements or constraints.'
                },
                
                # Math models
                'qwen2-math:1.5b': {
                    'title': 'Qwen2 Math (1.5B) - Mathematical Reasoning',
                    'useCases': 'Specialized for mathematical problems, equations, and numerical reasoning tasks.',
                    'examples': 'Solve the following system of equations: 2x + 3y = 7, 4x - 2y = 10',
                    'tips': 'Ask the model to show its work step-by-step for complex math problems.'
                },
                
                # Multimodal models
                'llava-phi3:latest': {
                    'title': 'LLaVA-Phi3 - Visual Understanding',
                    'useCases': 'Multimodal model capable of understanding and describing images alongside text.',
                    'examples': 'Upload an image and ask: "Describe what you see in this image in detail."',
                    'tips': 'For best results with images, ask specific questions about visual elements rather than general descriptions.'
                },
                
                # Specialty models
                'falcon3:1b': {
                    'title': 'Falcon 3 (1B) - Quick Responses',
                    'useCases': 'Fast, efficient model for simple tasks and basic information requests.',
                    'examples': 'What are the key ingredients in a classic carbonara pasta?',
                    'tips': 'Keep queries concise and straightforward for this lightweight model.'
                },
                'llama2-uncensored:7b': {
                    'title': 'Llama 2 Uncensored (7B)',
                    'useCases': 'Model with fewer content restrictions for research and creative writing purposes.',
                    'examples': 'Write a horror short story set in an abandoned research facility.',
                    'tips': 'Remember that while less restricted, ethical considerations still apply.'
                },
                
                # Default fallback guide
                'default': {
                    'title': 'General AI Assistant',
                    'useCases': 'Ask questions on virtually any topic, request creative content, or get assistance with various tasks.',
                    'examples': 'Explain the concept of quantum computing in simple terms.',
                    'tips': 'Be specific with your questions and provide relevant context for better results.'
                }
            }
            
            # Add model-specific parameter recommendations for each model
            # This supports the parameter optimization part of the prompt engineering roadmap
            parameter_recommendations = {
                'llama3.1:8b': {
                    'temperature': 0.7,
                    'top_p': 0.9,
                    'top_k': 40,
                    'context_window': 0.95,
                    'max_tokens': 2048
                },
                'llama3.2:latest': {
                    'temperature': 0.7,
                    'top_p': 0.9,
                    'top_k': 40,
                    'context_window': 0.95,
                    'max_tokens': 2048
                },
                'mistral-7b:latest': {
                    'temperature': 0.7,
                    'top_p': 0.9,
                    'top_k': 40,
                    'context_window': 0.95,
                    'max_tokens': 2048
                },
                'phi3:3.8b': {
                    'temperature': 0.8,
                    'top_p': 0.9,
                    'top_k': 40,
                    'context_window': 0.95,
                    'max_tokens': 1024
                },
                'gemma3:4b': {
                    'temperature': 0.8,
                    'top_p': 0.9,
                    'top_k': 40,
                    'context_window': 0.95,
                    'max_tokens': 1024
                },
                'gemma3:1b': {
                    'temperature': 0.8,
                    'top_p': 0.9,
                    'top_k': 40,
                    'context_window': 0.9,
                    'max_tokens': 512
                },
                'zephyr:latest': {
                    'temperature': 0.7,
                    'top_p': 0.9,
                    'top_k': 40,
                    'context_window': 0.95,
                    'max_tokens': 1024
                },
                'codegemma:2b': {
                    'temperature': 0.3,  # Lower temperature for more deterministic code
                    'top_p': 0.95,
                    'top_k': 40,
                    'context_window': 0.9,
                    'max_tokens': 1024
                },
                'qwen2-math:1.5b': {
                    'temperature': 0.1,  # Very low temperature for math precision
                    'top_p': 0.95,
                    'top_k': 40,
                    'context_window': 0.9,
                    'max_tokens': 1024
                },
                'llava-phi3:latest': {
                    'temperature': 0.7,
                    'top_p': 0.9,
                    'top_k': 40,
                    'context_window': 0.95,
                    'max_tokens': 1024
                },
                'falcon3:1b': {
                    'temperature': 0.8,
                    'top_p': 0.9,
                    'top_k': 40,
                    'context_window': 0.8,
                    'max_tokens': 512
                },
                'llama2-uncensored:7b': {
                    'temperature': 0.8,  # Higher for more creative outputs
                    'top_p': 0.95,
                    'top_k': 40,
                    'context_window': 0.95,
                    'max_tokens': 2048
                },
                'default': {
                    'temperature': 0.7,
                    'top_p': 0.9,
                    'top_k': 40,
                    'context_window': 0.9,
                    'max_tokens': 1024
                }
            }
            
            # Add parameter recommendations to each guide
            for model_name, params in parameter_recommendations.items():
                if model_name in guides:
                    guides[model_name]['parameters'] = params
            
            return jsonify(guides)
        except Exception as e:
            print(f"Error getting prompt guides: {e}")
            return jsonify({"error": f"Error getting prompt guides: {str(e)}"}), 500
    
    # Add missing API endpoints that are showing errors in the console
    @app.route('/api/token_count', methods=['POST'])
    def count_tokens():
        """Count tokens in a message for a specific model."""
        try:
            data = request.json
            if not data:
                return jsonify({
                    'token_count': 0,
                    'max_tokens': 2048,
                    'percentage': 0,
                    'status': 'success'
                })
                
            model = data.get('model', 'mistral-7b')
            text = data.get('text', '')
            
            # Simple approximation: ~4 chars per token on average
            chars = len(text)
            token_count = max(1, int(chars / 4))
            
            # Get model-specific limits
            model_params = app.config.get('MODEL_PARAMS', {}).get(model, {})
            max_tokens = model_params.get('limits', {}).get('max_tokens', 2048)
            
            return jsonify({
                'token_count': token_count,
                'max_tokens': max_tokens,
                'percentage': (token_count / max_tokens) * 100 if max_tokens else 0,
                'status': 'success'
            })
        except Exception as e:
            print(f"Error counting tokens: {str(e)}")
            return jsonify({
                'token_count': 0,
                'max_tokens': 2048,
                'percentage': 0,
                'status': 'success',
                'error_info': str(e)
            })
    
    @app.route('/parameter_profiles/api/profiles', methods=['GET'])
    def get_profiles():
        """Get parameter profiles."""
        try:
            # Return minimal profile structure expected by frontend
            return jsonify([{
                "id": "default",
                "name": "Default Settings",
                "description": "Standard parameter settings",
                "parameters": {
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "top_k": 40
                },
                "model": "all"
            }])
        except Exception as e:
            print(f"Error getting profiles: {str(e)}")
            return jsonify([])
    
    @app.route('/model_chain/api/chains', methods=['GET'])
    def get_chains():
        """Get model chains."""
        try:
            # Return minimal chain structure expected by frontend
            return jsonify([])
        except Exception as e:
            print(f"Error getting chains: {str(e)}")
            return jsonify([])
    
    @app.route('/templates/api/list', methods=['GET'])
    def get_templates():
        """Get templates."""
        try:
            model = request.args.get('model', 'mistral-7b')
            # Return minimal templates structure expected by frontend
            return jsonify([{
                "id": "basic",
                "name": "Basic Template",
                "description": "A basic prompt template",
                "prompt": "Please answer the following question: {{query}}",
                "variables": ["query"],
                "category": "General",
                "model": model
            }])
        except Exception as e:
            print(f"Error getting templates: {str(e)}")
            return jsonify([])
    
    # Static files routes
    @app.route('/static/<path:path>')
    def serve_static(path):
        """Serve static files."""
        return send_from_directory('../static', path)
    
    # Catch-all route for SPA
    @app.route('/<path:path>')
    def catch_all(path):
        """Catch-all route for single page application."""
        # If the path is a known API endpoint, let Flask handle it
        if path.startswith('api/'):
            return app.handle_request()
        # Otherwise, return index.html
        return render_template('index.html')
    
    return app
