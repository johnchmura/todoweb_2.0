from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import jwt
import os
from passlib.context import CryptContext
import uvicorn
from dotenv import load_dotenv
# Removed Google OAuth imports

# Load environment variables
load_dotenv()

# Database setup - Using SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todoweb.db")

# Handle different database types
if DATABASE_URL.startswith("mysql"):
    # MySQL configuration
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=os.getenv("DB_ECHO", "false").lower() == "true"
    )
else:
    # SQLite configuration (for development)
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    # Allow tests to run without SECRET_KEY by using a default test key
    import sys
    # Check if we're in any test environment (pytest, docker test, CI, etc.)
    is_test_env = (
        "pytest" in sys.modules or 
        "test" in sys.argv[0] or 
        os.getenv("PYTEST_CURRENT_TEST") or
        os.getenv("CI") or
        "python -c" in " ".join(sys.argv)
    )
    if is_test_env:
        SECRET_KEY = "test-secret-key-for-pytest"
    else:
        raise ValueError("SECRET_KEY environment variable is required")
ALGORITHM = "HS256"
security = HTTPBearer()

# Removed Google OAuth configuration

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    display_name = Column(String(100))
    experience_points = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    label = Column(String(255))
    x = Column(Integer)
    y = Column(Integer)
    color = Column(String(50))
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class CalendarNote(Base):
    __tablename__ = "calendar_notes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    date = Column(String(10))  # Format: YYYY-MM-DD
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    display_name: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    display_name: Optional[str] = None
    experience_points: int
    created_at: datetime

class TaskCreate(BaseModel):
    label: str
    x: int
    y: int
    color: str

class TaskResponse(BaseModel):
    id: int
    label: str
    x: int
    y: int
    color: str
    completed: bool
    created_at: datetime

class CalendarNoteCreate(BaseModel):
    date: str
    content: str

class CalendarNoteResponse(BaseModel):
    id: int
    date: str
    content: str
    created_at: datetime

class ExperienceUpdate(BaseModel):
    points: int

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# FastAPI app
app = FastAPI(title="TodoWeb API", version="1.0.0")

# CORS middleware
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication helper functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Dependency to get current user
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Authentication endpoints
@app.post("/auth/register", response_model=TokenResponse)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if username is taken
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Check if email is taken
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and create user
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.model_dump()
    user_dict.pop('password')
    user_dict['hashed_password'] = hashed_password
    
    db_user = User(**user_dict)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": str(db_user.id)})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=db_user.id,
            username=db_user.username,
            email=db_user.email,
            display_name=db_user.display_name,
            experience_points=db_user.experience_points,
            created_at=db_user.created_at
        )
    )

@app.post("/auth/login", response_model=TokenResponse)
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user with username and password"""
    # Find user by username
    user = db.query(User).filter(User.username == login_data.username).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            display_name=user.display_name,
            experience_points=user.experience_points,
            created_at=user.created_at
        )
    )

@app.get("/auth/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@app.post("/auth/check-username")
def check_username(request: dict, db: Session = Depends(get_db)):
    username = request.get("username")
    if not username:
        raise HTTPException(status_code=400, detail="Username is required")
    existing_user = db.query(User).filter(User.username == username).first()
    return {"available": existing_user is None}

# User endpoints
@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Task endpoints
@app.get("/tasks", response_model=List[TaskResponse])
def get_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    return tasks

@app.post("/tasks", response_model=TaskResponse)
def create_task(task_data: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_task = Task(**task_data.model_dump(), user_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}

@app.patch("/tasks/{task_id}/complete")
def complete_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.completed = True
    db.commit()
    return {"message": "Task completed successfully"}

# Experience points endpoints
@app.patch("/users/experience", response_model=UserResponse)
def update_experience(exp_data: ExperienceUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.experience_points += exp_data.points
    db.commit()
    db.refresh(current_user)
    return current_user

# Calendar notes endpoints
@app.get("/calendar-notes", response_model=List[CalendarNoteResponse])
def get_calendar_notes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notes = db.query(CalendarNote).filter(CalendarNote.user_id == current_user.id).all()
    return notes

@app.post("/calendar-notes", response_model=CalendarNoteResponse)
def create_calendar_note(note_data: CalendarNoteCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if note already exists for this date
    existing_note = db.query(CalendarNote).filter(
        CalendarNote.user_id == current_user.id,
        CalendarNote.date == note_data.date
    ).first()
    
    if existing_note:
        existing_note.content = note_data.content
        db.commit()
        db.refresh(existing_note)
        return existing_note
    else:
        db_note = CalendarNote(**note_data.model_dump(), user_id=current_user.id)
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
        return db_note

@app.get("/calendar-notes/{date}", response_model=CalendarNoteResponse)
def get_calendar_note(date: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(CalendarNote).filter(
        CalendarNote.user_id == current_user.id,
        CalendarNote.date == date
    ).first()
    
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

