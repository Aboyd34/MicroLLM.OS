import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let llmEngine = null;

async function initLLM() {
  try {
    const OfflineLLMEngine = require('../llm/offline-engine.cjs');
    llmEngine = new OfflineLLMEngine();
    await llmEngine.initialize();
    console.log('✓ Local LLM engine ready');
  } catch (err) {
    console.warn('⚠ LLM engine not ready:', err.message);
    console.warn('Run: npm run download-model');
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    title: 'MicroLLM-4GB Desktop',
    backgroundColor: '#050505',
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(async () => {
  await initLLM();
  createWindow();
});

// IPC: Local model inference
ipcMain.handle('query-llm', async (_event, prompt) => {
  if (!llmEngine) return 'ERROR: Model not loaded. Run npm run download-model first.';
  try {
    return await llmEngine.generate(prompt);
  } catch (err) {
    return `ERROR: ${err.message}`;
  }
});

// IPC: Gemini API inference
ipcMain.handle('query-gemini', async (_event, prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return 'ERROR: GEMINI_API_KEY not set in .env';
  try {
    const GeminiCLI = require('../llm/gemini-cli.cjs');
    return await GeminiCLI.ask(prompt, apiKey);
  } catch (err) {
    return `ERROR: ${err.message}`;
  }
});

// IPC: Memory stats
ipcMain.handle('get-memory', () => {
  const m = process.memoryUsage();
  return {
    heapUsed:  Math.round(m.heapUsed  / 1024 / 1024),
    heapTotal: Math.round(m.heapTotal / 1024 / 1024),
    rss:       Math.round(m.rss       / 1024 / 1024),
  };
});

// IPC: Model status
ipcMain.handle('model-status', () => ({
  loaded:    !!llmEngine && llmEngine.isReady,
  modelName: llmEngine?.modelName ?? 'Not loaded',
}));

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
