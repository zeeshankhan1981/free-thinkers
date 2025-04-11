from flask import Blueprint, jsonify, request, make_response
from flask_cors import cross_origin
import requests
import json
from pathlib import Path
import os

model_management = Blueprint('model_management', __name__, url_prefix='/model_management')

# Directory for model downloads
MODEL_DOWNLOAD_DIR = Path(os.path.expanduser("~/.freethinkers/models/"))

@model_management.route('/api/models', methods=['GET'])
@cross_origin()
def list_models():
    """List all available models with CORS support."""
    try:
        response = requests.get('http://localhost:11434/api/tags')
        if response.status_code == 200:
            models = response.json().get('models', [])
            # Extract just the model names
            model_names = [model['name'] for model in models]
            resp = make_response(jsonify(model_names))
            resp.headers['Access-Control-Allow-Origin'] = '*' 
            resp.headers['Access-Control-Allow-Methods'] = 'GET'
            return resp
        else:
            return jsonify([]), 500
    except Exception as e:
        print(f"Error fetching models: {str(e)}")
        return jsonify([]), 500

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
        
        # Download model
        response = requests.post(
            'http://localhost:11434/api/pull',
            json={'name': model_name}
        )
        
        if response.status_code == 200:
            resp = make_response(jsonify({
                'message': f'Model {model_name} downloaded successfully',
                'status': 'success'
            }))
            resp.headers['Access-Control-Allow-Origin'] = '*' 
            resp.headers['Access-Control-Allow-Methods'] = 'POST'
            return resp
        else:
            return jsonify({
                'error': 'Failed to download model',
                'status': 'error'
            }), 500
    except Exception as e:
        print(f"Error downloading model: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@model_management.route('/api/models/version', methods=['GET'])
@cross_origin()
def get_model_version():
    """Get model version information."""
    model_name = request.args.get('name')
    
    if not model_name:
        return jsonify({
            'error': 'Model name is required',
            'status': 'error'
        }), 400
    
    try:
        response = requests.get(f'http://localhost:11434/api/tags/{model_name}')
        if response.status_code == 200:
            model_info = response.json()
            resp = make_response(jsonify({
                'status': 'success',
                'info': model_info
            }))
            resp.headers['Access-Control-Allow-Origin'] = '*' 
            resp.headers['Access-Control-Allow-Methods'] = 'GET'
            return resp
        else:
            return jsonify({
                'error': 'Model not found',
                'status': 'error'
            }), 404
    except Exception as e:
        print(f"Error fetching model info: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
