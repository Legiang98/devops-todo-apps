const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// API proxy to backend (for Docker deployment)
app.use('/api', (req, res) => {
  const backendHost = process.env.BACKEND_HOST || 'todo-backend';
  const backendPort = process.env.BACKEND_PORT || '3001';
  
  const options = {
    hostname: backendHost,
    port: backendPort,
    path: req.url,
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    let data = '';
    
    proxyRes.on('data', (chunk) => {
      data += chunk;
    });
    
    proxyRes.on('end', () => {
      res.status(proxyRes.statusCode);
      res.setHeader('Content-Type', 'application/json');
      res.send(data);
    });
  });

  proxyReq.on('error', (error) => {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy error' });
  });

  if (req.method === 'POST' || req.method === 'PUT') {
    proxyReq.write(JSON.stringify(req.body));
  }
  
  proxyReq.end();
});

// Serve the main HTML file for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the app`);
});

module.exports = app;
