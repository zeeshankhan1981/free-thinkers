"""
API routes for smart context management in Free Thinkers
"""

from flask import Blueprint, jsonify, request
from . import context_manager

context_manager_api = Blueprint('context_manager_api', __name__, url_prefix='/api/context')

# Create a context manager instance
context_mgr = context_manager.ContextManager()

@context_manager_api.route('/optimize', methods=['POST'])
def optimize_context():
    """Optimize conversation context for a specific model."""
    data = request.json
    
    if not data:
        return jsonify({
            'status': 'error',
            'message': 'No data provided'
        }), 400
    
    messages = data.get('messages', [])
    model_name = data.get('model', 'default')
    thread_id = data.get('thread_id')
    
    # Get context window for model
    context_window = data.get('context_window', 4096)
    
    # Optimize context
    optimized_messages = context_mgr.optimize_context(
        messages=messages,
        context_window=context_window,
        thread_id=thread_id
    )
    
    # Get token usage information
    token_usage = context_mgr.get_messages_token_usage(messages)
    optimized_usage = context_mgr.get_messages_token_usage(optimized_messages)
    
    return jsonify({
        'status': 'success',
        'optimized_messages': optimized_messages,
        'original_count': len(messages),
        'optimized_count': len(optimized_messages),
        'original_usage': token_usage,
        'optimized_usage': optimized_usage
    })

@context_manager_api.route('/usage', methods=['POST'])
def get_usage():
    """Get token usage information for a conversation."""
    data = request.json
    
    if not data:
        return jsonify({
            'status': 'error',
            'message': 'No data provided'
        }), 400
    
    messages = data.get('messages', [])
    model_name = data.get('model', 'default')
    
    # Get context window for model
    context_window = data.get('context_window', 4096)
    context_mgr.context_window = context_window
    
    # Get token usage information
    token_usage = context_mgr.get_messages_token_usage(messages)
    
    return jsonify({
        'status': 'success',
        'usage': token_usage
    })