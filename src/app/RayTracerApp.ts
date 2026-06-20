import { CanvasRenderer } from '../renderer/CanvasRenderer';
import { defaultRenderConfig, defaultScene } from '../scene/defaultScene';
import type { RenderConfig, World } from '../scene/types';

export interface RayTracerAppOptions {
  containerId: string;
  world?: World;
  config?: RenderConfig;
}

export class RayTracerApp {
  private readonly renderer: CanvasRenderer;
  private readonly frameIntervalMs: number;
  private animationFrameId: number | null = null;
  private lastFrameTime: number | null = null;

  constructor(options: RayTracerAppOptions) {
    const world = options.world ?? defaultScene;
    const config = options.config ?? defaultRenderConfig;

    this.renderer = new CanvasRenderer(options.containerId, world, config);
    this.frameIntervalMs = config.frameIntervalMs;
  }

  start(): void {
    this.stop();
    this.lastFrameTime = null;
    this.animationFrameId = requestAnimationFrame((timestamp) => this.tick(timestamp));
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private tick(timestamp: number): void {
    if (this.lastFrameTime === null || timestamp - this.lastFrameTime >= this.frameIntervalMs) {
      this.renderer.render();
      this.lastFrameTime = timestamp;
    }

    this.animationFrameId = requestAnimationFrame((nextTimestamp) => this.tick(nextTimestamp));
  }
}