import { describe, expect, it } from 'vitest';
import type { World } from '../scene/types';
import { isPointLit, pointLightAttenuation } from './lighting';

describe('pointLightAttenuation', () => {
  it('is strongest at the light and falls off with distance', () => {
    expect(pointLightAttenuation(0, 20)).toBeCloseTo(1, 2);
    expect(pointLightAttenuation(10, 20)).toBeLessThan(pointLightAttenuation(2, 20));
    expect(pointLightAttenuation(20, 20)).toBe(0);
  });
});

describe('isPointLit', () => {
  it('returns false when another object blocks the path to the light', () => {
    const world: World = {
      camera: { fovx: 1, location: [0, 0, 0], depth: 1, pitch: 0 },
      scene: { background: [0, 0, 0], ambient: 0.08 },
      lights: [{ location: [0, 0, 0], color: [255, 255, 255], range: 20, intensity: 1 }],
      objects: [
        { type: 'plane', y: -2 },
        {
          type: 'sphere',
          location: [0, 0, -5],
          color: [255, 0, 0],
          radius: 1,
          specular: 0,
          emissive: false,
        },
      ],
    };

    const shadowHit = {
      hitPoint: [0, 0, -8] as [number, number, number],
      normal: [0, 0, 1] as [number, number, number],
      t: 8,
      object: world.objects[1],
    };

    expect(isPointLit(world, shadowHit, world.lights[0])).toBe(false);
  });
});