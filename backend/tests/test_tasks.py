import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app, get_db, User, Task, Base
import os

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="function")
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def auth_headers(setup_database):
    """Create a test user and return auth headers"""
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    response = client.post("/auth/register", json=user_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_task_success(setup_database, auth_headers):
    """Test successful task creation"""
    task_data = {
        "label": "Test Task",
        "x": 100,
        "y": 200,
        "color": "#ff0000"
    }
    
    response = client.post("/tasks", json=task_data, headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["label"] == "Test Task"
    assert data["x"] == 100
    assert data["y"] == 200
    assert data["color"] == "#ff0000"
    assert data["completed"] == False
    assert "id" in data
    assert "created_at" in data

def test_create_task_unauthorized(setup_database):
    """Test task creation without authentication"""
    task_data = {
        "label": "Test Task",
        "x": 100,
        "y": 200,
        "color": "#ff0000"
    }
    
    response = client.post("/tasks", json=task_data)
    assert response.status_code == 401

def test_get_tasks_success(setup_database, auth_headers):
    """Test getting user's tasks"""
    # Create a task first
    task_data = {
        "label": "Test Task",
        "x": 100,
        "y": 200,
        "color": "#ff0000"
    }
    client.post("/tasks", json=task_data, headers=auth_headers)
    
    # Get tasks
    response = client.get("/tasks", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 1
    assert data[0]["label"] == "Test Task"

def test_get_tasks_empty(setup_database, auth_headers):
    """Test getting tasks when user has no tasks"""
    response = client.get("/tasks", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 0

def test_delete_task_success(setup_database, auth_headers):
    """Test successful task deletion"""
    # Create a task first
    task_data = {
        "label": "Test Task",
        "x": 100,
        "y": 200,
        "color": "#ff0000"
    }
    create_response = client.post("/tasks", json=task_data, headers=auth_headers)
    task_id = create_response.json()["id"]
    
    # Delete the task
    response = client.delete(f"/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 200
    assert "Task deleted successfully" in response.json()["message"]
    
    # Verify task is deleted
    get_response = client.get("/tasks", headers=auth_headers)
    assert len(get_response.json()) == 0

def test_delete_task_not_found(setup_database, auth_headers):
    """Test deleting non-existent task"""
    response = client.delete("/tasks/999", headers=auth_headers)
    assert response.status_code == 404
    assert "Task not found" in response.json()["detail"]

def test_complete_task_success(setup_database, auth_headers):
    """Test successful task completion"""
    # Create a task first
    task_data = {
        "label": "Test Task",
        "x": 100,
        "y": 200,
        "color": "#ff0000"
    }
    create_response = client.post("/tasks", json=task_data, headers=auth_headers)
    task_id = create_response.json()["id"]
    
    # Complete the task
    response = client.patch(f"/tasks/{task_id}/complete", headers=auth_headers)
    assert response.status_code == 200
    assert "Task completed successfully" in response.json()["message"]
    
    # Verify task is completed
    get_response = client.get("/tasks", headers=auth_headers)
    assert get_response.json()[0]["completed"] == True

def test_complete_task_not_found(setup_database, auth_headers):
    """Test completing non-existent task"""
    response = client.patch("/tasks/999/complete", headers=auth_headers)
    assert response.status_code == 404
    assert "Task not found" in response.json()["detail"]
