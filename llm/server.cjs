'use strict';
/**
 * Optional REST bridge — POST /api/generate, GET /api/status
 * Supports both local model and Gemini as backends.
 * Run: npm run server
 */
const express = require('express');
const cors    = require('cors');
try { require('dotenv').config(); } catch (_) {}

const OfflineLLMEngine = require('./offline-engine.cjs');
const { ask: geminiAsk } = require('./gemini-cli.cjs');

const PORT   = process.env.LLM_PORT || 4000;
const engine = new OfflineLLMEngine();
const app    = express();

app.use(cors());
app.use(express.json());

(async () => {
  try { await engine.initialize(); }
  catch (err) { console.warn('Local model not loaded:', err.message); }
})();

app.get('/api/status', (_req, res) => {
  const m = process.memoryUsage();
  res.json({
    localModel: { ready: engine.isReady, name: engine.modelName },
    gemini:     { ready: !!process.env.GEMINI_API_KEY, model: 'gemini-2.0-flash' },
    memory:     { heapUsedMB: Math.round(m.heapUsed/1024/1024), rssMB: Math.round(m.rss/1024/1024) },
  });
});

app.post('/api/generate', async (req, res) => {
  const { prompt, backend = 'local', maxTokens = 512 } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });
  try {
    const start = Date.now();
    let response;
    if (backend === 'gemini') {
      const key = process.env.GEMINI_API_KEY;
      if (!key) return res.status(503).json({ error: 'GEMINI_API_KEY not set' });
      response = await geminiAsk(prompt, key);
    } else {
      if (!engine.isReady) return res.status(503).json({ error: 'Local model not ready. Run download-model.' });
      response = await engine.generate(prompt, maxTokens);
    }
    res.json({ response, backend, ms: Date.now() - start });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`MicroLLM REST bridge → http://localhost:${PORT}`);
  console.log('  GET  /api/status');
  console.log('  POST /api/generate  { prompt, backend: "local"|"gemini", maxTokens }');
});
