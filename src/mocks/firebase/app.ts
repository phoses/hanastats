// Mock of the `firebase/app` surface. initializeApp is a no-op; it also wires
// up a window.__resetMockDb() helper so you can reset seed data from the console.
import { resetMockDb } from './store';

export function initializeApp(_config?: any) {
  if (typeof window !== 'undefined') {
    (window as any).__resetMockDb = () => {
      resetMockDb();
      console.info('[mock] database reset to seed data — reload the page.');
    };
    console.info('[mock] Running with the in-memory Firebase mock. Call __resetMockDb() to reset data.');
  }
  return { name: '[DEFAULT]' };
}
