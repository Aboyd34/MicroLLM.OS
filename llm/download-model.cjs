'use strict';
const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

const MODEL_DIR  = path.join(__dirname, 'models');
const MODEL_NAME = 'dolphin-llama3-4bit.gguf';
const MODEL_PATH = path.join(MODEL_DIR, MODEL_NAME);

// Dolphin 2.9 uncensored ~4.9GB
const MODEL_URL = 'https://huggingface.co/bartowski/dolphin-2.9.4-llama3.1-8b-GGUF/resolve/main/dolphin-2.9.4-llama3.1-8b-Q4_K_M.gguf';
// Lightweight fallback ~638MB — uncomment to use instead:
// const MODEL_URL = 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf';

if (!fs.existsSync(MODEL_DIR)) fs.mkdirSync(MODEL_DIR, { recursive: true });

if (fs.existsSync(MODEL_PATH)) {
  console.log('✓ Model already downloaded:', MODEL_PATH);
  process.exit(0);
}

console.log('Downloading uncensored model (one-time only)...');
console.log('URL:', MODEL_URL, '\n');

function download(targetUrl, dest, hops = 0) {
  if (hops > 5) { console.error('Too many redirects'); process.exit(1); }
  const parsed = new url.URL(targetUrl);
  const lib    = parsed.protocol === 'https:' ? https : http;
  const file   = fs.createWriteStream(dest);
  let got = 0;
  lib.get(targetUrl, { headers: { 'User-Agent': 'MicroLLM-OS/1.0' } }, (res) => {
    if ([301,302,307,308].includes(res.statusCode)) {
      file.close(); fs.unlinkSync(dest);
      return download(res.headers.location, dest, hops + 1);
    }
    const total = parseInt(res.headers['content-length'] || '0', 10);
    res.on('data', (chunk) => {
      got += chunk.length;
      const pct = total ? ((got / total) * 100).toFixed(1) : '?';
      process.stdout.write(`\r  ${pct}%  ${(got/1024/1024).toFixed(0)}MB / ${(total/1024/1024).toFixed(0)}MB  `);
    });
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('\n\n✓ Done:', dest);
      console.log('✓ 100% offline from here — no API keys needed');
      console.log('\nLaunch: npm run electron:dev');
    });
  }).on('error', (err) => {
    fs.unlink(dest, () => {});
    console.error('\nDownload failed:', err.message);
    process.exit(1);
  });
}

download(MODEL_URL, MODEL_PATH);
