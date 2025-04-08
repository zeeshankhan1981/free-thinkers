"""
API routes for model chain functionality in Free Thinkers
"""

from flask import Blueprint, jsonify, request
from . import model_chain
import asyncio

model_chain_api = Blueprint('model_chain_api', __name__, url_prefix='/api/chains')

# Create a model chain instance
chain_manager = model_chain.ModelChain()

@model_chain_api.route('/', methods=['GET'])
def get_all_chains():
    """Get all available model chains."""
    return jsonify(chain_manager.get_available_chains())

@model_chain_api.route('/<chain_id>', methods=['GET'])
def get_chain(chain_id):
    """Get a specific model chain by ID."""
    chain = chain_manager.get_chain(chain_id)
    if chain:
        return jsonify(chain)
    return jsonify({'error': 'Chain not found'}), 404

@model_chain_api.route('/', methods=['POST'])
def create_chain():
    """Create a new model chain."""
    data = request.json
    
    if not data:
        return jsonify({
            'status': 'error',
            'message': 'No data provided'
        }), 400
    
    if 'id' not in data or 'name' not in data or 'steps' not in data:
        return jsonify({
            'status': 'error',
            'message': 'Chain ID, name, and steps are required'
        }), 400
    
    # Save the chain
    success = chain_manager.save_chain(data['id'], {
        'name': data['name'],
        'description': data.get('description', ''),
        'steps': data['steps']
    })
    
    if success:
        return jsonify({
            'status': 'success',
            'message': 'Chain saved successfully'
        })
    else:
        return jsonify({
            'status': 'error',
            'message': 'Failed to save chain'
        }), 500

@model_chain_api.route('/<chain_id>', methods=['DELETE'])
def delete_chain(chain_id):
    """Delete a model chain."""
    success = chain_manager.delete_chain(chain_id)
    
    if success:
        return jsonify({
            'status': 'success',
            'message': 'Chain deleted successfully'
        })
    else:
        return jsonify({
            'status': 'error',
            'message': 'Failed to delete chain'
        }), 500

@model_chain_api.route('/suggest', methods=['POST'])
def suggest_chain():
    """Suggest a chain based on user input."""
    data = request.json
    
    if not data or 'input' not in data:
        return jsonify({
            'status': 'error',
            'message': 'No input provided'
        }), 400
    
    suggested_chain = chain_manager.suggest_chain(data['input'])
    
    return jsonify({
        'status': 'success',
        'suggested_chain': suggested_chain
    })

@model_chain_api.route('/run', methods=['POST'])
def run_chain():
    """Run a model chain with user input."""
    data = request.json
    
    if not data:
        return jsonify({
            'status': 'error',
            'message': 'No data provided'
        }), 400
    
    chain_id = data.get('chain_id')
    user_input = data.get('input')
    options = data.get('options', {})
    
    if not chain_id or not user_input:
        return jsonify({
            'status': 'error',
            'message': 'Chain ID and input are required'
        }), 400
    
    # Validate that the chain exists
    chain = chain_manager.get_chain(chain_id)
    if not chain:
        return jsonify({
            'status': 'error',
            'message': f"Chain '{chain_id}' not found"
        }), 404
    
    # Execute chain
    # Note: Using async functions in Flask requires special handling
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        result = loop.run_until_complete(chain_manager.run_chain(chain_id, user_input, options))
        
        # Ensure we have an output field for consistency
        if 'output' not in result or not result['output']:
            result['output'] = "No output was generated from the chain."
            
        # Set status to success if not already set
        if 'status' not in result:
            result['status'] = 'success'
            
        return jsonify(result)
    except Exception as e:
        print(f"Error running chain: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    finally:
        loop.close()