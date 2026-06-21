import { describe, expect, it } from 'vitest';
import type { Cone, Cube, Cylinder, Plane, Sphere } from '../scene/types';
import {
  rayConeIntersect,
  rayCubeIntersect,
  rayCylinderIntersect,
  rayObjectIntersect,
  rayPlaneIntersect,
  raySphereIntersect,
} from './intersect';

const rayPos: [number, number, number] = [0, 0, 0];
const rayDir: [number, number, number] = [0, 0, -1];

const sphere: Sphere = {
  type: 'sphere',
  location: [0, 0, -10],
  color: [255, 0, 0],
  radius: 1,
  specular: 0,
  emissive: false,
};

const plane: Plane = {
  type: 'plane',
  y: -2,
};

const cube: Cube = {
  type: 'cube',
  location: [0, 0, -10],
  color: [0, 255, 0],
  size: 2,
  specular: 0,
};

const cylinder: Cylinder = {
  type: 'cylinder',
  location: [0, 0, -10],
  color: [0, 0, 255],
  radius: 1,
  height: 2,
  specular: 0,
};

const cone: Cone = {
  type: 'cone',
  location: [0, -2, -10],
  color: [255, 255, 0],
  radius: 1,
  height: 2,
  specular: 0,
};

describe('raySphereIntersect', () => {
  it('returns null when the ray misses', () => {
    expect(raySphereIntersect(rayPos, [0, 1, 0], sphere)).toBeNull();
  });

  it('returns a hit when the ray strikes the sphere', () => {
    const hit = raySphereIntersect(rayPos, rayDir, sphere);
    expect(hit).not.toBeNull();
    expect(hit?.object).toBe(sphere);
    expect(hit?.t).toBeGreaterThan(0);
  });
});

describe('rayPlaneIntersect', () => {
  it('returns a hit when the ray strikes the plane', () => {
    const hit = rayPlaneIntersect(rayPos, [0, -0.2, -1], plane);
    expect(hit).not.toBeNull();
    expect(hit?.object).toBe(plane);
  });
});

describe('rayCubeIntersect', () => {
  it('returns a hit when the ray strikes the cube', () => {
    const hit = rayCubeIntersect(rayPos, rayDir, cube);
    expect(hit).not.toBeNull();
    expect(hit?.object).toBe(cube);
  });
});

describe('rayCylinderIntersect', () => {
  it('returns a hit when the ray strikes the cylinder', () => {
    const hit = rayCylinderIntersect(rayPos, rayDir, cylinder);
    expect(hit).not.toBeNull();
    expect(hit?.object).toBe(cylinder);
  });
});

describe('rayConeIntersect', () => {
  it('returns a hit when the ray strikes the cone', () => {
    const hit = rayConeIntersect(rayPos, rayDir, cone);
    expect(hit).not.toBeNull();
    expect(hit?.object).toBe(cone);
  });
});

describe('rayObjectIntersect', () => {
  it('dispatches by object type', () => {
    expect(rayObjectIntersect(rayPos, rayDir, sphere)?.object).toBe(sphere);
    expect(rayObjectIntersect(rayPos, rayDir, cube)?.object).toBe(cube);
  });
});