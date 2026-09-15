# OPEX Tool — Frontend

Last updated: 2026-06-12

React 18 + Create React App frontend for the OPEX archival tool.
Talks to a local Django backend on `http://localhost:8000` (proxied during `npm start`).

## Documentation

- **[docs/](docs/README.md) — the full technical reference** (15 chapters:
  architecture, domain model, API layer, hooks, state, utilities, constants,
  components, verification/export, help/guidance, DevAdmin, styling, workflows,
  glossary). Start with [docs/01-architecture.md](docs/01-architecture.md).
- [FRONTEND.md](FRONTEND.md) — the shorter single-file overview.

## Available Scripts

### `npm start`

Runs the dev server at [http://localhost:3000](http://localhost:3000) with DevAdmin
enabled (`NODE_ENV=development`). Auto-runs `manifest:public` first.

### `npm run start:prod`

Dev server with `REACT_APP_DEV_MODE=false`. Note: because `react-scripts start`
always sets `NODE_ENV=development`, `isDevMode()` still returns true and DevAdmin
remains accessible. Use `npm run build` if you need DevAdmin fully stripped.

### `npm run build`

Production build to `build/`. DevAdmin is stripped. Auto-runs `manifest:public`
first.

### `npm run build:dev`

Production build with `REACT_APP_DEV_MODE=true` — DevAdmin is included. Auto-runs
`manifest:public` first. Use for QA builds that need the dev panel on a bundled app.

### `npm test`

Launches the test runner in watch mode (Create React App / Jest).

### `manifest:public` (runs automatically)

Scans `public/files/` and writes `public/files/manifest.json`. Required by the
DevAdmin puppet's QuickCreate feature. Runs automatically before `start`,
`build`, and `build:dev`; run it manually if you add test files to
`public/files/` mid-session.

## Prerequisites

The Django backend must be running on `http://localhost:8000` before starting the
frontend. See the repo root [START.md](../START.md) for full startup instructions.
