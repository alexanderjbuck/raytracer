import { CanvasRenderer } from '../renderer/CanvasRenderer';
import { viewCenterAtDepth } from '../scene/camera';
import { defaultRenderConfig } from '../scene/defaultScene';
import {
  DEFAULT_LIGHT_BOUNDS,
  enforceLightBounds,
  steerLightMotion,
} from '../scene/lightBounds';
import {
  DEFAULT_LIGHT_DEPTH,
  DEFAULT_LIGHT_MOTION,
  createLightMotionState,
  integrateLightMotion,
  stepLightMotion,
  type LightMotionConfig,
  type LightMotionState,
} from '../scene/lightAnimator';
import { createLightBulb, LIGHT_BULB_RADIUS, syncLightBulb } from '../scene/lightBulb';
import type { RenderConfig, Sphere, World } from '../scene/types';
import { createRng } from '../util/rng';

export interface RayTracerAppOptions {
  containerId: string;
  world: World;
  config?: RenderConfig;
}

export class RayTracerApp {
  private readonly renderer: CanvasRenderer;
  private readonly world: World;
  private readonly lightBulb: Sphere;
  private readonly lightMotion: LightMotionState;
  private readonly lightMotionConfig: LightMotionConfig;
  private readonly motionRng: ReturnType<typeof createRng>;
  private readonly motionStepSeconds: number;
  private readonly aspect: number;
  private animationFrameId: number | null = null;
  private lastRenderTime: number | null = null;

  constructor(options: RayTracerAppOptions) {
    const config = options.config ?? defaultRenderConfig;
    this.world = options.world;
    this.lightMotionConfig = config.lightMotion ?? DEFAULT_LIGHT_MOTION;
    this.motionStepSeconds = config.frameIntervalMs / 1000;

    const light = this.world.lights[0];
    const startPosition = viewCenterAtDepth(this.world.camera, DEFAULT_LIGHT_DEPTH);
    light.location[0] = startPosition[0];
    light.location[1] = startPosition[1];
    light.location[2] = startPosition[2];

    this.lightBulb = createLightBulb(light.location, light.color);
    this.world.objects.push(this.lightBulb);

    this.lightMotion = createLightMotionState(startPosition);
    enforceLightBounds(
      this.lightMotion,
      this.world.camera,
      config.height / config.width,
      LIGHT_BULB_RADIUS,
      this.getFloorY(),
      DEFAULT_LIGHT_BOUNDS,
      this.lightMotionConfig.speed,
    );
    light.location[0] = this.lightMotion.position[0];
    light.location[1] = this.lightMotion.position[1];
    light.location[2] = this.lightMotion.position[2];
    syncLightBulb(this.lightBulb, light);

    this.motionRng = createRng(Date.now());
    this.renderer = new CanvasRenderer(options.containerId, this.world, config);
    this.aspect = config.height / config.width;
  }

  start(): void {
    this.stop();
    this.lastRenderTime = null;
    this.animationFrameId = requestAnimationFrame((timestamp) => this.tick(timestamp));
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  getResolution(): number {
    return this.renderer.getResolution();
  }

  setResolution(resolution: number): void {
    this.renderer.setResolution(resolution);
    this.renderer.render();
  }

  private updateLight(): void {
    const light = this.world.lights[0];
    const deltaSeconds = this.motionStepSeconds;

    stepLightMotion(
      this.lightMotion,
      this.lightMotionConfig,
      deltaSeconds,
      () => this.motionRng.next(),
    );
    steerLightMotion(
      this.lightMotion,
      this.world.camera,
      this.aspect,
      LIGHT_BULB_RADIUS,
      this.getFloorY(),
      DEFAULT_LIGHT_BOUNDS,
      this.lightMotionConfig.speed,
    );
    integrateLightMotion(this.lightMotion, deltaSeconds);
    const location = enforceLightBounds(
      this.lightMotion,
      this.world.camera,
      this.aspect,
      LIGHT_BULB_RADIUS,
      this.getFloorY(),
      DEFAULT_LIGHT_BOUNDS,
      this.lightMotionConfig.speed,
    );

    light.location[0] = location[0];
    light.location[1] = location[1];
    light.location[2] = location[2];
    syncLightBulb(this.lightBulb, light);
  }

  private getFloorY(): number {
    const plane = this.world.objects.find((object) => object.type === 'plane');
    return plane?.type === 'plane' ? plane.y : -2;
  }

  private tick(timestamp: number): void {
    if (this.lastRenderTime === null) {
      this.lastRenderTime = timestamp;
      this.renderer.render();
    }

    if (timestamp - this.lastRenderTime >= this.motionStepSeconds * 1000) {
      this.updateLight();
      this.renderer.render();
      this.lastRenderTime = timestamp;
    }

    this.animationFrameId = requestAnimationFrame((nextTimestamp) => this.tick(nextTimestamp));
  }
}