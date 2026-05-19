/// <reference types="vitest/globals" />
import "@testing-library/jest-dom";

// Radix UI components (DropdownMenu, ScrollArea, etc.) use ResizeObserver internally.
// jsdom does not ship it, so we stub it.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub;

// jsdom 29 may not initialise localStorage correctly in all Vitest environments.
// Replace it with a reliable in-memory implementation so tests can call .clear().
let _store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => _store[key] ?? null,
  setItem: (key: string, value: string) => {
    _store[key] = value;
  },
  removeItem: (key: string) => {
    delete _store[key];
  },
  clear: () => {
    _store = {};
  },
  get length() {
    return Object.keys(_store).length;
  },
  key: (index: number) => Object.keys(_store)[index] ?? null,
};

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// Clear storage before every test so state doesn't leak between suites.
beforeEach(() => {
  localStorageMock.clear();
});
