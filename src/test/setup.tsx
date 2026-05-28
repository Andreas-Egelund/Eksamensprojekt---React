import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { clearF1Cache } from '../api/f1Api';
import { server } from './server';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  clearF1Cache();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
