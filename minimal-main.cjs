// Minimal Electron main process for testing
console.log('Starting minimal Electron app...');

// Test if we can require electron
try {
  const { app, BrowserWindow } = require('electron');
  console.log('✅ Electron imported successfully');
  console.log('App:', typeof app);
  console.log('BrowserWindow:', typeof BrowserWindow);
  
  if (app && BrowserWindow) {
    app.whenReady().then(() => {
      console.log('✅ App ready');
      const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });
      
      win.loadURL('http://localhost:5173');
      console.log('✅ Window created and loaded');
    });
    
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  } else {
    console.error('❌ Electron app or BrowserWindow is undefined');
  }
} catch (error) {
  console.error('❌ Error importing Electron:', error);
}
