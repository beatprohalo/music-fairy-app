// New Electron main process with different import approach
console.log('Starting Electron app...');

// Try different import methods
let app, BrowserWindow;

try {
  // Method 1: Direct require
  const electron = require('electron');
  console.log('Electron module loaded:', typeof electron);
  
  if (electron && electron.app) {
    app = electron.app;
    BrowserWindow = electron.BrowserWindow;
    console.log('✅ Method 1: Direct destructuring worked');
  } else {
    // Method 2: Try individual requires
    app = require('electron').app;
    BrowserWindow = require('electron').BrowserWindow;
    console.log('✅ Method 2: Individual requires worked');
  }
} catch (error) {
  console.error('❌ All import methods failed:', error.message);
  process.exit(1);
}

console.log('App object:', typeof app);
console.log('BrowserWindow object:', typeof BrowserWindow);

if (app && BrowserWindow) {
  app.whenReady().then(() => {
    console.log('✅ App is ready!');
    
    const win = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: require('path').join(__dirname, 'preload.cjs'),
        webSecurity: true
      },
      show: false
    });

    // Show window when ready
    win.once('ready-to-show', () => {
      win.show();
      console.log('✅ Window is ready and visible');
    });

    // Load the Vite dev server
    if (process.env.NODE_ENV === 'development') {
      win.loadURL('http://localhost:5173');
      win.webContents.openDevTools();
      console.log('✅ Loading Vite dev server...');
    } else {
      win.loadFile(require('path').join(__dirname, '..', '..', 'dist', 'index.html'));
      console.log('✅ Loading production build...');
    }

    // Handle window closed
    win.on('closed', () => {
      console.log('Window closed');
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      // Re-create window
    }
  });
} else {
  console.error('❌ Electron objects are still undefined');
  process.exit(1);
}
