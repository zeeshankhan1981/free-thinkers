from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
import requests
import json
from pathlib import Path
import os

model_management = Blueprint('model_management', __name__)

# Directory for model downloads
MODEL_DOWNLOAD_DIR = Path(os.path.expanduser("~/.freethinkers/models/"))

@model_management.route('/api/models/list', methods=['GET'])
def list_models():
    """List all available models."""
    try:
        response = requests.get('http://localhost:11434/api/tags')
        if response.status_code == 200:
            models = response.json().get('models', [])
            return jsonify({
                'models': models,
                'status': 'success'
            })
        else:
            return jsonify({
                'error': 'Failed to fetch models',
                'status': 'error'
            }), 500
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@model_management.route('/api/models/download', methods=['POST'])
@cross_origin()
def download_model():
    """Download a new model."""
    data = request.json
    model_name = data.get('name')
    model_url = data.get('url')
    
    if not model_name or not model_url:
        return jsonify({
            'error': 'Model name and URL are required',
            'status': 'error'
        }), 400

    try:
        # Create download directory if it doesn't exist
        MODEL_DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
        
        # Download the model with progress tracking
        response = requests.get(model_url, stream=True)
        total_size = int(response.headers.get('content-length', 0))
        
        download_path = MODEL_DOWNLOAD_DIR / f"{model_name}.gguf"
        
        with open(download_path, 'wb') as f:
            downloaded = 0
            for data in response.iter_content(chunk_size=4096):
                downloaded += len(data)
                f.write(data)
                progress = (downloaded / total_size) * 100
                
                # Send progress update to frontend
                yield f"data: {json.dumps({'progress': progress})}\n\n"
        
        # Create model in Ollama
        response = requests.post(
            'http://localhost:11434/api/create',
            json={
                'name': model_name,
                'file': str(download_path)
            }
        )
        
        if response.status_code == 200:
            return jsonify({
                'message': f'Model {model_name} downloaded and created successfully',
                'status': 'success'
            })
        else:
            return jsonify({
                'error': f'Failed to create model in Ollama',
                'status': 'error'
            }), 500
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@model_management.route('/api/models/version', methods=['GET'])
def get_model_version():
    """Get model version information."""
    model_name = request.args.get('name')
    
    if not model_name:
        return jsonify({
            'error': 'Model name is required',
            'status': 'error'
        }), 400

    try:
        response = requests.get(
            f'http://localhost:11434/api/show?name={model_name}'
        )
        
        if response.status_code == 200:
            model_info = response.json()
            return jsonify({
                'version': model_info.get('version', 'unknown'),
                'status': 'success'
            })
        else:
            return jsonify({
                'error': 'Failed to fetch model information',
                'status': 'error'
            }), 500
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
