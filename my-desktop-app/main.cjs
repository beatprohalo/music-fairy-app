const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs'),
      webSecurity: true
    },
    // icon: path.join(__dirname, 'assets', 'icon.png'), // Optional: add an icon
    titleBarStyle: 'default',
    show: false // Don't show until ready
  });

  // Show window when ready to prevent visual flash
  win.once('ready-to-show', () => {
    win.show();
  });

  // Set Content Security Policy (simplified for development)
  const csp = [
    "default-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https: wss: ws:",
    "media-src 'self' blob: data: https:"
  ].join('; ');

  // Set CSP headers
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp]
      }
    });
  });

  // Load from Vite dev server in development, otherwise load from file
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    // Wait for Vite server to be ready before loading
    const waitForVite = async () => {
      const http = require('http');
      const maxAttempts = 30;
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        try {
          await new Promise((resolve, reject) => {
            const req = http.get('http://localhost:5173', (res) => {
              if (res.statusCode === 200) {
                resolve();
              } else {
                reject(new Error(`Status: ${res.statusCode}`));
              }
            });
            req.on('error', reject);
            req.setTimeout(1000, () => reject(new Error('Timeout')));
          });
          console.log('✅ Vite server is ready');
          break;
        } catch (error) {
          attempts++;
          console.log(`⏳ Waiting for Vite server... (${attempts}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (attempts >= maxAttempts) {
        console.error('❌ Vite server not ready after 30 seconds');
      }
    };
    
    waitForVite().then(() => {
      win.loadURL('http://localhost:5173');
      win.webContents.openDevTools(); // Open DevTools for debugging
      console.log('✅ Loading Vite dev server in Electron');
    }).catch((error) => {
      console.error('❌ Failed to load Vite server:', error);
      win.loadURL('data:text/html,<h1>Vite server not available</h1><p>Please start Vite with: npm run vite</p>');
    });
  } else {
    win.loadFile(path.join(__dirname, '..', '..', 'dist', 'index.html'));
  }

  // Handle window closed
  win.on('closed', () => {
    // Dereference the window object
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS, re-create a window when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});

// Handle app protocol for security
app.setAsDefaultProtocolClient('music-fairy');