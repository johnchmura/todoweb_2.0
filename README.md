# TodoWeb 2.0

A modern task management application featuring an interactive galaxy-themed canvas interface, built with FastAPI backend and React frontend.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Features in Detail](#features-in-detail)
- [Development](#development)
- [Production Deployment](#production-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Testing](#testing)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)
- [Migration from Next.js](#migration-from-nextjs)

## Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │    │   FastAPI       │    │   Database      │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   MySQL/SQLite  │
│   Port 3000     │    │   Port 8000     │    │   Port 3306     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └──────────────►│   Nginx         │
                        │   (Reverse      │
                        │   Proxy)        │
                        │   Port 80/443   │
                        └─────────────────┘
```

### Technology Stack
- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: FastAPI + SQLAlchemy + Pydantic
- **Database**: MySQL (production) / SQLite (development)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx with SSL termination
- **CI/CD**: GitHub Actions with automated testing and deployment

### Key Components
- **Interactive Canvas**: Galaxy-themed task management interface
- **Calendar System**: Date-based note-taking with real-time updates
- **Experience System**: Gamified task completion with XP and levels
- **User Management**: Secure authentication and authorization
- **API Layer**: RESTful API with automatic OpenAPI documentation

## Features

- **Interactive Galaxy Canvas**: Create and manage tasks with an animated galaxy background
- **Calendar Integration**: Add notes to specific dates with a responsive calendar interface
- **Experience Points System**: Gamified task completion with XP rewards and level progression
- **User Authentication**: Secure user management with JWT tokens
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Live updates for task management and progress tracking

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
├── backend/                    # FastAPI backend
│   ├── main.py                # Main FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── tests/                 # Backend test suite
│   │   ├── test_auth.py       # Authentication tests
│   │   ├── test_tasks.py      # Task management tests
│   │   └── test_calendar.py   # Calendar tests
│   ├── Dockerfile             # Backend container definition
│   └── .bandit                # Security linting config
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/           # React context providers
│   │   ├── services/          # API service layer
│   │   ├── pages/             # Page components
│   │   └── test/              # Frontend test suite
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   ├── vitest.config.js       # Test configuration
│   └── Dockerfile             # Frontend container definition
├── docker/                    # Docker configuration
│   ├── docker-compose.yml     # Development environment
│   ├── docker-compose.light.yml  # Lightweight version
│   └── docker-compose.prod.yml   # Production environment
├── .github/                   # CI/CD configuration
│   ├── workflows/             # GitHub Actions workflows
│   │   ├── ci.yml            # Continuous Integration
│   │   ├── cd.yml            # Continuous Deployment
│   │   ├── security.yml      # Security scanning
│   │   └── release.yml       # Release management
│   ├── dependabot.yml        # Dependency updates
│   └── CODEOWNERS            # Code ownership
├── scripts/                   # Utility scripts
│   ├── start-dev.bat         # Windows development start
│   ├── start-prod.bat        # Windows production start
│   ├── start-dev.sh          # Linux/Mac development start
│   ├── start-prod.sh         # Linux/Mac production start
│   ├── backup-db.sh          # Database backup
│   ├── restore-db.sh         # Database restore
│   └── test_backend.py       # Backend testing script
├── nginx/                     # Nginx configuration
│   └── nginx.conf             # Reverse proxy config
├── config/                    # Configuration files
│   └── env.example            # Environment variables template
├── package.json               # Root package.json with scripts
└── README.md                  # Project documentation
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
- **Multi-stage Builds**: Optimized container images
- **Resource Management**: Memory and CPU limits

## CI/CD Pipeline

### Pipeline Overview
This project includes comprehensive CI/CD automation with multiple workflows:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Code Push     │    │   Pull Request  │    │   Release Tag   │
│                 │    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CI Pipeline   │    │   PR Pipeline   │    │ Release Pipeline│
│                 │    │                 │    │                 │
│ • Lint & Test   │    │ • Full Test     │    │ • Build Images  │
│ • Security Scan │    │ • Security Scan │    │ • Deploy        │
│ • Build Images  │    │ • Code Review   │    │ • Create Release│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Workflow Details

#### 1. Continuous Integration (ci.yml)
**Triggers:** Push to main/develop branches
- **Backend Testing**: Unit tests, coverage, security scans
- **Frontend Testing**: React tests, linting, security audit
- **Integration Testing**: End-to-end API testing
- **Docker Building**: Build and test container images
- **Security Scanning**: Bandit, Safety, npm audit, Trivy

#### 2. Pull Request Pipeline (pr.yml)
**Triggers:** Pull request creation/updates
- **Code Quality**: Linting, formatting, type checking
- **Test Coverage**: Comprehensive test suite execution
- **Security Analysis**: Vulnerability scanning
- **Build Verification**: Ensure code builds successfully

#### 3. Continuous Deployment (cd.yml)
**Triggers:** Push to main branch (after CI passes)
- **Staging Deployment**: Deploy to staging environment
- **Production Deployment**: Deploy to production (with approval)
- **Health Checks**: Verify deployment success
- **Rollback Capability**: Automatic rollback on failure

#### 4. Security Pipeline (security.yml)
**Triggers:** Daily schedule + on-demand
- **Dependency Scanning**: Check for vulnerable dependencies
- **Container Security**: Trivy vulnerability scanning
- **Code Security**: Bandit static analysis
- **License Compliance**: Check for license issues

#### 5. Release Pipeline (release.yml)
**Triggers:** Git tag creation
- **Version Bumping**: Automatic version updates
- **Changelog Generation**: Generate release notes
- **Docker Publishing**: Publish images to registry
- **GitHub Release**: Create GitHub release with artifacts

### Pipeline Features
- **Parallel Execution**: Tests run in parallel for faster feedback
- **Caching**: Docker layers and dependencies cached for speed
- **Matrix Testing**: Multiple Python/Node versions tested
- **Artifact Storage**: Test results and coverage reports stored
- **Notification**: Slack/email notifications on failure
- **Manual Gates**: Production deployment requires approval

## Testing

### Testing Strategy
The project implements a comprehensive testing strategy with multiple layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    Testing Pyramid                          │
├─────────────────────────────────────────────────────────────┤
│  E2E Tests          │  Integration Tests  │  Unit Tests     │
│  (Manual/Playwright)│  (API/Component)    │  (Fast/Isolated)│
│  • User workflows   │  • API endpoints    │  • Functions    │
│  • Cross-browser    │  • Database ops     │  • Components   │
│  • Performance      │  • Auth flows       │  • Utils        │
└─────────────────────────────────────────────────────────────┘
```

### Local Testing

#### Quick Start
```bash
# Linux/Mac
./run-local-tests.sh

# Windows
run-local-tests.bat
```

#### Test Categories

##### 1. Backend Tests
```bash
cd backend
pip install -r requirements.txt
pytest --cov=. --cov-report=html
```

**Test Types:**
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Security Tests**: Bandit and Safety scans
- **Database Tests**: SQLAlchemy model testing

**Coverage Reports:**
- HTML report: `test-results/backend-coverage/index.html`
- XML report: `test-results/backend-results.xml`

##### 2. Frontend Tests
```bash
cd frontend
npm install
npm test -- --run --coverage
```

**Test Types:**
- **Component Tests**: React component testing with Testing Library
- **Integration Tests**: Component interaction testing
- **Hook Tests**: Custom React hooks testing
- **Service Tests**: API service layer testing

**Coverage Reports:**
- HTML report: `test-results/coverage/lcov-report/index.html`
- JSON report: `test-results/coverage/coverage-final.json`

##### 3. Integration Tests
```bash
python scripts/test_backend.py
```

**Test Types:**
- **API Integration**: End-to-end API testing
- **Database Integration**: Full database operation testing
- **Authentication Flow**: Complete auth workflow testing
- **Cross-Service**: Frontend-backend integration

##### 4. Docker Tests
```bash
# Build images
docker build -t todoweb-backend:test ./backend
docker build -t todoweb-frontend:test ./frontend

# Run with Docker Compose
docker-compose -f docker/docker-compose.yml up --build
```

**Test Types:**
- **Image Building**: Verify Docker images build successfully
- **Container Security**: Trivy vulnerability scanning
- **Health Checks**: Container startup and health verification
- **Multi-container**: Full stack testing with Docker Compose

### Test Results Structure
```
test-results/
├── backend-coverage/          # HTML coverage report
├── backend-results.xml        # JUnit test results
├── bandit-report.json         # Security scan results
├── safety-report.json         # Dependency vulnerability scan
├── npm-audit-report.json      # Frontend dependency audit
├── integration.log            # Integration test logs
├── backend.log               # Backend server logs
├── docker-backend-build.log  # Backend Docker build logs
├── docker-frontend-build.log # Frontend Docker build logs
├── trivy-backend-report.txt  # Backend container security
└── trivy-frontend-report.txt # Frontend container security
```

### Security Testing

#### Backend Security
- **Bandit**: Python security linting
- **Safety**: Dependency vulnerability scanning
- **SQL Injection**: ORM-based protection testing
- **Authentication**: JWT token security testing

#### Frontend Security
- **npm audit**: Node.js dependency vulnerabilities
- **XSS Protection**: Input sanitization testing
- **CSRF Protection**: Cross-site request forgery testing
- **Content Security Policy**: CSP header testing

#### Container Security
- **Trivy**: Container image vulnerability scanning
- **Docker Scout**: Docker security scanning
- **Base Image**: Minimal base image security
- **User Permissions**: Non-root user testing

### Performance Testing

#### Load Testing
```bash
# Install locust for load testing
pip install locust

# Run load tests
locust -f tests/load_test.py --host=http://localhost:8000
```

#### Performance Metrics
- **Response Time**: API endpoint response times
- **Throughput**: Requests per second
- **Memory Usage**: Container memory consumption
- **CPU Usage**: Container CPU utilization

### Test Automation

#### GitHub Actions Integration
- **Automatic Testing**: Tests run on every push/PR
- **Parallel Execution**: Tests run in parallel for speed
- **Matrix Testing**: Multiple versions tested
- **Artifact Storage**: Test results stored as artifacts

#### Pre-commit Hooks
- **Code Formatting**: Automatic code formatting
- **Linting**: Pre-commit linting checks
- **Type Checking**: TypeScript type checking
- **Security Scanning**: Pre-commit security checks

### Troubleshooting

#### Common Issues
1. **Port Conflicts**: Kill existing processes or change ports
2. **Dependency Issues**: Clear caches and reinstall
3. **Docker Issues**: Check Docker daemon and clear cache
4. **Permission Issues**: Check file permissions and ownership

#### Debug Mode
```bash
# Backend with verbose output
cd backend
pytest -v -s

# Frontend with verbose output
cd frontend
npm test -- --verbose
```

## Security

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Stateless authentication
- **CORS Configuration**: Secure cross-origin requests

### Data Protection
- **SQL Injection Prevention**: SQLAlchemy ORM protection
- **Input Validation**: Pydantic model validation
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: SameSite cookie attributes

### Container Security
- **Non-root Users**: Containers run as non-root
- **Minimal Base Images**: Alpine Linux for smaller attack surface
- **Security Scanning**: Trivy vulnerability scanning
- **Dependency Updates**: Automated dependency updates

### Infrastructure Security
- **HTTPS Only**: SSL/TLS encryption in production
- **Security Headers**: Comprehensive security headers
- **Rate Limiting**: API rate limiting protection
- **Health Checks**: Container health monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests locally: `./run-local-tests.sh`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Migration from Next.js

This application has been converted from a Next.js application to a FastAPI + React architecture while preserving all original functionality:

- Interactive galaxy canvas with task management
- Calendar with note-taking functionality
- Experience points and leveling system
- User authentication and management
- Responsive design and animations
- All original styling and UX preserved

The new architecture provides better separation of concerns, improved scalability, and more flexibility for future enhancements.