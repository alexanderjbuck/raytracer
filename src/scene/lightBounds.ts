import {
  vec3Lerp,
  vec3Mag,
  vec3Normalize,
  vec3Scale,
  vec3Subtract,
} from '../math/vec3';
import {
  cameraVelocityToWorld,
  fromCameraSpace,
  toCameraSpace,
  worldVelocityToCamera,
} from './camera';
import type { Camera, Vec3 } from './types';
import type { LightMotionState } from './lightAnimator';

const EDGE_START = 0.55;
const STEER_BLEND = 0.16;
const FLOOR_CLEARANCE = 2;
const FLOOR_ZONE = 1.5;
const DEPTH_ZONE = 1.2;
const BOUNDS_EPSILON = 0.01;

export const DEFAULT_MIN_DEPTH = 7;
export const DEFAULT_MAX_DEPTH = 14;

export interface LightBoundsConfig {
  minDepth: number;
  maxDepth: number;
}

export const DEFAULT_LIGHT_BOUNDS: LightBoundsConfig = {
  minDepth: DEFAULT_MIN_DEPTH,
  maxDepth: DEFAULT_MAX_DEPTH,
};

function frustumTangents(camera: Camera, aspect: number): { tanfovx: number; tanfovy: number } {
  const fovy = aspect * camera.fovx;
  return {
    tanfovx: Math.tan(camera.fovx),
    tanfovy: Math.tan(fovy),
  };
}

function frustumLimits(
  camera: Camera,
  aspect: number,
  orbRadius: number,
  cz: number,
): { maxCx: number; maxCy: number; minCz: number } {
  const { tanfovx, tanfovy } = frustumTangents(camera, aspect);
  const depth = -cz;

  return {
    maxCx: Math.max(0, depth * tanfovx - orbRadius),
    maxCy: Math.max(0, depth * tanfovy - orbRadius),
    minCz: -orbRadius,
  };
}

export function minLightHeight(floorY: number, orbRadius: number): number {
  return floorY + orbRadius + FLOOR_CLEARANCE;
}

export function cameraDepth(camera: Camera, position: Vec3): number {
  const [, , cz] = toCameraSpace(camera.location, camera.pitch, position);
  return -cz;
}

export function isLightOrbInFrustum(
  camera: Camera,
  aspect: number,
  orbRadius: number,
  position: Vec3,
  bounds: LightBoundsConfig = DEFAULT_LIGHT_BOUNDS,
): boolean {
  const [cx, cy, cz] = toCameraSpace(camera.location, camera.pitch, position);
  const { maxCx, maxCy, minCz } = frustumLimits(camera, aspect, orbRadius, cz);
  const depth = -cz;

  if (cz >= minCz) {
    return false;
  }

  if (depth < bounds.minDepth - BOUNDS_EPSILON || depth > bounds.maxDepth + BOUNDS_EPSILON) {
    return false;
  }

  return (
    Math.abs(cx) <= maxCx + BOUNDS_EPSILON && Math.abs(cy) <= maxCy + BOUNDS_EPSILON
  );
}

function frustumEdgeBlend(
  camera: Camera,
  aspect: number,
  orbRadius: number,
  position: Vec3,
): number {
  const [cx, cy, cz] = toCameraSpace(camera.location, camera.pitch, position);
  const { maxCx, maxCy } = frustumLimits(camera, aspect, orbRadius, cz);

  const proxX = maxCx > 0 ? Math.abs(cx) / maxCx : 1;
  const proxY = maxCy > 0 ? Math.abs(cy) / maxCy : 1;
  const proximity = Math.max(proxX, proxY);

  if (proximity <= EDGE_START) {
    return 0;
  }

  return (proximity - EDGE_START) / (1 - EDGE_START);
}

function floorEdgeBlend(positionY: number, minY: number): number {
  if (positionY >= minY + FLOOR_ZONE) {
    return 0;
  }

  return 1 - (positionY - minY) / FLOOR_ZONE;
}

