import { describe, expect, it } from 'vitest';
import { vec3DotProduct, vec3Mag, vec3Normalize, vec3Subtract } from './vec3';

describe('vec3', () => {
  it('computes magnitude', () => {
    expect(vec3Mag([3, 4, 0])).toBe(5);
  });

  it('normalizes a vector', () => {
    const n = vec3Normalize([0, 3, 4]);
    expect(n[0]).toBeCloseTo(0);
    expect(n[1]).toBeCloseTo(0.6);
    expect(n[2]).toBeCloseTo(0.8);
  });

  it('computes dot product', () => {
    expect(vec3DotProduct([1, 2, 3], [4, 5, 6])).toBe(32);
  });

  it('subtracts vectors', () => {
    expect(vec3Subtract([5, 7, 9], [1, 2, 3])).toEqual([4, 5, 6]);
  });
});