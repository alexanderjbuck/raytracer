import { applyCameraPitch } from '../scene/camera';
import { trace } from '../raytrace/tracer';
import type { Color, RenderConfig, Vec3, World } from '../scene/types';
import { PixelBuffer } from './PixelBuffer';

export class CanvasRenderer {
  private readonly world: World;
  private readonly container: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly displayWidth: number;
  private readonly displayHeight: number;
  private pixelBuffer: PixelBuffer;
  private bufferWidth: number;
  private bufferHeight: number;
  private resolution: number;

  constructor(containerId: string, world: World, config: RenderConfig) {
    this.world = world;
    this.displayWidth = config.width;
    this.displayHeight = config.height;
    this.resolution = config.resolution;

    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element not found: #${containerId}`);
    }
    this.container = container;

    this.bufferWidth = Math.trunc(this.displayWidth * this.resolution);
    this.bufferHeight = Math.trunc(this.displayHeight * this.resolution);

    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.background = '#000';

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'game-screen__canvas';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.width = this.bufferWidth;
    this.canvas.height = this.bufferHeight;
    this.container.appendChild(this.canvas);

    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to acquire 2D canvas context');
    }
    this.context = context;
    this.pixelBuffer = new PixelBuffer(this.bufferWidth, this.bufferHeight);
  }

  getResolution(): number {
    return this.resolution;
  }

  setResolution(resolution: number): void {
    this.resolution = resolution;
    this.bufferWidth = Math.trunc(this.displayWidth * resolution);
    this.bufferHeight = Math.trunc(this.displayHeight * resolution);
    this.canvas.width = this.bufferWidth;
    this.canvas.height = this.bufferHeight;
    this.pixelBuffer = new PixelBuffer(this.bufferWidth, this.bufferHeight);
  }

  render(): void {
    const color: Color = [0, 0, 0];
    const ray: Vec3 = [0, 0, -this.world.camera.depth];
    const fovx = this.world.camera.fovx;
    const fovy = (this.bufferHeight / this.bufferWidth) * fovx;
    const tanfovx = Math.tan(fovx);
    const tanfovy = Math.tan(fovy);
    const cameraPos = this.world.camera.location;
    const pitch = this.world.camera.pitch;

    let pixelIndex = 0;

    for (let v = 0; v < this.bufferHeight; v++) {
      for (let u = 0; u < this.bufferWidth; u++) {
        ray[0] = ((2 * u - this.bufferWidth) / this.bufferWidth) * tanfovx;
        ray[1] = ((2 * (this.bufferHeight - v) - this.bufferHeight) / this.bufferHeight) * tanfovy;
        ray[2] = -this.world.camera.depth;

        trace(cameraPos, applyCameraPitch(ray, pitch), color, this.world);
        this.pixelBuffer.setPixel(pixelIndex, color);
        pixelIndex++;
      }
    }

    this.pixelBuffer.flush();
    this.context.putImageData(this.pixelBuffer.getImageData(), 0, 0);
  }
}