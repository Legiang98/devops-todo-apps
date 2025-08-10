# Todo Frontend

Simple Express.js server serving the todo frontend with API proxy.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the frontend server:
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

3. Open your browser and visit: http://localhost:3000

## Features

- Express.js server serving static files
- API proxy to backend service
- Automatic backend API routing
- Works in both local development and Docker environments
- Responsive design with modern UI
- Real-time todo management

## Environment Variables

- `PORT`: Port to run the frontend server (default: 3000)
- `BACKEND_URL`: URL of the backend API (default: http://todo-backend:3001)

## Docker Support

The frontend runs in a Docker container with:
- Node.js 18 Alpine base image
- Express.js serving static files
- API proxy to backend container
- Health checks and security optimizations

## Browser Support

Works in all modern browsers that support ES6+ features.
