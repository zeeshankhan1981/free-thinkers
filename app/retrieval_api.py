"""
API routes for retrieval-augmented generation in Free Thinkers
"""

from flask import Blueprint, request, jsonify
import os
import glob

retrieval_api = Blueprint('retrieval_api', __name__, url_prefix='/api/retrieve')

# Simple local text file search (stub for demo)
DOCUMENTS_DIR = os.path.expanduser('~/.freethinkers/retrieval_docs/')

def search_documents(query, sources=None):
    results = []
    # For demo: search all .txt files in DOCUMENTS_DIR
    for file_path in glob.glob(os.path.join(DOCUMENTS_DIR, '*.txt')):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if query.lower() in content.lower():
                snippet = content[:300]  # Simple snippet
                results.append({'snippet': snippet, 'source': os.path.basename(file_path)})
    return results

@retrieval_api.route('', methods=['POST'])
def retrieve():
    data = request.get_json()
    query = data.get('query', '').strip()
    sources = data.get('sources', [])
    if not query:
        return jsonify({'error': 'Query required'}), 400
    results = search_documents(query, sources)
    return jsonify({'results': results})
