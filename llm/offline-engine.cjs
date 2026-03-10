'use strict';
const path = require('path');
const fs   = require('fs');

const CANDIDATE_MODELS = [
  'dolphin-llama3-4bit.gguf',
  'dolphin-2.9-llama3-8b.Q4_K_M.gguf',
  'llama2-uncensored-q4_k_m.gguf',
  'tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
];

const MODEL_DIR = path.join(__dirname, 'models');

class OfflineLLMEngine {
  constructor() {
    this.llama     = null;
    this.model     = null;
    this.context   = null;
    this.session   = null;
    this.isReady   = false;
    this.modelName = 'None';
  }

  _findModel() {
    if (!fs.existsSync(MODEL_DIR)) return null;
    for (const name of CANDIDATE_MODELS) {
      const p = path.join(MODEL_DIR, name);
      if (fs.existsSync(p)) return { name, fullPath: p };
    }
    const files = fs.readdirSync(MODEL_DIR).filter(f => f.endsWith('.gguf'));
    if (files.length > 0) return { name: files[0], fullPath: path.join(MODEL_DIR, files[0]) };
    return null;
  }

  async initialize() {
    const found = this._findModel();
    if (!found) throw new Error(`No .gguf model in ${MODEL_DIR}.\nRun: npm run download-model`);

    const { getLlama, LlamaChatSession } = require('node-llama-cpp');

    console.log(`Loading model: ${found.name}`);
    this.llama   = await getLlama();
    this.model   = await this.llama.loadModel({ modelPath: found.fullPath });
    this.context = await this.model.createContext({ contextSize: 2048 });
    this.session = new LlamaChatSession({ contextSequence: this.context.getSequence() });

    this.isReady   = true;
    this.modelName = found.name;
    console.log(`✓ Model ready: ${found.name}`);
  }

  async generate(prompt, maxTokens = 768) {
    if (!this.isReady) throw new Error('Engine not initialized');
    return await this.session.prompt(prompt, {
      maxTokens,
      temperature: 0.7,
      topP: 0.9,
    });
  }
}

module.exports = OfflineLLMEngine;
