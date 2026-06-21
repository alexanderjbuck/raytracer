import type { Color, Light, Sphere, Vec3 } from './types';

export const LIGHT_BULB_RADIUS = 0.38;

export function createLightBulb(location: Vec3, color: Color): Sphere {
  return {
    type: 'sphere',
    location: [...location],
    color: [...color],
    radius: LIGHT_BULB_RADIUS,
    specular: 0,
    emissive: true,
  };
}

export function syncLightBulb(bulb: Sphere, light: Light): void {
  bulb.location[0] = light.location[0];
  bulb.location[1] = light.location[1];
  bulb.location[2] = light.location[2];
  bulb.color[0] = light.color[0];
  bulb.color[1] = light.color[1];
  bulb.color[2] = light.color[2];
}