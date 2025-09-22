# Music Fairy Desktop App

This directory contains the Electron desktop application for Music Fairy.

## Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the web application first:
   ```bash
   cd ..
   npm run build
   ```

3. Start the desktop app:
   ```bash
   npm start
   ```

### Development Mode
For development with hot reload:
```bash
# From the root directory
npm run electron:dev
```

This will:
1. Start the Vite development server
2. Launch Electron in development mode
3. Enable hot reload for both web and desktop components

## Building for Production

### Build the Application
```bash
# From the root directory
npm run electron:build
```

### Package the Application
```bash
# From the root directory
npm run electron:pack
```

## Project Structure

- `main.js` - Electron main process
- `preload.js` - Preload script for secure context bridge
- `package.json` - Electron app configuration
- `../dist/` - Built web application (created by Vite)

## Features

- Secure context isolation
- Cross-platform support (Windows, macOS, Linux)
- Native window controls
- File system access for audio files
- MIDI device support
- Audio device enumeration

## Security

The app uses Electron's security best practices:
- Context isolation enabled
- Node integration disabled in renderer
- Remote module disabled
- Secure preload script for IPC communication