function depthEdgeBlend(depth: number, bounds: LightBoundsConfig): number {
  if (depth < bounds.minDepth + DEPTH_ZONE) {
    return 1 - (depth - bounds.minDepth) / DEPTH_ZONE;
  }

  if (depth > bounds.maxDepth - DEPTH_ZONE) {
    return 1 - (bounds.maxDepth - depth) / DEPTH_ZONE;
  }

  return 0;
}

function constraintInwardDirection(
  camera: Camera,
  aspect: number,
  orbRadius: number,
  floorY: number,
  bounds: LightBoundsConfig,
  position: Vec3,
): Vec3 {
  const [cx, cy, cz] = toCameraSpace(camera.location, camera.pitch, position);
  const { maxCx, maxCy } = frustumLimits(camera, aspect, orbRadius, cz);
  const minY = minLightHeight(floorY, orbRadius);
  const depth = -cz;

  let targetCx = cx;
  let targetCy = cy;
  let targetCz = cz;

  if (maxCx > 0 && Math.abs(cx) > maxCx * EDGE_START) {
    targetCx = cx * ((maxCx * EDGE_START) / Math.abs(cx));
  }

  if (maxCy > 0 && Math.abs(cy) > maxCy * EDGE_START) {
    targetCy = cy * ((maxCy * EDGE_START) / Math.abs(cy));
  }

  if (position[1] < minY + FLOOR_ZONE) {
    const target = fromCameraSpace(camera.location, camera.pitch, [targetCx, targetCy, targetCz]);
    target[1] = Math.max(target[1], minY + FLOOR_ZONE);
    return vec3Normalize(vec3Subtract(target, position));
  }

  if (depth < bounds.minDepth + DEPTH_ZONE) {
    targetCz = -Math.min(bounds.maxDepth - DEPTH_ZONE, bounds.minDepth + DEPTH_ZONE);
  } else if (depth > bounds.maxDepth - DEPTH_ZONE) {
    targetCz = -Math.max(bounds.minDepth + DEPTH_ZONE, bounds.maxDepth - DEPTH_ZONE);
  }

  const target = fromCameraSpace(camera.location, camera.pitch, [targetCx, targetCy, targetCz]);
  const inward = vec3Subtract(target, position);
  const mag = vec3Mag(inward);

  if (mag < 0.001) {
    return [0, 1, 0];
  }

  return vec3Scale(inward, 1 / mag);
}

function steerVelocityDirection(
  velocity: Vec3,
  targetDirection: Vec3,
  speed: number,
  blend: number,
): Vec3 {
  const currentDirection =
    vec3Mag(velocity) > 0.001 ? vec3Normalize(velocity) : targetDirection;
  const blended = vec3Lerp(currentDirection, targetDirection, blend);
  const blendedMag = vec3Mag(blended);

  if (blendedMag < 0.001) {
    return velocity;
  }

  return vec3Scale(blended, speed / blendedMag);
}

export function steerLightMotion(
  state: LightMotionState,
  camera: Camera,
  aspect: number,
  orbRadius: number,
  floorY: number,
  bounds: LightBoundsConfig,
  speed: number,
): void {
  const minY = minLightHeight(floorY, orbRadius);
  const depth = cameraDepth(camera, state.position);
  const frustumBlend = frustumEdgeBlend(camera, aspect, orbRadius, state.position);
  const floorBlend = floorEdgeBlend(state.position[1], minY);
  const depthBlend = depthEdgeBlend(depth, bounds);
  const steerBlend = Math.min(1, Math.max(frustumBlend, floorBlend, depthBlend) * STEER_BLEND);

  if (steerBlend <= 0) {
    const currentSpeed = vec3Mag(state.velocity);
    if (Math.abs(currentSpeed - speed) > 0.001 && currentSpeed > 0.001) {
      state.velocity = vec3Scale(state.velocity, speed / currentSpeed);
    }
    return;
  }

  const steerDirection = constraintInwardDirection(
    camera,
    aspect,
    orbRadius,
    floorY,
    bounds,
    state.position,
  );
  state.velocity = steerVelocityDirection(state.velocity, steerDirection, speed, steerBlend);
}

