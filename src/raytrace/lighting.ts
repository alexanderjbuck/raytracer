import { vec3Add, vec3Mag, vec3Normalize, vec3Scale, vec3Subtract } from '../math/vec3';
import type { HitRecord, Light, World } from '../scene/types';
import { raySceneIntersect } from './intersect';

const SHADOW_BIAS = 0.04;

export function pointLightAttenuation(distance: number, range: number): number {
  if (distance >= range) {
    return 0;
  }

  const inverseSquare = 1 / (1 + distance * distance * 0.02);
  const edge = 1 - distance / range;
  return inverseSquare * edge * edge;
}

export function isPointLit(world: World, hit: HitRecord, light: Light): boolean {
  const toLight = vec3Subtract(light.location, hit.hitPoint);
  const distance = vec3Mag(toLight);
  if (distance <= SHADOW_BIAS) {
    return true;
  }

  const lightDir = vec3Normalize(toLight);
  const origin = vec3Add(hit.hitPoint, vec3Scale(hit.normal, SHADOW_BIAS));
  const shadowCasters = world.objects.filter(
    (object) => !(object.type === 'sphere' && object.emissive),
  );
  const blocker = raySceneIntersect(origin, lightDir, shadowCasters, distance - SHADOW_BIAS);

  return blocker === null;
}

export function pointLightContribution(
  world: World,
  hit: HitRecord,
  light: Light,
): number {
  const distance = vec3Mag(vec3Subtract(light.location, hit.hitPoint));
  const attenuation = pointLightAttenuation(distance, light.range);
  if (attenuation <= 0) {
    return 0;
  }

  if (!isPointLit(world, hit, light)) {
    return 0;
  }

  return attenuation * light.intensity;
}