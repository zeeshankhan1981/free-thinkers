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

@context_manager_api.route('/settings', methods=['GET'])
def get_settings():
    """Get context management settings."""
    # Get settings from context manager or use defaults
    settings = {
        'maxContextLength': context_mgr.context_window,
        'enableSummarization': context_mgr.enable_summarization,
        'enablePruning': context_mgr.enable_pruning
    }
    
    return jsonify(settings)

@context_manager_api.route('/settings', methods=['POST'])
def update_settings():
    """Update context management settings."""
    data = request.json
    
    if not data:
        return jsonify({
            'status': 'error',
            'message': 'No data provided'
        }), 400
    
    # Update context manager settings
    if 'maxContextLength' in data:
        context_mgr.context_window = int(data['maxContextLength'])
    
    if 'enableSummarization' in data:
        context_mgr.enable_summarization = bool(data['enableSummarization'])
    
    if 'enablePruning' in data:
        context_mgr.enable_pruning = bool(data['enablePruning'])
    
    # Save settings to persistent storage if needed
    context_mgr.save_settings()
    
    return jsonify({
        'status': 'success',
        'settings': {
            'maxContextLength': context_mgr.context_window,
            'enableSummarization': context_mgr.enable_summarization,
            'enablePruning': context_mgr.enable_pruning
        }
    })

@context_manager_api.route('/details', methods=['GET', 'POST'])
def get_context_details():
    """Get detailed breakdown of the current context."""
    # If POST, use provided messages
    if request.method == 'POST':
        data = request.json
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided'
            }), 400
        
        messages = data.get('messages', [])
    else:
        # For GET, use latest conversation from context manager
        messages = context_mgr.get_latest_conversation() or []
    
    # Extract system messages
    system_messages = [msg for msg in messages if msg.get('role') == 'system']
    system_content = "\n".join([msg.get('content', '') for msg in system_messages])
    
    # Extract conversation history (user and assistant messages)
    history_messages = [msg for msg in messages if msg.get('role') in ['user', 'assistant']]
    
    # Get the current message if available (usually the last user message)
    current_message = next((msg.get('content', '') 
                           for msg in reversed(messages) 
                           if msg.get('role') == 'user'), "")
    
    # Calculate token counts
    system_tokens = context_mgr.count_tokens(system_content)
    history_tokens = sum(context_mgr.count_tokens(msg.get('content', '')) for msg in history_messages)
    current_tokens = context_mgr.count_tokens(current_message)
    total_tokens = system_tokens + history_tokens + current_tokens
    
    return jsonify({
        'status': 'success',
        'system': system_content,
        'history': history_messages,
        'current': current_message,
        'tokenCounts': {
            'system': system_tokens,
            'history': history_tokens,
            'current': current_tokens,
            'total': total_tokens
        }
    })

@context_manager_api.route('/token-count', methods=['POST'])
def count_tokens_endpoint():
    """Count tokens in provided text."""
    data = request.json
    
    if not data or 'text' not in data:
        return jsonify({
            'status': 'error',
            'message': 'No text provided'
        }), 400
    
    text = data.get('text', '')
    model = data.get('model', 'default')
    
    token_count = context_mgr.count_tokens(text, model=model)
    
    return jsonify({
        'status': 'success',
        'text': text[:50] + '...' if len(text) > 50 else text,
        'token_count': token_count
    })