import { castRay, hasLineOfSight } from '../raycast/cast';
import { CellType, type GridWorld, type PlayerState } from '../world/types';
import { PixelBuffer } from './PixelBuffer';

export interface GridRenderConfig {
  width: number;
  height: number;
  resolution: number;
  fov: number;
}

function wallColor(cellType: CellType, side: 0 | 1, distance: number, hasKey: boolean): [number, number, number] {
  const shade = Math.max(0.25, 1 - distance / 18) * (side === 1 ? 0.82 : 1);

  if (cellType === CellType.Exit) {
    if (hasKey) {
      return [40 * shade, 180 * shade, 70 * shade];
    }
    return [120 * shade, 30 * shade, 30 * shade];
  }

  return [95 * shade, 95 * shade, 115 * shade];
}

function drawKeySprite(
  buffer: PixelBuffer,
  bufferWidth: number,
  bufferHeight: number,
  player: PlayerState,
  world: GridWorld,
): void {
  if (player.hasKey) {
    return;
  }

  const keyX = world.keyX + 0.5;
  const keyY = world.keyY + 0.5;
  const dx = keyX - player.x;
  const dy = keyY - player.y;
  const distance = Math.hypot(dx, dy);
  if (distance > 6 || distance < 0.2) {
    return;
  }

  if (!hasLineOfSight(world, player.x, player.y, keyX, keyY)) {
    return;
  }

  const angleToKey = Math.atan2(dy, dx);
  let angleDiff = angleToKey - player.angle;
  while (angleDiff > Math.PI) {
    angleDiff -= Math.PI * 2;
  }
  while (angleDiff < -Math.PI) {
    angleDiff += Math.PI * 2;
  }

  const fov = Math.PI / 3;
  if (Math.abs(angleDiff) > fov * 0.55) {
    return;
  }

  const screenX = Math.floor(((angleDiff / fov) + 0.5) * bufferWidth);
  const spriteHeight = Math.min(bufferHeight * 0.5, Math.floor((bufferHeight * 0.7) / distance));
  const spriteWidth = Math.max(4, Math.floor(spriteHeight * 0.45));
  const startY = Math.floor(bufferHeight / 2 - spriteHeight / 2);

  for (let sy = 0; sy < spriteHeight; sy++) {
    for (let sx = -spriteWidth / 2; sx < spriteWidth / 2; sx++) {
      const x = screenX + Math.floor(sx);
      const y = startY + sy;
      if (x < 0 || y < 0 || x >= bufferWidth || y >= bufferHeight) {
        continue;
      }
      const isRing = Math.abs(sx) > spriteWidth * 0.2;
      const color: [number, number, number] = isRing ? [220, 180, 40] : [255, 220, 70];
      buffer.setPixel(y * bufferWidth + x, color);
    }
  }
}

export class GridRenderer {
  private readonly config: GridRenderConfig;
  private readonly container: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly pixelBuffer: PixelBuffer;
  private readonly bufferWidth: number;
  private readonly bufferHeight: number;

  constructor(containerId: string, config: GridRenderConfig) {
    this.config = config;

    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element not found: #${containerId}`);
    }
    this.container = container;

    this.bufferWidth = Math.trunc(config.width * config.resolution);
    this.bufferHeight = Math.trunc(config.height * config.resolution);

    this.container.style.width = `${config.width}px`;
    this.container.style.height = `${config.height}px`;
    this.container.style.background = '#000';

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = `${config.width}px`;
    this.canvas.style.height = `${config.height}px`;
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

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  render(world: GridWorld, player: PlayerState, message?: string): void {
    const fov = this.config.fov;
    const halfFov = fov / 2;
    const horizon = Math.floor(this.bufferHeight / 2);

    for (let column = 0; column < this.bufferWidth; column++) {
      const cameraX = (2 * column) / this.bufferWidth - 1;
      const rayAngle = player.angle + cameraX * halfFov;
      const hit = castRay(world, player.x, player.y, rayAngle);
      const lineHeight = Math.min(this.bufferHeight, Math.floor(this.bufferHeight / hit.distance));
      const drawStart = Math.max(0, horizon - Math.floor(lineHeight / 2));
      const drawEnd = Math.min(this.bufferHeight - 1, horizon + Math.floor(lineHeight / 2));
      const color = wallColor(hit.cellType, hit.side, hit.distance, player.hasKey);

      for (let row = 0; row < this.bufferHeight; row++) {
        const pixelIndex = row * this.bufferWidth + column;
        if (row <= drawStart) {
          this.pixelBuffer.setPixel(pixelIndex, [20, 20, 28]);
        } else if (row >= drawEnd) {
          this.pixelBuffer.setPixel(pixelIndex, [28, 24, 20]);
        } else {
          this.pixelBuffer.setPixel(pixelIndex, color);
        }
      }
    }

    drawKeySprite(this.pixelBuffer, this.bufferWidth, this.bufferHeight, player, world);
    this.pixelBuffer.flush();
    this.context.putImageData(this.pixelBuffer.getImageData(), 0, 0);

    if (message) {
      this.context.fillStyle = 'rgba(0, 0, 0, 0.55)';
      this.context.fillRect(0, this.bufferHeight - 28, this.bufferWidth, 28);
      this.context.fillStyle = '#f0f0f0';
      this.context.font = '12px system-ui, sans-serif';
      this.context.fillText(message, 8, this.bufferHeight - 10);
    }
  }
}