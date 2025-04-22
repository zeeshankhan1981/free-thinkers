import requests

BASE_URL = 'http://localhost:5000/api/retrieve'

def test_retrieve():
    query = 'AI'
    response = requests.post(BASE_URL, json={'query': query, 'sources': []})
    print('Status:', response.status_code)
    print('Response:', response.json())

if __name__ == "__main__":
    test_retrieve()
