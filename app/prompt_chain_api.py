"""
API routes for prompt chaining in Free Thinkers
"""

from flask import Blueprint, request, jsonify
from .model_chain import ModelChain
import hashlib
import json

prompt_chain_api = Blueprint('prompt_chain_api', __name__, url_prefix='/api/prompt-chain')

# Helper: Create a hash of the full transcript
def chain_signature(transcript):
    joined = '\n'.join([f"{step['prompt']}::{step['output']}" for step in transcript])
    return hashlib.sha256(joined.encode('utf-8')).hexdigest()

# POST /api/prompt-chain
@prompt_chain_api.route('', methods=['POST'])
def run_prompt_chain():
    data = request.get_json()
    chain = data.get('chain', [])
    if not chain or not isinstance(chain, list):
        return jsonify({'error': 'Invalid chain format'}), 400

    transcript = []
    results = []
    model_chain = ModelChain()

    for idx, step in enumerate(chain):
        prompt = step.get('prompt')
        model = step.get('model')
        params = step.get('params', {})
        if not prompt or not model:
            return jsonify({'error': f'Missing prompt/model at step {idx+1}'}), 400
        # Call model_chain for this step (simulate for now)
        output = model_chain.run_model(prompt, model, params)
        step_result = {
            'output': output,
            'model': model,
            'step': idx + 1,
            'signature': hashlib.sha256(f"{prompt}::{output}".encode('utf-8')).hexdigest()
        }
        transcript.append({'prompt': prompt, 'output': output})
        results.append(step_result)

    final_output = results[-1]['output'] if results else ''
    chain_sig = chain_signature(transcript)

    return jsonify({
        'results': results,
        'final_output': final_output,
        'chain_signature': chain_sig
    })
