/**
 * Gem Link — Test Setup
 * Owner: QA Engineer
 *
 * Global test setup and mocks.
 */

import { vi } from 'vitest';

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock window.matchMedia for Phaser
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Phaser Game for scene tests
vi.mock('phaser', () => ({
  default: {
    GameObjects: {
      Container: class Container {
        scene: any;
        x: number;
        y: number;
        list: any[] = [];
        constructor(scene: any, x: number, y: number) {
          this.scene = scene;
          this.x = x;
          this.y = y;
        }
        add(child: any) {
          if (Array.isArray(child)) {
            this.list.push(...child);
          } else {
            this.list.push(child);
          }
        }
        getAt(index: number) { return this.list[index]; }
        setSize() {}
        setInteractive() { return this; }
        setDepth() { return this; }
        setVisible() { return this; }
        setAlpha() { return this; }
        disableInteractive() {}
        on() {}
      },
      Graphics: class Graphics {},
    },
    Scene: class Scene {},
    Math: {
      Clamp: (value: number, min: number, max: number) => Math.max(min, Math.min(max, value)),
      Between: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
    },
    Geom: {
      Rectangle: class Rectangle {
        static Contains = () => true;
      },
    },
  },
}));
