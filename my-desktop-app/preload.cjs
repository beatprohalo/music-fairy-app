const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // Platform information
  platform: process.platform,
  
  // Window controls (if needed)
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  
  // File system access (if needed for audio files)
  selectFile: () => ipcRenderer.invoke('dialog-open-file'),
  selectDirectory: () => ipcRenderer.invoke('dialog-open-directory'),
  
  // Audio context helpers
  audioContext: {
    // Expose any audio-related APIs that need Node.js access
    getAudioDevices: () => ipcRenderer.invoke('get-audio-devices'),
  },
  
  // MIDI support (if needed)
  midi: {
    getMidiDevices: () => ipcRenderer.invoke('get-midi-devices'),
    sendMidiMessage: (message) => ipcRenderer.invoke('send-midi-message', message),
  }
});

// Expose a safe version of process for the renderer
contextBridge.exposeInMainWorld('process', {
  platform: process.platform,
  versions: process.versions,
  env: {
    NODE_ENV: process.env.NODE_ENV
  }
});