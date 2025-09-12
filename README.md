# TodoWeb 2.0 - FastAPI + React

A modern task management application with an interactive galaxy-themed canvas interface, built with FastAPI backend and React frontend.

## Features

- 🌌 **Interactive Galaxy Canvas**: Create and manage tasks with a beautiful animated galaxy background
- 📅 **Calendar Integration**: Add notes to specific dates with a responsive calendar interface
- 🎮 **Experience Points System**: Gamified task completion with XP rewards and level progression
- 🔐 **User Authentication**: Secure user management with JWT tokens
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Real-time Updates**: Live updates for task management and progress tracking

## Architecture

- **Backend**: FastAPI with SQLAlchemy ORM and SQLite database
- **Frontend**: React with Vite build system
- **Authentication**: JWT-based authentication system
- **Database**: SQLite (easily configurable for PostgreSQL/MySQL)

## Quick Start

### Option 1: Docker (Recommended)

**Prerequisites:**
- Docker (20.10+)
- Docker Compose (2.0+)

**Setup:**
```bash
git clone <repository-url>
cd todoweb_2.0
cp config/env.example .env
# Edit .env with your configuration
```

**Start with Docker:**
```bash
# Development mode
./scripts/start-dev.sh    # Linux/Mac
scripts\start-dev.bat     # Windows

# Production mode
./scripts/start-prod.sh   # Linux/Mac
scripts\start-prod.bat    # Windows
```

**Access:**
- Frontend: http://localhost:3000 (dev) or http://localhost (prod)
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Manual Installation

**Prerequisites:**
- Node.js (v16 or higher)
- Python 3.8 or higher
- pip (Python package manager)
- MySQL 8.0 (optional, SQLite for development)

**Installation:**
```bash
git clone <repository-url>
cd todoweb_2.0
npm run setup
```

**Start the development servers:**
```bash
npm run dev
```

This will start:
- Backend API server on http://localhost:8000
- Frontend development server on http://localhost:3000

**Open your browser:**
Navigate to http://localhost:3000 to see the application.

### Individual Commands

- **Backend only:**
  ```bash
  cd backend
  pip install -r requirements.txt
  python -m uvicorn main:app --reload
  ```

- **Frontend only:**
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

## Project Structure

```
todoweb_2.0/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main FastAPI application
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context providers
│   │   ├── services/       # API service layer
│   │   └── pages/          # Page components
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── docker/                 # Docker configuration
│   ├── docker-compose.yml  # Main Docker Compose file
│   ├── docker-compose.light.yml  # Lightweight version
│   ├── docker-compose.prod.yml   # Production version
│   └── DOCKER_README.md    # Docker documentation
├── scripts/                # Utility scripts
│   ├── start-dev.bat       # Windows development start
│   ├── start-prod.bat      # Windows production start
│   ├── start-dev.sh        # Linux/Mac development start
│   ├── start-prod.sh       # Linux/Mac production start
│   └── test_backend.py     # Backend testing script
├── config/                 # Configuration files
│   └── env.example         # Environment variables template
├── nginx/                  # Nginx configuration
│   └── nginx.conf          # Nginx reverse proxy config
├── package.json            # Root package.json with scripts
└── README.md
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `GET /auth/me` - Get current user info
- `POST /auth/check-username` - Check username availability

### Tasks
- `GET /tasks` - Get user's tasks
- `POST /tasks` - Create a new task
- `DELETE /tasks/{task_id}` - Delete a task
- `PATCH /tasks/{task_id}/complete` - Mark task as complete

### User Management
- `GET /users/{user_id}` - Get user by ID
- `PATCH /users/experience` - Update user experience points

### Calendar
- `GET /calendar-notes` - Get user's calendar notes
- `POST /calendar-notes` - Create/update calendar note
- `GET /calendar-notes/{date}` - Get note for specific date

## Features in Detail

### Interactive Canvas
- Galaxy-themed animated background with rotating stars and spiral arms
- Click to create tasks as colored circles
- Shift+click to add subtasks (mini circles) that orbit around main tasks
- Click tasks to complete them and earn experience points
- Smooth animations and visual feedback

### Calendar System
- Monthly calendar view with note-taking capability
- Real-time saving of notes to the backend
- Responsive design that works on all screen sizes
- Visual indicators for the current day

### Experience Points System
- Earn XP by completing tasks (10 XP for main tasks, 5 XP for subtasks)
- Level progression with increasing XP requirements
- Visual progress bar with animated effects
- Persistent XP tracking across sessions

## Development

### Backend Development
The FastAPI backend provides a RESTful API with automatic OpenAPI documentation available at http://localhost:8000/docs when running.

### Frontend Development
The React frontend uses Vite for fast development with hot module replacement.

### Database
The application uses SQLite by default, but can be easily configured to use PostgreSQL or MySQL by updating the database URL in `backend/main.py`.

## Production Deployment

### Docker Deployment (Recommended)

1. **Configure environment:**
   ```bash
   cp config/env.example .env
   # Edit .env with production values
   ```

2. **Deploy with Docker Compose:**
   ```bash
   ./scripts/start-prod.sh    # Linux/Mac
   scripts\start-prod.bat     # Windows
   ```

3. **Access your application:**
   - Application: https://localhost
   - API: https://localhost/api
   - Docs: https://localhost/api/docs

### Manual Deployment

#### Backend
1. Set up a production database (MySQL/PostgreSQL recommended)
2. Update the `DATABASE_URL` environment variable
3. Set the `SECRET_KEY` environment variable
4. Deploy using a WSGI server like Gunicorn with Uvicorn workers

#### Frontend
1. Build the frontend: `cd frontend && npm run build`
2. Serve the built files using a web server like Nginx
3. Configure the API proxy to point to your backend server

### Docker Features
- **MySQL Database**: Production-ready with persistent storage
- **Nginx Reverse Proxy**: SSL termination and load balancing
- **Health Checks**: Automatic container health monitoring
- **Backup Scripts**: Database backup and restore utilities
- **Security**: Rate limiting, security headers, and SSL support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Migration from Next.js

This application has been converted from a Next.js application to a FastAPI + React architecture while preserving all original functionality:

- ✅ Interactive galaxy canvas with task management
- ✅ Calendar with note-taking functionality
- ✅ Experience points and leveling system
- ✅ User authentication and management
- ✅ Responsive design and animations
- ✅ All original styling and UX preserved

The new architecture provides better separation of concerns, improved scalability, and more flexibility for future enhancements.