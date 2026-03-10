# MicroLLM.OS

> Offline-first AI desktop app. Local model + Gemini fallback. No subscriptions.

![License](https://img.shields.io/badge/license-MIT-green)
![Offline](https://img.shields.io/badge/local%20inference-node--llama--cpp-blue)
![Gemini](https://img.shields.io/badge/Gemini-free%20tier-orange)

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
copy .env.example .env
# Edit .env and add your GEMINI_API_KEY (free at https://aistudio.google.com/apikey)

# 3. (Optional) Download local offline model — one-time, ~4.9GB
npm run download-model

# 4. Launch the app
npm run electron:dev
```

---

## AI Backends

| Backend | Cost | Internet | Setup |
|---|---|---|---|
| Local (node-llama-cpp) | Free forever | ❌ Not needed | Download model once |
| Gemini 2.0 Flash | Free (1500/day) | ✅ Required | Add API key to .env |

---

## Scripts

| Command | Description |
|---|---|
| `npm run download-model` | Download offline GGUF model |
| `npm run electron:dev` | Launch Electron desktop app |
| `npm run electron:build` | Build Windows installer |
| `npm run server` | Start REST API bridge (port 4000) |
| `npm run gemini` | Gemini interactive CLI |
| `npm run dev` | Vite web-only dev server |

---

## REST API Bridge

```bash
npm run server

# Check status
curl http://localhost:4000/api/status

# Local model
curl -X POST http://localhost:4000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello!", "backend": "local"}'

# Gemini
curl -X POST http://localhost:4000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello!", "backend": "gemini"}'
```

---

## License
MIT
