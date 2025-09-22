#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing Electron App...\n');

// Test the Electron app
const electron = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'my-desktop-app'),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' }
});

electron.on('close', (code) => {
  console.log(`\n✅ Electron test completed with code ${code}`);
  process.exit(code);
});

electron.on('error', (error) => {
  console.error('❌ Error starting Electron:', error);
  process.exit(1);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping Electron test...');
  electron.kill('SIGINT');
  process.exit(0);
});
