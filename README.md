# Simple Todo App

A full-stack todo application with Express.js backend, MongoDB database, and Express.js frontend, ready for both local development and Docker deployment.

## Project Structure

```
todo/
├── backend/              # Express.js API server
│   ├── server.js         # Main server file
│   ├── package.json      # Backend dependencies
│   ├── Dockerfile        # Backend Docker image
│   ├── .dockerignore     # Docker ignore file
│   └── README.md         # Backend setup instructions
├── frontend/             # HTML/CSS/JS client
│   ├── index.html        # Main HTML file
│   ├── style.css         # Styles
│   ├── app.js            # Frontend JavaScript
│   ├── nginx.conf        # Nginx configuration
│   ├── package.json      # Frontend dependencies
│   ├── Dockerfile        # Frontend Docker image
│   ├── .dockerignore     # Docker ignore file
│   └── README.md         # Frontend setup instructions
├── docker-compose.yml    # Docker Compose configuration
└── README.md             # This file
```

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker and Docker Compose installed on your system

### Quick Start with Docker
```bash
# Build and start both services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### Docker Services
- **todo-backend**: Node.js Express API server with MongoDB
- **todo-frontend**: Express.js serving static files with API proxy
- **todo-mongo**: MongoDB database for persistent storage

## 🚀 Local Development

### 1. Start the Backend Server

```bash
cd backend
npm install
npm start
```

The backend will run on http://localhost:3001

### 2. Start the Frontend Server

In a new terminal:

```bash
cd frontend
npm start
```

The frontend will run on http://localhost:3000

### 3. Use the App

Open your browser and visit http://localhost:3000

## Features

- ✅ Add new todos
- ✅ Mark todos as complete/incomplete
- ✅ Edit existing todos
- ✅ Delete todos
- ✅ Real-time statistics
- ✅ Responsive design
- ✅ Modern UI with animations
- ✅ Docker support with health checks
- ✅ Nginx proxy for API calls

## API Endpoints

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with native driver
- CORS middleware
- Body parser
- Docker with Alpine Linux

### Frontend
- HTML5
- CSS3 (with modern features)
- Vanilla JavaScript (ES6+)
- Fetch API for HTTP requests
- Express.js for serving static files
- Docker with Alpine Linux

### Database
- MongoDB 7.x
- Document-based storage
- Automatic initialization
- Data persistence with Docker volumes

## Docker Architecture

- **Backend**: Node.js Alpine container with health checks
- **Frontend**: Nginx Alpine container with API proxy
- **Network**: Custom bridge network for service communication
- **Security**: Non-root user, security headers, optimized images

## Development Notes

- The backend uses in-memory storage (data resets on server restart)
- CORS is enabled for local development
- API calls are proxied through Nginx in Docker deployment
- Health checks ensure services are running properly
- The frontend automatically detects environment (local vs Docker)
# devops-todo-apps
