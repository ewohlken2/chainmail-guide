# Chainmail Guide

A data-driven 3D tutorial engine for learning chainmail weaves.

## Features

- **3D Visualization** - Realistic metallic PBR-rendered chainmail rings using Three.js
- **Step-by-step Tutorials** - Interactive playback with play/pause/next/prev controls
- **Orbit Camera** - Rotate, zoom, and pan around the 3D model
- **Data-driven** - Tutorials defined in JSON files for easy editing and expansion

## Tech Stack

- React 18 + TypeScript
- Three.js via @react-three/fiber and @react-three/drei
- Vite

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Keyboard Shortcuts

- **Space** - Play/Pause
- **Arrow Right** - Next step
- **Arrow Left** - Previous step
- **Home** - Reset to beginning

## Adding Tutorials

Create a new JSON file in `src/data/tutorials/` following the schema in `src/types/tutorial.ts`.

## License

MIT
