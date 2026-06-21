import { vec3Add, vec3DotProduct, vec3Normalize, vec3Subtract } from '../math/vec3';
import { planeCellColor } from '../scene/planeColor';
import type { Color, HitRecord, Light, SceneObject, Vec3, World } from '../scene/types';
import { rayObjectIntersect } from './intersect';
import { pointLightContribution } from './lighting';

function objectColor(hit: HitRecord): Color {
  if (hit.object.type === 'plane') {
    return planeCellColor(hit.hitPoint[0], hit.hitPoint[2]);
  }

  return hit.object.color;
}

function objectSpecular(object: SceneObject): number {
  if (object.type === 'plane') {
    return 0;
  }

  return object.specular;
}

function shadeHit(
  hit: HitRecord,
  rayPos: Vec3,
  light: Light,
  surface: Color,
  ambient: number,
  lightContribution: number,
): Color {
  const lightVec = vec3Normalize(vec3Subtract(light.location, hit.hitPoint));
  const viewVec = vec3Normalize(vec3Subtract(rayPos, hit.hitPoint));
  const halfVec = vec3Normalize(vec3Add(lightVec, viewVec));
  const specularAmount = objectSpecular(hit.object);

  const ndotl = Math.max(0, vec3DotProduct(lightVec, hit.normal));
  const direct = ndotl * lightContribution;
  const diffuse = ambient + direct * (1 - ambient);

  const specularDot = Math.max(0, vec3DotProduct(hit.normal, halfVec));
  const specularPower = 10 + specularAmount * 50;
  const highlight = Math.pow(specularDot, specularPower) * specularAmount * lightContribution;

  const matte = diffuse * (1 - specularAmount * 0.65);
  const strength = matte + highlight;

  return [
    Math.min(255, Math.floor(surface[0] * strength + light.color[0] * highlight * 0.55)),
    Math.min(255, Math.floor(surface[1] * strength + light.color[1] * highlight * 0.55)),
    Math.min(255, Math.floor(surface[2] * strength + light.color[2] * highlight * 0.55)),
  ];
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
  const contribution = pointLightContribution(world, nearest, light);
  const shaded = shadeHit(
    nearest,
    rayPos,
    light,
    objectColor(nearest),
    world.scene.ambient,
    contribution,
  );

  color[0] = shaded[0];
  color[1] = shaded[1];
  color[2] = shaded[2];
}