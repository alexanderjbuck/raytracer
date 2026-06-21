import { viewCenterAtDepth } from './camera';
import {
  DEFAULT_LIGHT_DEPTH,
  DEFAULT_LIGHT_MOTION,
} from './lightAnimator';
import type { Light, World } from './types';

export const sceneCamera = {
  fovx: Math.PI / 4,
  location: [0, 0.8, 2.5] as [number, number, number],
  depth: 1,
  pitch: 0.28,
};

export const sceneLighting: Light[] = [
  {
    location: viewCenterAtDepth(sceneCamera, DEFAULT_LIGHT_DEPTH),
    color: [0xff, 0xf4, 0xc8],
    range: 42,
    intensity: 2.4,
  },
];

export const defaultScene: World = {
  camera: sceneCamera,
  scene: {
    background: [0x20, 0x22, 0x28],
    ambient: 0.08,
  },
  objects: [{ type: 'plane', y: -2 }],
  lights: sceneLighting,
};

export const defaultRenderConfig = {
  width: 640,
  height: 400,
  resolution: 0.5,
  frameIntervalMs: 50,
  lightMotion: DEFAULT_LIGHT_MOTION,
} as const;