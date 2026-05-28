# F1 Season Guide

F1 Season Guide is a React exam project built around a small, readable data-driven app. It uses the Jolpica-F1 API, the current Ergast-compatible public Formula 1 API, to show Formula 1 season data across a few focused pages.

## What It Includes

- React + TypeScript + Vite single page app
- Multiple routes: season overview, standings, race calendar, and race details
- A classic light theme with simple white panels and red racing accents
- Typed Jolpica-F1 API integration with a small fetch/cache layer
- Vitest test runner
- React Testing Library for user-facing component tests
- Mock Service Worker for reliable mocked API responses in tests

## API Choice

The app uses Jolpica-F1 at `https://api.jolpi.ca/ergast/f1`. It is useful for an exam project because the endpoints are simple, public, and return season standings, schedules, and results without requiring an API key.

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run test:e2e
npm run build
```

## Testing Focus

The unit and component test setup lives in `src/test`. MSW intercepts the same API URLs used by the app, which means the components can be tested as they behave in production while still staying fast and deterministic.

The Playwright suite lives in `e2e`. It starts the Vite app automatically and mocks Jolpica-F1 network responses at the browser level, so E2E flows stay deterministic while still exercising real routing, rendering, and user interactions.
