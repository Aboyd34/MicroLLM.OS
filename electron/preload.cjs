'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Local offline model
  queryLLM:    (prompt) => ipcRenderer.invoke('query-llm', prompt),
  // Gemini API (free tier, needs GEMINI_API_KEY in .env)
  queryGemini: (prompt) => ipcRenderer.invoke('query-gemini', prompt),
  // System stats
  getMemory:   ()       => ipcRenderer.invoke('get-memory'),
  modelStatus: ()       => ipcRenderer.invoke('model-status'),
});
