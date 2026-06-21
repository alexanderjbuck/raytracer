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
}

export interface Cube {
  type: 'cube';
  location: Vec3;
  color: Color;
  size: number;
}

export interface Cylinder {
  type: 'cylinder';
  location: Vec3;
  color: Color;
  radius: number;
  height: number;
}

export interface Cone {
  type: 'cone';
  location: Vec3;
  color: Color;
  radius: number;
  height: number;
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
}

export interface World {
  camera: Camera;
  scene: { background: Color };
  objects: SceneObject[];
  lights: Light[];
}

export interface RenderConfig {
  width: number;
  height: number;
  resolution: number;
  frameIntervalMs: number;
}