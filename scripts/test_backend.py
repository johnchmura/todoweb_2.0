#!/usr/bin/env python3
"""
Simple test script to verify the FastAPI backend is working correctly.
Run this after starting the backend server.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_backend():
    print("Testing TodoWeb FastAPI Backend...")
    print("=" * 50)
    
    # Test 1: Health check (if we had one)
    print("1. Testing API availability...")
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("API is running and accessible")
        else:
            print("API returned unexpected status code")
    except requests.exceptions.ConnectionError:
        print("Cannot connect to API. Make sure the backend is running on port 8000")
        return False
    
    # Test 2: Register a test user
    print("\n2. Testing user registration...")
    test_user = {
        "uid": "test-user-123",
        "username": "testuser",
        "email": "test@example.com",
        "photo_url": "https://example.com/photo.jpg",
        "display_name": "Test User"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=test_user)
        if response.status_code == 200:
            print("User registration successful")
            user_data = response.json()
            print(f"   User ID: {user_data['id']}")
        else:
            print(f"User registration failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"Error during user registration: {e}")
    
    # Test 3: Check username availability
    print("\n3. Testing username check...")
    try:
        response = requests.post(f"{BASE_URL}/auth/check-username", json={"username": "testuser"})
        if response.status_code == 200:
            data = response.json()
            if not data["available"]:
                print("Username check working (username taken as expected)")
            else:
                print("Username check returned available (unexpected)")
        else:
            print(f"Username check failed: {response.status_code}")
    except Exception as e:
        print(f"Error during username check: {e}")
    
    # Test 4: Test available username
    print("\n4. Testing available username...")
    try:
        response = requests.post(f"{BASE_URL}/auth/check-username", json={"username": "newuser123"})
        if response.status_code == 200:
            data = response.json()
            if data["available"]:
                print("Username check working (username available as expected)")
            else:
                print("Username check returned taken (unexpected)")
        else:
            print(f"Username check failed: {response.status_code}")
    except Exception as e:
        print(f"Error during username check: {e}")
    
    print("\n" + "=" * 50)
    print("Backend test completed!")
    print("\nTo test the full application:")
    print("1. Start the backend: cd backend && python -m uvicorn main:app --reload")
    print("2. Start the frontend: cd frontend && npm run dev")
    print("3. Open http://localhost:3000 in your browser")

if __name__ == "__main__":
    test_backend()

