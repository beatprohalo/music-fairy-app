#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Music Fairy Desktop Development...\n');

// Start Vite dev server
const vite = spawn('npm', ['run', 'dev'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true
});

// Wait a moment for Vite to start, then start Electron
setTimeout(() => {
  console.log('\n📱 Starting Electron...\n');
  
  const electron = spawn('npm', ['run', 'dev'], {
    cwd: path.join(process.cwd(), 'my-desktop-app'),
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' }
  });

  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development servers...');
    vite.kill('SIGINT');
    electron.kill('SIGINT');
    process.exit(0);
  });

  electron.on('close', (code) => {
    console.log(`\n📱 Electron process exited with code ${code}`);
    vite.kill('SIGINT');
    process.exit(code);
  });

}, 3000);

vite.on('close', (code) => {
  console.log(`\n🌐 Vite process exited with code ${code}`);
  process.exit(code);
});
