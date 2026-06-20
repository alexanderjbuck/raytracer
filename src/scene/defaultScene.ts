import type { World } from './types';

export const defaultScene: World = {
  camera: {
    fovx: Math.PI / 4,
    location: [0, 0, 0],
    depth: 1,
  },
  scene: {
    background: [0x00, 0x00, 0x00],
  },
  objects: [
    {
      type: 'sphere',
      location: [0, -1.5, -10],
      color: [0x00, 0xff, 0x00],
      radius: 1,
    },
    {
      type: 'sphere',
      location: [0, 0, -10],
      color: [0xff, 0x00, 0x00],
      radius: 0.75,
    },
    {
      type: 'sphere',
      location: [0, 1, -10],
      color: [0x00, 0x00, 0xff],
      radius: 0.5,
    },
  ],
  lights: [
    {
      location: [-2, 2, -6],
      color: [0xff, 0xf0, 0xee],
    },
  ],
};

export const defaultRenderConfig = {
  width: 500,
  height: 200,
  resolution: 0.35,
  frameIntervalMs: 50,
} as const;