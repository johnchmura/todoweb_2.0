import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app, get_db, User, Base
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

def test_register_user_success(setup_database):
    """Test successful user registration"""
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123",
        "display_name": "Test User"
    }
    
    response = client.post("/auth/register", json=user_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "testuser"
    assert data["user"]["email"] == "test@example.com"

def test_register_user_duplicate_username(setup_database):
    """Test registration with duplicate username"""
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    
    # First registration should succeed
    response1 = client.post("/auth/register", json=user_data)
    assert response1.status_code == 200
    
    # Second registration with same username should fail
    user_data["email"] = "test2@example.com"
    response2 = client.post("/auth/register", json=user_data)
    assert response2.status_code == 400
    assert "Username already taken" in response2.json()["detail"]

def test_register_user_duplicate_email(setup_database):
    """Test registration with duplicate email"""
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    
    # First registration should succeed
    response1 = client.post("/auth/register", json=user_data)
    assert response1.status_code == 200
    
    # Second registration with same email should fail
    user_data["username"] = "testuser2"
    response2 = client.post("/auth/register", json=user_data)
    assert response2.status_code == 400
    assert "Email already registered" in response2.json()["detail"]

def test_login_success(setup_database):
    """Test successful user login"""
    # First register a user
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    client.post("/auth/register", json=user_data)
    
    # Then login
    login_data = {
        "username": "testuser",
        "password": "testpassword123"
    }
    
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "testuser"

def test_login_invalid_credentials(setup_database):
    """Test login with invalid credentials"""
    login_data = {
        "username": "nonexistent",
        "password": "wrongpassword"
    }
    
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 401
    assert "Invalid username or password" in response.json()["detail"]

def test_check_username_available(setup_database):
    """Test checking available username"""
    response = client.post("/auth/check-username", json={"username": "newuser"})
    assert response.status_code == 200
    assert response.json()["available"] == True

def test_check_username_taken(setup_database):
    """Test checking taken username"""
    # First register a user
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    client.post("/auth/register", json=user_data)
    
    # Then check if username is taken
    response = client.post("/auth/check-username", json={"username": "testuser"})
    assert response.status_code == 200
    assert response.json()["available"] == False

def test_get_current_user(setup_database):
    """Test getting current user info"""
    # First register and login
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    register_response = client.post("/auth/register", json=user_data)
    token = register_response.json()["access_token"]
    
    # Then get current user
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
