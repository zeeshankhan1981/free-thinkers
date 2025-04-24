from flask import Blueprint, jsonify, request
import requests
from .model_chain import ModelChain

api = Blueprint('api', __name__)

@api.route('/api/ollama_models')
def ollama_models():
    """
    Return a list of locally available Ollama models in the format:
    [{"name": "mistral-7b", "display_name": "Mistral 7B"}, ...]
    """
    try:
        r = requests.get('http://localhost:11434/api/tags', timeout=2)
        r.raise_for_status()
        models = r.json().get('models', [])
        # Format: display_name is just the name with underscores replaced and capitalized
        out = []
        for m in models:
            name = m.get('name')
            display_name = name.replace('-', ' ').replace('_', ' ').title() if name else name
            out.append({"name": name, "display_name": display_name})
        return jsonify(out)
    except Exception as e:
        return jsonify([]), 200

@api.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    model = data.get('model')
    messages = data.get('messages', [])
    parameters = data.get('parameters', {})

    # Use the last user message as the prompt
    prompt = messages[-1]['content'] if messages and 'content' in messages[-1] else ''
    mc = ModelChain()
    response = mc.run_model(prompt, model, parameters)
    return jsonify({'response': response})
