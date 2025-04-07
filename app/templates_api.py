"""
API endpoints for the prompt templates functionality in Free Thinkers
"""

from flask import Blueprint, jsonify, request
from app.prompt_templates import get_templates_for_model, list_templates_for_model, fill_template

templates_api = Blueprint('templates_api', __name__, url_prefix='/templates')

@templates_api.route('/list/<model_name>', methods=['GET'])
def get_templates(model_name):
    """Get available templates for a specific model."""
    try:
        templates = list_templates_for_model(model_name)
        return jsonify({
            "status": "success",
            "templates": templates
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

@templates_api.route('/generate', methods=['POST'])
def generate_from_template():
    """Generate a prompt from a template."""
    data = request.json
    
    if not data:
        return jsonify({
            "status": "error",
            "error": "No data provided"
        }), 400
        
    model_name = data.get('model')
    template_name = data.get('template')
    placeholder_values = data.get('values', {})
    
    if not model_name or not template_name:
        return jsonify({
            "status": "error",
            "error": "Model name and template are required"
        }), 400
    
    try:
        prompt = fill_template(template_name, model_name, **placeholder_values)
        return jsonify({
            "status": "success",
            "prompt": prompt
        })
    except ValueError as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 404
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500
