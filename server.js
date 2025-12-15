const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DIST_DIR = path.join(__dirname, 'frontend', 'dist');

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST_DIR, req.url);

  // Set MIME types
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
  };

  // Handle root path
  if (filePath === path.join(DIST_DIR, '/')) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  let ext = path.extname(filePath);

  // For SPA routing, serve index.html for routes without extensions
  if (!ext && !filePath.includes('.')) {
    filePath = path.join(DIST_DIR, 'index.html');
    ext = '.html';
  }

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Serve index.html for 404 (SPA routing)
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(DIST_DIR, 'index.html'), (error, indexData) => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(indexData);
        });
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/ (accessible on your network)`);
  console.log(`Access from this machine: http://localhost:${PORT}/`);
  console.log(`Access from other devices: http://<your-machine-ip>:${PORT}/`);
});
