import { createRng, type Rng } from '../util/rng';
import { sceneCamera, sceneLighting } from './defaultScene';
import type { Color, SceneObject, World } from './types';

const FLOOR_Y = -2;
const PRIMITIVE_TYPES = ['sphere', 'cube', 'cylinder', 'cone'] as const;
type PrimitiveType = (typeof PRIMITIVE_TYPES)[number];

function randomColor(rng: Rng): Color {
  return [rng.int(70, 255), rng.int(70, 255), rng.int(70, 255)];
}

function footprintRadius(type: PrimitiveType, rng: Rng): number {
  switch (type) {
    case 'sphere':
      return rng.float(0.35, 1.1);
    case 'cube':
      return rng.float(0.5, 1.3) / 2;
    case 'cylinder':
      return rng.float(0.35, 0.9);
    case 'cone':
      return rng.float(0.5, 1.2);
  }
}

function makePrimitive(type: PrimitiveType, x: number, z: number, rng: Rng): SceneObject {
  const color = randomColor(rng);

  switch (type) {
    case 'sphere': {
      const radius = rng.float(0.35, 1.1);
      return {
        type,
        location: [x, FLOOR_Y + radius, z],
        color,
        radius,
      };
    }
    case 'cube': {
      const size = rng.float(0.7, 1.8);
      return {
        type,
        location: [x, FLOOR_Y + size / 2, z],
        color,
        size,
      };
    }
    case 'cylinder': {
      const radius = rng.float(0.35, 0.9);
      const height = rng.float(1, 2.4);
      return {
        type,
        location: [x, FLOOR_Y + height / 2, z],
        color,
        radius,
        height,
      };
    }
    case 'cone': {
      const radius = rng.float(0.5, 1.2);
      const height = rng.float(1.2, 2.6);
      return {
        type,
        location: [x, FLOOR_Y, z],
        color,
        radius,
        height,
      };
    }
  }
}

export function generateScene(primitiveCount = 28, seed = Date.now()): World {
  const rng = createRng(seed);
  const objects: SceneObject[] = [{ type: 'plane', y: FLOOR_Y }];
  const placed: Array<{ x: number; z: number; radius: number }> = [];

  let attempts = 0;
  const maxAttempts = primitiveCount * 12;

  while (objects.length - 1 < primitiveCount && attempts < maxAttempts) {
    attempts++;
    const type = rng.pick(PRIMITIVE_TYPES);
    const x = rng.float(-10, 10);
    const z = rng.float(-22, -3);
    const radius = footprintRadius(type, rng);

    const overlaps = placed.some((other) => {
      const dx = other.x - x;
      const dz = other.z - z;
      const minDist = other.radius + radius + 0.35;
      return dx * dx + dz * dz < minDist * minDist;
    });

    if (overlaps) {
      continue;
    }

    placed.push({ x, z, radius });
    objects.push(makePrimitive(type, x, z, rng));
  }

  return {
    camera: sceneCamera,
    scene: {
      background: [0x20, 0x22, 0x28],
    },
    objects,
    lights: sceneLighting,
  };
}