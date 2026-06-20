import { vec3DotProduct, vec3Normalize, vec3Subtract } from '../math/vec3';
import type { Color, HitRecord, Vec3, World } from '../scene/types';
import { raySphereIntersect } from './intersect';

export function trace(rayPos: Vec3, rayDir: Vec3, color: Color, world: World): void {
  let nearest: HitRecord | null = null;

  color[0] = world.scene.background[0];
  color[1] = world.scene.background[1];
  color[2] = world.scene.background[2];

  for (const object of world.objects) {
    const hit = raySphereIntersect(rayPos, rayDir, object);

    if (hit && (nearest === null || hit.dist < nearest.dist)) {
      nearest = hit;
    }
  }

  if (nearest !== null) {
    const light = world.lights[0];
    const lightVec = vec3Normalize(vec3Subtract(light.location, nearest.object.location));
    const shade = Math.max(0.2, vec3DotProduct(lightVec, nearest.normal));

    color[0] = nearest.object.color[0] * shade;
    color[1] = nearest.object.color[1] * shade;
    color[2] = nearest.object.color[2] * shade;
  }
}