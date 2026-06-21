export type Vec3 = [number, number, number];
export type Color = Vec3;

export interface Camera {
  fovx: number;
  location: Vec3;
  depth: number;
  /** Radians pitched downward (positive looks toward the floor). */
  pitch: number;
}

export interface Plane {
  type: 'plane';
  y: number;
}

export interface Sphere {
  type: 'sphere';
  location: Vec3;
  color: Color;
  radius: number;
  specular: number;
  emissive: boolean;
}

export interface Cube {
  type: 'cube';
  location: Vec3;
  color: Color;
  size: number;
  specular: number;
}

export interface Cylinder {
  type: 'cylinder';
  location: Vec3;
  color: Color;
  radius: number;
  height: number;
  specular: number;
}

export interface Cone {
  type: 'cone';
  location: Vec3;
  color: Color;
  radius: number;
  height: number;
  specular: number;
}

export type SceneObject = Plane | Sphere | Cube | Cylinder | Cone;

export interface HitRecord {
  hitPoint: Vec3;
  normal: Vec3;
  t: number;
  object: SceneObject;
}

export interface Light {
  location: Vec3;
  color: Color;
  range: number;
  intensity: number;
}

export interface World {
  camera: Camera;
  scene: { background: Color; ambient: number };
  objects: SceneObject[];
  lights: Light[];
}

export interface LightMotionConfig {
  speed: number;
  driftAccel: number;
  dampingPerSecond: number;
}

export interface RenderConfig {
  width: number;
  height: number;
  resolution: number;
  frameIntervalMs: number;
  lightMotion?: LightMotionConfig;
}