const http = require('http');
const fs = require('fs');
const path = require('path');

const LOG_FILE = 'D:\\KSOM\\Website\\Web Apps\\Payslip\\payslip.git\\logfile\\log.txt';

// Ensure directory exists
const dir = path.dirname(LOG_FILE);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/log' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { logLine } = JSON.parse(body);
        if (logLine) {
          fs.appendFileSync(LOG_FILE, logLine + '\n', 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing logLine' }));
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else if (req.url === '/sync' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { logs: dbLogs } = JSON.parse(body);
        if (Array.isArray(dbLogs)) {
          let existingLines = [];
          if (fs.existsSync(LOG_FILE)) {
            existingLines = fs.readFileSync(LOG_FILE, 'utf8')
              .split('\n')
              .map(line => line.trim())
              .filter(Boolean);
          }

          // Filter out logs that already exist in log.txt
          const linesToAppend = dbLogs.filter(line => {
            const trimmed = line.trim();
            return trimmed && !existingLines.includes(trimmed);
          });

          if (linesToAppend.length > 0) {
            fs.appendFileSync(LOG_FILE, linesToAppend.join('\n') + '\n', 'utf8');
          }

          // Return the full content of the file
          const finalContent = fs.readFileSync(LOG_FILE, 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, logs: finalContent }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing or invalid logs array' }));
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else if (req.url === '/log' && req.method === 'GET') {
    try {
      if (fs.existsSync(LOG_FILE)) {
        const content = fs.readFileSync(LOG_FILE, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ logs: content }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ logs: '' }));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(8089, () => {
  console.log('Local log helper server listening on port 8089');
});
