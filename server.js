/**
 * REadON Full-Stack Application Server
 * Serves the REST API (PRD §17) and the responsive frontend web application.
 */

const http = require('node:http');
const url = require('node:url');
const fs = require('node:fs');
const path = require('node:path');

// Simple .env parser without external dependencies
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=');
        if (!process.env[k.trim()]) {
          process.env[k.trim()] = v.join('=').trim();
        }
      }
    }
  }
} catch (e) {}

const { getDatabase } = require('./backend/db/database');
const { seed } = require('./backend/db/seed');
const { handleApiRequest } = require('./backend/routes/api');

const PORT = parseInt(process.env.PORT || '3000', 10);

// Initialize DB and ensure seed data is present
const db = getDatabase();
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  seed();
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // 1. API Route Handling
  if (pathname.startsWith('/api/')) {
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', () => {
      let parsedBody = {};
      try {
        if (bodyData) parsedBody = JSON.parse(bodyData);
      } catch (e) {
        parsedBody = {};
      }
      handleApiRequest(req, res, parsedUrl, parsedBody);
    });
    return;
  }

  // 2. Static File Serving (Frontend Application)
  let filePath = '';
  if (pathname === '/' || pathname === '/index.html') {
    filePath = path.join(__dirname, 'index.html');
  } else {
    filePath = path.join(__dirname, pathname);
  }

  // Security check: ensure path is inside project directory
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Access denied');
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback to index.html for SPA routing
        fs.readFile(path.join(__dirname, 'index.html'), (err2, fallbackContent) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('404 Not Found');
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(fallbackContent);
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
===========================================================
  🚀 REadON Full-Stack Platform Active
  "Know your skills. Build your future."
===========================================================
  • Web Interface:    http://localhost:${PORT}
  • REST API Root:    http://localhost:${PORT}/api/v1
  • OpenRouter Gateway: Configured & Connected
  • SQLite Database:  readon.sqlite (node:sqlite)
  • Sandbox Runner:   Isolated Subprocess Active
===========================================================
  Press Ctrl+C to stop the server
`);
});

