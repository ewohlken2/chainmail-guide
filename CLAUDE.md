# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Project Overview

This is a data-driven 3D tutorial engine for chainmail weaves built with React, TypeScript, and Three.js.

## Commands

- `npm run dev` - Start development server
- `npm run build` - Production build (runs tsc then vite build)
- `npm run type-check` - TypeScript type checking without emit
- `npm run preview` - Preview production build

## Architecture

### Directory Structure
- `src/components/scene/` - Three.js 3D components (Ring, Lighting, CameraControls, RingGroup, ChainmailScene)
- `src/components/ui/` - React UI components (PlaybackControls, StepIndicator, StepDescription, WeaveInfo, TutorialPlayer)
- `src/hooks/` - Custom React hooks (useTutorialPlayer, useWeaveLoader, useRingMaterials)
- `src/types/` - TypeScript interfaces for tutorial data schema
- `src/constants/` - Configuration for materials and camera
- `src/data/tutorials/` - JSON tutorial files

### Key Patterns
- Tutorials are defined as JSON files in `src/data/tutorials/`
- The `ChainmailTutorial` interface in `src/types/tutorial.ts` defines the schema
- Rings use torus geometry with PBR metallic materials
- Step playback is managed by `useTutorialPlayer` hook
- Ring visibility is determined by which step the user is on

### Ring Open/Close Animation
- Rings have a `startsOpen` property (boolean)
- `startsOpen: false` - Ring appears closed (pre-made, like seed rings)
- `startsOpen: true` - Ring appears open, animates into position, then closes
- Animation sequence: scale in → close gap (mimics real chainmail assembly)

### Adding New Tutorials
1. Create a new JSON file in `src/data/tutorials/` following the schema
2. Add entry to `src/data/tutorials/index.json`
3. Each ring needs: id, position, rotation, innerDiameter, outerDiameter, wireGauge, colorRole, startsOpen
4. Each step needs: stepNumber, title, description, ringsToAdd array
