'use strict';
/**
 * Gemini API helper — free tier, no build tools needed.
 * Uses gemini-2.0-flash (1,500 free requests/day).
 *
 * CLI usage:
 *   node llm/gemini-cli.cjs "your prompt"         <- single shot
 *   node llm/gemini-cli.cjs                        <- interactive chat
 *
 * In-app usage (imported by electron/main.js):
 *   const { ask } = require('./gemini-cli.cjs');
 *   const reply = await ask('hello', process.env.GEMINI_API_KEY);
 */
const https    = require('https');
const readline = require('readline');

const MODEL = 'gemini-2.0-flash';

function ask(prompt, apiKey) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    });
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path:     `/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      method:   'POST',
      headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message));
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          resolve(text ?? 'No response from Gemini');
        } catch (e) { reject(new Error('Failed to parse Gemini response')); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = { ask };

// CLI mode — only runs when executed directly
if (require.main === module) {
  // Load .env if present
  try { require('dotenv').config(); } catch (_) {}

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: Set GEMINI_API_KEY in your .env file');
    console.error('Get a free key at: https://aistudio.google.com/apikey');
    process.exit(1);
  }

  // Single-shot mode: node llm/gemini-cli.cjs "prompt here"
  if (process.argv[2]) {
    ask(process.argv.slice(2).join(' '), apiKey)
      .then(r => console.log('\nGemini:', r))
      .catch(e => console.error('Error:', e.message));
  } else {
    // Interactive chat mode
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log('\n🤖 MicroLLM.OS — Gemini CLI (free tier)');
    console.log('Type your prompt. Ctrl+C to exit.\n');
    const loop = () => rl.question('You: ', async (input) => {
      if (!input.trim()) return loop();
      try {
        const r = await ask(input, apiKey);
        console.log(`\nGemini: ${r}\n`);
      } catch (e) { console.error(`Error: ${e.message}\n`); }
      loop();
    });
    loop();
  }
}
