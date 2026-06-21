import { describe, expect, it } from 'vitest';
import { viewCenterAtDepth } from '../scene/camera';
import { sceneCamera, sceneLighting } from '../scene/defaultScene';
import { DEFAULT_LIGHT_DEPTH } from '../scene/lightAnimator';
import { createLightBulb } from '../scene/lightBulb';
import { trace } from './tracer';
import type { World } from '../scene/types';

describe('trace', () => {
  it('renders the emissive light bulb when the camera looks toward it', () => {
    const lightLocation = viewCenterAtDepth(sceneCamera, DEFAULT_LIGHT_DEPTH);
    const light = sceneLighting[0];
    const world: World = {
      camera: sceneCamera,
      scene: { background: [20, 22, 28], ambient: 0.08 },
      lights: [
        {
          ...light,
          location: [...lightLocation] as [number, number, number],
          color: [...light.color] as [number, number, number],
        },
      ],
      objects: [{ type: 'plane', y: -2 }, createLightBulb(lightLocation, light.color)],
    };

    const color: [number, number, number] = [0, 0, 0];
    const rayDir: [number, number, number] = [
      lightLocation[0] - sceneCamera.location[0],
      lightLocation[1] - sceneCamera.location[1],
      lightLocation[2] - sceneCamera.location[2],
    ];
    trace(sceneCamera.location, rayDir, color, world);

    expect(color[0]).toBeGreaterThan(200);
    expect(color[1]).toBeGreaterThan(180);
  });
});