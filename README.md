<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Music Fairy - AI Music Production App

Music Fairy is an AI-powered music production application built with Electron, React, and Tone.js. It provides an intuitive interface for music creation with AI assistance and real-time audio processing.

## Features

- 🎵 **AI-Powered Music Generation** - Generate music with AI assistance using Gemini API
- 🎛️ **Real-time Audio Processing** - Built with Tone.js for professional audio handling
- 🎹 **MIDI Support** - Connect and control MIDI devices
- 🖥️ **Cross-Platform Desktop App** - Built with Electron for Windows, macOS, and Linux
- 🔒 **Security-First** - Implements Content Security Policy (CSP) for secure operation
- ⚡ **Modern Tech Stack** - React, TypeScript, Vite for fast development

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Gemini API key (for AI features)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/beatprohalo/music-fairy-app.git
   cd music-fairy-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Development

Run the development server:
```bash
npm run dev
```

This will start both the Vite development server and the Electron app.

## Building for Production

Build the app for production:
```bash
npm run build
```

## Security

This app implements comprehensive security measures:
- Content Security Policy (CSP) headers
- Secure Electron configuration
- Context isolation enabled
- Node integration disabled for security

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Desktop**: Electron
- **Audio**: Tone.js, Web Audio API
- **MIDI**: @tonejs/midi
- **AI**: Google Gemini API
- **Styling**: CSS3

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## View in AI Studio

Original AI Studio app: https://ai.studio/apps/drive/1C_ToXnzRYmxaurvp9tKTc-NEWYtdQ_sU
