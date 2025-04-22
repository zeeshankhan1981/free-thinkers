import requests

BASE_URL = 'http://localhost:5000/api/model-strategies'

def test_model_strategies():
    for model in ['llava-phi3', 'llama3.1', 'phi3', 'mistral-7b', 'unknown-model']:
        params = {'model': model}
        response = requests.get(BASE_URL, params=params)
        print(f'Model: {model}')
        print('Status:', response.status_code)
        print('Response:', response.json())
        print('-' * 40)

if __name__ == "__main__":
    test_model_strategies()
