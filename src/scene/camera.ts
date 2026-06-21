import type { Camera, Vec3 } from './types';

export function applyCameraPitch(dir: Vec3, pitch: number): Vec3 {
  const cos = Math.cos(pitch);
  const sin = Math.sin(pitch);

  return [
    dir[0],
    dir[1] * cos + dir[2] * sin,
    -dir[1] * sin + dir[2] * cos,
  ];
}

export function cameraForward(cameraPitch: number, depth: number): Vec3 {
  const dir = applyCameraPitch([0, 0, -depth], cameraPitch);
  const mag = Math.hypot(dir[0], dir[1], dir[2]);
  return [dir[0] / mag, dir[1] / mag, dir[2] / mag];
}

export function toCameraSpace(cameraLocation: Vec3, cameraPitch: number, point: Vec3): Vec3 {
  const d = [
    point[0] - cameraLocation[0],
    point[1] - cameraLocation[1],
    point[2] - cameraLocation[2],
  ];
  const cos = Math.cos(cameraPitch);
  const sin = Math.sin(cameraPitch);

  return [
    d[0],
    d[1] * cos - d[2] * sin,
    d[1] * sin + d[2] * cos,
  ];
}

export function fromCameraSpace(cameraLocation: Vec3, cameraPitch: number, local: Vec3): Vec3 {
  const cos = Math.cos(cameraPitch);
  const sin = Math.sin(cameraPitch);
  const [cx, cy, cz] = local;

  return [
    cameraLocation[0] + cx,
    cameraLocation[1] + cy * cos + cz * sin,
    cameraLocation[2] - cy * sin + cz * cos,
  ];
}

export function viewCenterAtDepth(camera: Camera, depth: number): Vec3 {
  return fromCameraSpace(camera.location, camera.pitch, [0, 0, -depth]);
}

export function worldVelocityToCamera(cameraPitch: number, velocity: Vec3): Vec3 {
  const cos = Math.cos(cameraPitch);
  const sin = Math.sin(cameraPitch);

  return [
    velocity[0],
    velocity[1] * cos - velocity[2] * sin,
    velocity[1] * sin + velocity[2] * cos,
  ];
}

export function cameraVelocityToWorld(cameraPitch: number, velocity: Vec3): Vec3 {
  const cos = Math.cos(cameraPitch);
  const sin = Math.sin(cameraPitch);
  const [vx, vy, vz] = velocity;

  return [vx, vy * cos + vz * sin, -vy * sin + vz * cos];
}