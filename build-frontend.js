#!/usr/bin/env node

// Custom build script to work around Vercel's npm ci not creating .bin symlinks
const path = require('path');
const { build } = require('./web/node_modules/vite');

console.log('Building frontend with vite...');

build({
  root: path.resolve(__dirname, 'web'),
  configFile: path.resolve(__dirname, 'web/vite.config.ts'),
  build: {
    outDir: path.resolve(__dirname, 'web/dist')
  }
}).then(() => {
  console.log('Frontend build completed successfully');
  process.exit(0);
}).catch(err => {
  console.error('Frontend build failed:', err);
  process.exit(1);
});
