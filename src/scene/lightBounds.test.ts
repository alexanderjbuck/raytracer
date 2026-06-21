import { describe, expect, it } from 'vitest';
import { fromCameraSpace, viewCenterAtDepth } from './camera';
import { defaultRenderConfig, sceneCamera } from './defaultScene';
import {
  DEFAULT_LIGHT_DEPTH,
  DEFAULT_LIGHT_MOTION,
  createLightMotionState,
  integrateLightMotion,
  stepLightMotion,
} from './lightAnimator';
import { LIGHT_BULB_RADIUS } from './lightBulb';
import {
  DEFAULT_LIGHT_BOUNDS,
  cameraDepth,
  enforceLightBounds,
  isLightOrbInFrustum,
  minLightHeight,
  steerLightMotion,
} from './lightBounds';

const aspect = defaultRenderConfig.height / defaultRenderConfig.width;
const floorY = -2;
const deltaSeconds = defaultRenderConfig.frameIntervalMs / 1000;

describe('view center start', () => {
  it('places the light at the center of the view', () => {
    const center = viewCenterAtDepth(sceneCamera, DEFAULT_LIGHT_DEPTH);
    const state = createLightMotionState(center);
    enforceLightBounds(
      state,
      sceneCamera,
      aspect,
      LIGHT_BULB_RADIUS,
      floorY,
      DEFAULT_LIGHT_BOUNDS,
      DEFAULT_LIGHT_MOTION.speed,
    );

    expect(
      isLightOrbInFrustum(sceneCamera, aspect, LIGHT_BULB_RADIUS, state.position),
    ).toBe(true);
    expect(cameraDepth(sceneCamera, state.position)).toBeGreaterThanOrEqual(
      DEFAULT_LIGHT_BOUNDS.minDepth,
    );
    expect(cameraDepth(sceneCamera, state.position)).toBeLessThanOrEqual(
      DEFAULT_LIGHT_BOUNDS.maxDepth,
    );
  });
});

describe('steerLightMotion', () => {
  it('steers velocity back into the frustum when near the edge', () => {
    const start = viewCenterAtDepth(sceneCamera, DEFAULT_LIGHT_DEPTH);
    const state = createLightMotionState(start);
    state.position = fromCameraSpace(sceneCamera.location, sceneCamera.pitch, [
      3.5,
      0,
      -DEFAULT_LIGHT_DEPTH,
    ]);
    state.velocity = [DEFAULT_LIGHT_MOTION.speed, 0, 0];

    steerLightMotion(
      state,
      sceneCamera,
      aspect,
      LIGHT_BULB_RADIUS,
      floorY,
      DEFAULT_LIGHT_BOUNDS,
      DEFAULT_LIGHT_MOTION.speed,
    );

    expect(state.velocity[0]).toBeLessThan(DEFAULT_LIGHT_MOTION.speed * 0.95);
  });

  it('steers velocity upward when approaching the floor', () => {
    const start = viewCenterAtDepth(sceneCamera, DEFAULT_LIGHT_DEPTH);
    const state = createLightMotionState(start);
    const minY = minLightHeight(floorY, LIGHT_BULB_RADIUS);
    state.position = [start[0], minY + 0.4, start[2]];
    state.velocity = [0.2, -DEFAULT_LIGHT_MOTION.speed, 0.1];

    steerLightMotion(
      state,
      sceneCamera,
      aspect,
      LIGHT_BULB_RADIUS,
      floorY,
      DEFAULT_LIGHT_BOUNDS,
      DEFAULT_LIGHT_MOTION.speed,
    );

    expect(state.velocity[1]).toBeGreaterThan(-DEFAULT_LIGHT_MOTION.speed);
  });
});

describe('light motion integration', () => {
  it('keeps the orb visible, above the floor, and within depth limits', () => {
    const start = viewCenterAtDepth(sceneCamera, DEFAULT_LIGHT_DEPTH);
    const state = createLightMotionState(start);
    enforceLightBounds(
      state,
      sceneCamera,
      aspect,
      LIGHT_BULB_RADIUS,
      floorY,
      DEFAULT_LIGHT_BOUNDS,
      DEFAULT_LIGHT_MOTION.speed,
    );
    let seed = 7;

    for (let frame = 0; frame < 600; frame++) {
      stepLightMotion(state, DEFAULT_LIGHT_MOTION, deltaSeconds, () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      });
      steerLightMotion(
        state,
        sceneCamera,
        aspect,
        LIGHT_BULB_RADIUS,
        floorY,
        DEFAULT_LIGHT_BOUNDS,
        DEFAULT_LIGHT_MOTION.speed,
      );
      integrateLightMotion(state, deltaSeconds);
      const location = enforceLightBounds(
        state,
        sceneCamera,
        aspect,
        LIGHT_BULB_RADIUS,
        floorY,
        DEFAULT_LIGHT_BOUNDS,
        DEFAULT_LIGHT_MOTION.speed,
      );

      expect(
        isLightOrbInFrustum(sceneCamera, aspect, LIGHT_BULB_RADIUS, location),
      ).toBe(true);
      expect(location[1]).toBeGreaterThanOrEqual(minLightHeight(floorY, LIGHT_BULB_RADIUS));
      const depth = cameraDepth(sceneCamera, location);
      expect(depth).toBeGreaterThanOrEqual(DEFAULT_LIGHT_BOUNDS.minDepth - 0.01);
      expect(depth).toBeLessThanOrEqual(DEFAULT_LIGHT_BOUNDS.maxDepth + 0.01);
    }
  });
});