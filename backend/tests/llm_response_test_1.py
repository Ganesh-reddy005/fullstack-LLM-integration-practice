from fastapi.testclient import TestClient

from main import app
client = TestClient(app)

def test_read_root():
    response = client.get('/')
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the LLM Thinking Enhancer API"}


def test_code_submission():
    data = {
        'code':'print("hello world)',
        'language':'python',
        'problem_id':'1231'
    }

    response = client.post('/submit',json = data)
    assert response.status_code == 200
