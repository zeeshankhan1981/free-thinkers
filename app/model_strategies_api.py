"""
API routes for model-specific prompt engineering strategies in Free Thinkers
"""

from flask import Blueprint, request, jsonify

model_strategies_api = Blueprint('model_strategies_api', __name__, url_prefix='/api/model-strategies')

# Static registry of model strategies (expand as needed)
MODEL_STRATEGIES = {
    'llava-phi3': {
        'recommended_prompt_format': 'Multimodal: Provide image and concise instruction.',
        'optimal_params': {'temperature': 0.5, 'top_p': 0.85},
        'notes': 'Best for visual+text tasks. Use clear, short instructions.'
    },
    'llama3.1': {
        'recommended_prompt_format': 'Detailed context, chain-of-thought for reasoning.',
        'optimal_params': {'temperature': 0.7, 'top_p': 0.9},
        'notes': 'Larger context window; supports advanced reasoning.'
    },
    'phi3': {
        'recommended_prompt_format': 'Concise, direct prompts.',
        'optimal_params': {'temperature': 0.6, 'top_p': 0.85},
        'notes': 'Smaller model; avoid lengthy or ambiguous prompts.'
    },
    'mistral-7b': {
        'recommended_prompt_format': 'Standard instruction or few-shot.',
        'optimal_params': {'temperature': 0.6, 'top_p': 0.9},
        'notes': 'Good balance of speed and quality.'
    }
    # Add more models as needed
}

@model_strategies_api.route('', methods=['GET'])
def get_model_strategy():
    model = request.args.get('model', '').strip()
    if not model:
        return jsonify({'error': 'Model name required'}), 400
    strategy = MODEL_STRATEGIES.get(model)
    if not strategy:
        return jsonify({'error': f'No strategy found for model {model}'}), 404
    return jsonify({'model': model, **strategy})
