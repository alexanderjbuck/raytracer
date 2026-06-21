import { describe, expect, it } from 'vitest';
import { generateScene } from './generateScene';

describe('generateScene', () => {
  it('creates a plane plus an assortment of primitives', () => {
    const world = generateScene(24, 12345);
    expect(world.objects[0].type).toBe('plane');
    expect(world.objects.length).toBeGreaterThan(8);

    const types = new Set(world.objects.slice(1).map((object) => object.type));
    expect(types.has('sphere')).toBe(true);
    expect(types.has('cube')).toBe(true);
    expect(types.has('cylinder')).toBe(true);
    expect(types.has('cone')).toBe(true);
  });

  it('is stable for the same seed', () => {
    const a = generateScene(20, 99);
    const b = generateScene(20, 99);
    expect(a.objects.length).toBe(b.objects.length);
    expect(a.objects[5]).toEqual(b.objects[5]);
  });

  it('assigns specular between 0 and 1', () => {
    const world = generateScene(16, 42);
    for (const object of world.objects.slice(1)) {
      expect(object.type).not.toBe('plane');
      if (object.type !== 'plane') {
        expect(object.specular).toBeGreaterThanOrEqual(0);
        expect(object.specular).toBeLessThanOrEqual(1);
      }
    }
  });
});