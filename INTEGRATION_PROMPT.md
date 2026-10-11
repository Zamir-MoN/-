# 🔌 Pengo Stats — Code Integration Prompt

This document contains the ready-to-use prompt for adding a lightweight health check endpoint to any project or bot (Discord bots, APIs, background workers, websites) so it can be monitored in real-time by **Pengo Stats**.

---

## 📋 The Integration Prompt

Copy and paste this prompt directly into your AI assistant (ChatGPT, Claude, Cursor, Copilot, Gemini) or send it to your developer:

```markdown
I am using an external browser dashboard to monitor the online/offline status of this project.

Please add a lightweight public health check endpoint to this codebase with the following requirements:
1. Create a GET endpoint at `/health` (or `/ping`).
2. Ensure it returns an HTTP 200 status code with a JSON response: `{"status": "online"}`.
3. CRITICAL: Add the CORS header `Access-Control-Allow-Origin: *` so a browser dashboard can fetch this endpoint without CORS policy errors. Also respond to HTTP `OPTIONS` preflight requests with status 204.
4. Ensure this endpoint is lightweight, non-blocking, and does not interfere with the existing application logic (e.g., bot event loops or heavy background jobs).
5. Support `process.env.PORT` (or environment-specific port) and tell me what port/URL this endpoint will run on so I can add it to my monitoring dashboard.
```

---

## ⚡ Quick Implementation Examples

If you want to implement it manually into your codebase, use the copy-paste snippets below:

### 1. Node.js / Discord.js (Zero Extra Dependencies)
Add this directly into your bot's `index.js` or `main.js`:

```javascript
const http = require('http');

const PORT = process.env.PORT || 3001;

const healthServer = http.createServer((req, res) => {
  // CRITICAL: CORS headers for browser dashboards
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/health' || url.pathname === '/ping' || url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'online', timestamp: new Date().toISOString() }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

healthServer.listen(PORT, () => {
  console.log(`🌐 Health check live on port ${PORT} (/health)`);
});
```

---

### 2. Express.js
```javascript
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // Or set Access-Control-Allow-Origin: *

app.get(['/health', '/ping'], (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.status(200).json({ status: 'online', uptime: process.uptime() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
```

---

### 3. Python (FastAPI)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
@app.get("/ping")
async def health_check():
    return {"status": "online"}
```

---

### 4. Python (Flask)
```python
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
@app.route('/ping', methods=['GET'])
def health():
    response = jsonify({"status": "online"})
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response, 200
```

---

### 5. Next.js (App Router: `app/api/health/route.ts`)
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { status: 'online' },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    }
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  });
}
```

---

## 🔍 Why CORS Header is Required

Pengo Stats is a client-side real-time dashboard that runs directly in your browser. Browsers enforce the **Same-Origin Policy** (SOP) by default. Without `Access-Control-Allow-Origin: *`, the browser will block the fetch probe and mark the service as offline, even if your server is running.

---

## 🧪 How to Verify Your Endpoint

Run this curl command in your terminal:
```bash
curl -I https://your-project-url.com/health
```
Look for:
- `HTTP/1.1 200 OK`
- `access-control-allow-origin: *`
