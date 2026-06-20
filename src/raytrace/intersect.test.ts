import { describe, expect, it } from 'vitest';
import type { Sphere } from '../scene/types';
import { raySphereIntersect } from './intersect';

const sphere: Sphere = {
  type: 'sphere',
  location: [0, 0, -10],
  color: [255, 0, 0],
  radius: 1,
};

describe('raySphereIntersect', () => {
  it('returns null when the ray misses', () => {
    const hit = raySphereIntersect([0, 0, 0], [0, 1, 0], sphere);
    expect(hit).toBeNull();
  });

  it('returns a hit when the ray strikes the sphere', () => {
    const hit = raySphereIntersect([0, 0, 0], [0, 0, -1], sphere);
    expect(hit).not.toBeNull();
    expect(hit?.object).toBe(sphere);
    expect(hit?.dist).toBeGreaterThan(0);
  });
});