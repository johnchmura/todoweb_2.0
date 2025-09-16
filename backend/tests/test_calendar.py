import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app, get_db, User, CalendarNote, Base
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

def test_create_calendar_note_success(setup_database, auth_headers):
    """Test successful calendar note creation"""
    note_data = {
        "date": "2024-01-15",
        "content": "Test calendar note"
    }
    
    response = client.post("/calendar-notes", json=note_data, headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["date"] == "2024-01-15"
    assert data["content"] == "Test calendar note"
    assert "id" in data
    assert "created_at" in data

def test_create_calendar_note_unauthorized(setup_database):
    """Test calendar note creation without authentication"""
    note_data = {
        "date": "2024-01-15",
        "content": "Test calendar note"
    }
    
    response = client.post("/calendar-notes", json=note_data)
    assert response.status_code == 403

def test_get_calendar_notes_success(setup_database, auth_headers):
    """Test getting user's calendar notes"""
    # Create a note first
    note_data = {
        "date": "2024-01-15",
        "content": "Test calendar note"
    }
    client.post("/calendar-notes", json=note_data, headers=auth_headers)
    
    # Get notes
    response = client.get("/calendar-notes", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 1
    assert data[0]["date"] == "2024-01-15"
    assert data[0]["content"] == "Test calendar note"

def test_get_calendar_notes_empty(setup_database, auth_headers):
    """Test getting notes when user has no notes"""
    response = client.get("/calendar-notes", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 0

def test_get_calendar_note_by_date_success(setup_database, auth_headers):
    """Test getting calendar note by specific date"""
    # Create a note first
    note_data = {
        "date": "2024-01-15",
        "content": "Test calendar note"
    }
    client.post("/calendar-notes", json=note_data, headers=auth_headers)
    
    # Get note by date
    response = client.get("/calendar-notes/2024-01-15", headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["date"] == "2024-01-15"
    assert data["content"] == "Test calendar note"

def test_get_calendar_note_by_date_not_found(setup_database, auth_headers):
    """Test getting calendar note by non-existent date"""
    response = client.get("/calendar-notes/2024-01-15", headers=auth_headers)
    assert response.status_code == 404
    assert "Note not found" in response.json()["detail"]

def test_update_calendar_note_same_date(setup_database, auth_headers):
    """Test updating calendar note for same date"""
    # Create a note first
    note_data = {
        "date": "2024-01-15",
        "content": "Original content"
    }
    client.post("/calendar-notes", json=note_data, headers=auth_headers)
    
    # Update the note
    updated_note_data = {
        "date": "2024-01-15",
        "content": "Updated content"
    }
    response = client.post("/calendar-notes", json=updated_note_data, headers=auth_headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["date"] == "2024-01-15"
    assert data["content"] == "Updated content"
    
    # Verify only one note exists
    get_response = client.get("/calendar-notes", headers=auth_headers)
    assert len(get_response.json()) == 1
