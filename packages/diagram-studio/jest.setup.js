/**
 * Jest setup for @ontographia/diagram-studio
 */

// Mock crypto.randomUUID
const mockRandomUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Set up global crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: mockRandomUUID,
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
  writable: true,
  configurable: true,
});

// Mock ulid
jest.mock('ulid', () => ({
  ulid: () => 'test-ulid-' + Date.now(),
}));