function clampOrbToFrustum(
  camera: Camera,
  aspect: number,
  orbRadius: number,
  bounds: LightBoundsConfig,
  position: Vec3,
  velocity: Vec3,
): { position: Vec3; velocity: Vec3 } {
  let [cx, cy, cz] = toCameraSpace(camera.location, camera.pitch, position);
  let vel = worldVelocityToCamera(camera.pitch, velocity);
  const { maxCx, maxCy, minCz } = frustumLimits(camera, aspect, orbRadius, cz);
  const depth = -cz;

  if (depth < bounds.minDepth) {
    cz = -bounds.minDepth;
    if (vel[2] > 0) {
      vel[2] *= -0.5;
    }
  } else if (depth > bounds.maxDepth) {
    cz = -bounds.maxDepth;
    if (vel[2] < 0) {
      vel[2] *= -0.5;
    }
  }

  if (cz > minCz) {
    cz = minCz;
    if (vel[2] > 0) {
      vel[2] *= -0.5;
    }
  }

  if (cx < -maxCx) {
    cx = -maxCx;
    if (vel[0] < 0) {
      vel[0] *= -0.5;
    }
  } else if (cx > maxCx) {
    cx = maxCx;
    if (vel[0] > 0) {
      vel[0] *= -0.5;
    }
  }

  if (cy < -maxCy) {
    cy = -maxCy;
    if (vel[1] < 0) {
      vel[1] *= -0.5;
    }
  } else if (cy > maxCy) {
    cy = maxCy;
    if (vel[1] > 0) {
      vel[1] *= -0.5;
    }
  }

  return {
    position: fromCameraSpace(camera.location, camera.pitch, [cx, cy, cz]),
    velocity: cameraVelocityToWorld(camera.pitch, vel),
  };
}

function clampAboveFloor(
  position: Vec3,
  velocity: Vec3,
  minY: number,
): { position: Vec3; velocity: Vec3 } {
  const pos: Vec3 = [...position];
  const vel: Vec3 = [...velocity];

  if (pos[1] < minY) {
    pos[1] = minY;
    if (vel[1] < 0) {
      vel[1] *= -0.5;
    }
  }

  return { position: pos, velocity: vel };
}

export function enforceLightBounds(
  state: LightMotionState,
  camera: Camera,
  aspect: number,
  orbRadius: number,
  floorY: number,
  bounds: LightBoundsConfig,
  speed: number,
): Vec3 {
  const minY = minLightHeight(floorY, orbRadius);

  for (let pass = 0; pass < 4; pass++) {
    let clamped = clampOrbToFrustum(
      camera,
      aspect,
      orbRadius,
      bounds,
      state.position,
      state.velocity,
    );
    state.position = clamped.position;
    state.velocity = clamped.velocity;

    clamped = clampAboveFloor(state.position, state.velocity, minY);
    state.position = clamped.position;
    state.velocity = clamped.velocity;
  }

  let [cx, cy, cz] = toCameraSpace(camera.location, camera.pitch, state.position);
  const depth = -cz;
  if (depth < bounds.minDepth) {
    cz = -bounds.minDepth;
  } else if (depth > bounds.maxDepth) {
    cz = -bounds.maxDepth;
  }
  const { maxCx, maxCy } = frustumLimits(camera, aspect, orbRadius, cz);
  cx = Math.max(-maxCx, Math.min(maxCx, cx));
  cy = Math.max(-maxCy, Math.min(maxCy, cy));
  state.position = fromCameraSpace(camera.location, camera.pitch, [cx, cy, cz]);

  const currentSpeed = vec3Mag(state.velocity);
  if (currentSpeed > 0.001) {
    state.velocity = vec3Scale(state.velocity, speed / currentSpeed);
  }

  return state.position;
}