#!/usr/bin/env node

// Custom build script to work around Vercel's npm ci not creating .bin symlinks
const path = require('path');
const fs = require('fs');

console.log('Checking web directory structure...');
const webDir = path.resolve(__dirname, 'web');
const nodeModulesDir = path.join(webDir, 'node_modules');
const viteDir = path.join(nodeModulesDir, 'vite');

console.log('web directory exists:', fs.existsSync(webDir));
console.log('node_modules directory exists:', fs.existsSync(nodeModulesDir));
console.log('vite directory exists:', fs.existsSync(viteDir));

if (!fs.existsSync(viteDir)) {
  console.error('ERROR: vite not found in web/node_modules');
  console.error('Checking for vite-related packages:');
  if (fs.existsSync(nodeModulesDir)) {
    const allDirs = fs.readdirSync(nodeModulesDir);
    console.error('Total packages:', allDirs.length);
    console.error('Vite packages:', allDirs.filter(d => d.includes('vite')).join(', '));
    console.error('First 10:', allDirs.slice(0, 10).join(', '));
    console.error('Last 10:', allDirs.slice(-10).join(', '));
  }
  process.exit(1);
}

const { build } = require(viteDir);

console.log('Building frontend with vite...');

build({
  root: webDir,
  configFile: path.join(webDir, 'vite.config.ts'),
  build: {
    outDir: path.join(webDir, 'dist')
  }
}).then(() => {
  console.log('Frontend build completed successfully');
  process.exit(0);
}).catch(err => {
  console.error('Frontend build failed:', err);
  process.exit(1);
});
