export type Vec3 = [number, number, number];
export type Color = Vec3;

export interface Camera {
  fovx: number;
  location: Vec3;
  depth: number;
}

export interface Sphere {
  type: 'sphere';
  location: Vec3;
  color: Color;
  radius: number;
}

export interface Light {
  location: Vec3;
  color: Color;
}

export interface HitRecord {
  hitPoint: Vec3;
  normal: Vec3;
  dist: number;
  object: Sphere;
}

export interface World {
  camera: Camera;
  scene: { background: Color };
  objects: Sphere[];
  lights: Light[];
}

export interface RenderConfig {
  width: number;
  height: number;
  resolution: number;
  frameIntervalMs: number;
}