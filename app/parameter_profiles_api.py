"""
API routes for parameter profiles in Free Thinkers
"""

from flask import Blueprint, jsonify, request
from . import parameter_profiles as profiles

parameter_profiles_api = Blueprint('parameter_profiles_api', __name__, url_prefix='/api/parameter_profiles')

@parameter_profiles_api.route('/', methods=['GET'])
def get_all_profiles():
    """Get all parameter profiles."""
    return jsonify(profiles.get_profiles())

@parameter_profiles_api.route('/model/<model_name>', methods=['GET'])
def get_profiles_for_model(model_name):
    """Get parameter profiles for a specific model."""
    return jsonify(profiles.get_profiles_for_model(model_name))

@parameter_profiles_api.route('/custom', methods=['POST'])
def add_profile():
    """Add a new custom parameter profile."""
    data = request.json
    
    if not data:
        return jsonify({
            'status': 'error',
            'message': 'No data provided'
        }), 400
    
    name = data.get('name')
    description = data.get('description', '')
    parameters = data.get('parameters')
    model = data.get('model')
    
    if not name or not parameters:
        return jsonify({
            'status': 'error',
            'message': 'Name and parameters are required'
        }), 400
    
    success, message = profiles.add_custom_profile(name, description, parameters, model)
    
    if success:
        return jsonify({
            'status': 'success',
            'message': message
        })
    else:
        return jsonify({
            'status': 'error',
            'message': message
        }), 500

@parameter_profiles_api.route('/custom/<name>', methods=['DELETE'])
def delete_profile(name):
    """Delete a custom parameter profile."""
    model = request.args.get('model')
    
    success, message = profiles.delete_custom_profile(name, model)
    
    if success:
        return jsonify({
            'status': 'success',
            'message': message
        })
    else:
        return jsonify({
            'status': 'error',
            'message': message
        }), 500

@parameter_profiles_api.route('/<name>', methods=['GET'])
def get_specific_profile(name):
    """Get a specific parameter profile by name."""
    model = request.args.get('model')
    
    profile_params = profiles.get_profile(name, model)
    
    return jsonify({
        'name': name,
        'parameters': profile_params
    })