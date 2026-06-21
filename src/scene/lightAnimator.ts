import { vec3Add, vec3Mag, vec3Normalize, vec3Scale } from '../math/vec3';
import type { Vec3 } from './types';

export interface LightMotionState {
  position: Vec3;
  velocity: Vec3;
}

export interface LightMotionConfig {
  /** Constant travel speed in world units per second. */
  speed: number;
  /** Random steering strength in units per second squared. */
  driftAccel: number;
  /** Velocity retention per second (0-1). */
  dampingPerSecond: number;
}

export const DEFAULT_LIGHT_DEPTH = 10;

export const DEFAULT_LIGHT_MOTION: LightMotionConfig = {
  speed: 1.1,
  driftAccel: 3.5,
  dampingPerSecond: 0.35,
};

const REFERENCE_DT = 0.05;

export function createLightMotionState(position: Vec3): LightMotionState {
  return {
    position: [...position],
    velocity: [0, 0, 0],
  };
}

export function stepLightMotion(
  state: LightMotionState,
  config: LightMotionConfig,
  deltaSeconds: number,
  random: () => number,
): void {
  const jitter: Vec3 = [
    (random() - 0.5) * config.driftAccel,
    (random() - 0.5) * config.driftAccel,
    (random() - 0.5) * config.driftAccel,
  ];

  const damping = Math.pow(1 - config.dampingPerSecond, deltaSeconds / REFERENCE_DT);
  state.velocity = vec3Add(
    vec3Scale(state.velocity, damping),
    vec3Scale(jitter, deltaSeconds),
  );

  const speed = vec3Mag(state.velocity);
  if (speed > 0.001) {
    state.velocity = vec3Scale(state.velocity, config.speed / speed);
    return;
  }

  const heading: Vec3 = [
    random() - 0.5,
    random() - 0.5,
    random() - 0.5,
  ];
  state.velocity = vec3Scale(vec3Normalize(heading), config.speed);
}

export function integrateLightMotion(
  state: LightMotionState,
  deltaSeconds: number,
): Vec3 {
  state.position = vec3Add(state.position, vec3Scale(state.velocity, deltaSeconds));
  return state.position;
}