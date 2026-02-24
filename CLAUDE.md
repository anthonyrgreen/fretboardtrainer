# CLAUDE.md

## Project Overview

Triad Trainer — a React/TypeScript webapp for practicing guitar triad inversions. A scrolling horizontal staff displays chord labels in slash notation (e.g. C, C/E, C/G) synchronized to an audio metronome. The user reads upcoming chords and plays them on guitar as they reach the "now" post.

Originally a Python CLI tool (`gimme.py` / `windowed_gimme.py`); the webapp in `webapp/` is the active version.

## Tech Stack

- **Framework**: React 19 + TypeScript (strict mode)
- **Build**: Vite 7
- **No external state management** — pure React hooks
- **No backend** — fully static client-side app

## Project Structure

```
webapp/
├── src/
│   ├── App.tsx                    # Root component, state coordination
│   ├── components/
│   │   ├── ScrollingStaff.tsx     # Main scrolling visualization
│   │   └── Settings.tsx           # BPM, beats/measure, measures/chord sliders
│   ├── hooks/
│   │   ├── useMetronome.ts        # Beat timing, audio clicks, play/pause/resume
│   │   └── useExercise.ts         # Chord generation, measure data provider
│   └── utils/
│       ├── audio.ts               # Web Audio API click sounds
│       └── chords.ts              # Major triad data, slash notation
├── index.html
├── vite.config.ts
└── package.json
```

## Commands

```bash
cd webapp
npm run dev       # Start dev server (Vite HMR)
npm run build     # Type-check + production build (tsc -b && vite build)
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Architecture

### Key patterns

- **Beat-derived scroll**: ScrollingStaff derives its scroll position from the metronome's beat count with rAF interpolation, keeping them always in sync (never an independent clock).
- **Refs for rAF**: Animation callbacks read values from refs to avoid stale closures.
- **Virtual rendering**: Only measures visible in the viewport are rendered.
- **Three-state playback**: idle → playing → paused, with proper timing resumption on unpause.
- **Pure measure lookup**: `getMeasureData(measureIndex)` is a pure function from index to content, with an LRU cache.

### Component responsibilities

- **App.tsx** — owns settings state, wires metronome + exercise hooks, renders controls
- **ScrollingStaff** — rAF animation loop, scroll offset calculation, renders visible measures with beat labels
- **useMetronome** — 10ms setInterval tick, Web Audio clicks, beat/measure counting, pause/resume with duration compensation
- **useExercise** — random triad generation per chord cycle, beat label assignment (3 inversions + rests)
- **chords.ts** — triad data for 7 natural roots, currently major only (designed to extend to minor/dim/aug)

## Git

- **Main branch**: `main`
- **Working branch**: `master`
- Commit messages should be concise and descriptive

## Conventions

- Functional components with hooks only
- CSS modules per component (`.css` file alongside `.tsx`)
- Constants at top of file (e.g. `PIXELS_PER_BEAT`, `NOW_POST_X`)
- TypeScript strict mode — no `any`, explicit interfaces for props and data
