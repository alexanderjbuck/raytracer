import { vec3DotProduct, vec3Normalize, vec3Subtract } from '../math/vec3';
import { planeCellColor } from '../scene/planeColor';
import type { Color, HitRecord, Vec3, World } from '../scene/types';
import { rayObjectIntersect } from './intersect';

function objectColor(hit: HitRecord): Color {
  if (hit.object.type === 'plane') {
    return planeCellColor(hit.hitPoint[0], hit.hitPoint[2]);
  }

  return hit.object.color;
}

export function trace(rayPos: Vec3, rayDir: Vec3, color: Color, world: World): void {
  let nearest: HitRecord | null = null;

  color[0] = world.scene.background[0];
  color[1] = world.scene.background[1];
  color[2] = world.scene.background[2];

  for (const object of world.objects) {
    const hit = rayObjectIntersect(rayPos, rayDir, object);
    if (hit && (nearest === null || hit.t < nearest.t)) {
      nearest = hit;
    }
  }

  if (nearest === null) {
    return;
  }

  const light = world.lights[0];
  const lightVec = vec3Normalize(vec3Subtract(light.location, nearest.hitPoint));
  const shade = Math.max(0.2, vec3DotProduct(lightVec, nearest.normal));
  const surface = objectColor(nearest);

  color[0] = surface[0] * shade;
  color[1] = surface[1] * shade;
  color[2] = surface[2] * shade;
}