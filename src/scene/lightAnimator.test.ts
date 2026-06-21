import { describe, expect, it } from 'vitest';
import { viewCenterAtDepth } from './camera';
import { sceneCamera } from './defaultScene';
import {
  DEFAULT_LIGHT_BOUNDS,
  cameraDepth,
  enforceLightBounds,
  steerLightMotion,
} from './lightBounds';
import {
  DEFAULT_LIGHT_DEPTH,
  DEFAULT_LIGHT_MOTION,
  createLightMotionState,
  integrateLightMotion,
  stepLightMotion,
} from './lightAnimator';

const aspect = 400 / 640;
const floorY = -2;
const deltaSeconds = 0.05;

describe('light motion', () => {
  it('moves at the configured speed in units per second', () => {
    const start = viewCenterAtDepth(sceneCamera, DEFAULT_LIGHT_DEPTH);
    const state = createLightMotionState(start);
    state.velocity = [DEFAULT_LIGHT_MOTION.speed, 0, 0];

    integrateLightMotion(state, deltaSeconds);

    expect(state.position[0] - start[0]).toBeCloseTo(DEFAULT_LIGHT_MOTION.speed * deltaSeconds, 5);
  });

  it('stays within bounds while drifting', () => {
    const start = viewCenterAtDepth(sceneCamera, DEFAULT_LIGHT_DEPTH);
    const state = createLightMotionState(start);
    let seed = 42;

    for (let frame = 0; frame < 400; frame++) {
      stepLightMotion(state, DEFAULT_LIGHT_MOTION, deltaSeconds, () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      });
      steerLightMotion(
        state,
        sceneCamera,
        aspect,
        0.38,
        floorY,
        DEFAULT_LIGHT_BOUNDS,
        DEFAULT_LIGHT_MOTION.speed,
      );
      integrateLightMotion(state, deltaSeconds);
      enforceLightBounds(
        state,
        sceneCamera,
        aspect,
        0.38,
        floorY,
        DEFAULT_LIGHT_BOUNDS,
        DEFAULT_LIGHT_MOTION.speed,
      );
    }

    const depth = cameraDepth(sceneCamera, state.position);
    expect(depth).toBeGreaterThanOrEqual(DEFAULT_LIGHT_BOUNDS.minDepth);
    expect(depth).toBeLessThanOrEqual(DEFAULT_LIGHT_BOUNDS.maxDepth);
  });
});