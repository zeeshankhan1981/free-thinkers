import requests

BASE_URL = 'http://localhost:5000/api/prompt-chain'

def test_prompt_chain():
    chain = [
        {'prompt': 'What is the capital of France?', 'model': 'llama3.1', 'params': {}},
        {'prompt': 'Summarize the previous answer in one word.', 'model': 'llama3.1', 'params': {}}
    ]
    response = requests.post(BASE_URL, json={'chain': chain})
    print('Status:', response.status_code)
    print('Response:', response.json())

if __name__ == "__main__":
    test_prompt_chain()
