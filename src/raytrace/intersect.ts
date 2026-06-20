import { vec3Add, vec3DotProduct, vec3Scale, vec3Subtract } from '../math/vec3';
import type { HitRecord, Sphere, Vec3 } from '../scene/types';

export function raySphereIntersect(
  rayPos: Vec3,
  rayDir: Vec3,
  sphere: Sphere,
): HitRecord | null {
  const offset = vec3Subtract(rayPos, sphere.location);
  const a = vec3DotProduct(rayDir, rayDir);
  const b = 2 * vec3DotProduct(rayDir, offset);
  const c = vec3DotProduct(offset, offset) - sphere.radius * sphere.radius;
  const d = b * b - 4 * a * c;

  if (d < 0) {
    return null;
  }

  const sqrtd = Math.sqrt(d);
  const t0 = (-b - sqrtd) / (2 * a);
  const t1 = (-b + sqrtd) / (2 * a);

  if (t1 < 0) {
    return null;
  }

  const hit = vec3Add(rayPos, vec3Scale(rayDir, t0));
  const normal = vec3Scale(vec3Subtract(hit, sphere.location), 1 / sphere.radius);

  return {
    hitPoint: hit,
    normal,
    dist: -b - sqrtd,
    object: sphere,
  };
}