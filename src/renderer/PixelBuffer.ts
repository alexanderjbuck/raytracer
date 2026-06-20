import type { Color } from '../scene/types';

export class PixelBuffer {
  readonly width: number;
  readonly height: number;
  private readonly imageData: ImageData;
  private readonly imageBytes: Uint8ClampedArray;
  private readonly buffer: ArrayBuffer;
  private readonly buf8: Uint8ClampedArray;
  private readonly data: Uint32Array;
  private readonly littleEndian: boolean;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.imageData = new ImageData(width, height);
    this.imageBytes = this.imageData.data;
    this.buffer = new ArrayBuffer(this.imageBytes.length);
    this.buf8 = new Uint8ClampedArray(this.buffer);
    this.data = new Uint32Array(this.buffer);
    this.littleEndian = detectLittleEndian(this.data, this.buffer);
  }

  getImageData(): ImageData {
    return this.imageData;
  }

  setPixel(index: number, color: Color): void {
    const r = color[0];
    const g = color[1];
    const b = color[2];

    if (this.littleEndian) {
      this.data[index] = (255 << 24) | (b << 16) | (g << 8) | r;
    } else {
      this.data[index] = (r << 24) | (g << 16) | (b << 8) | 255;
    }
  }

  flush(): void {
    this.imageBytes.set(this.buf8);
  }
}

function detectLittleEndian(data: Uint32Array, buffer: ArrayBuffer): boolean {
  data[1] = 0x0a0b0c0d;
  const bytes = new Uint8Array(buffer);
  return !(bytes[4] === 0x0a && bytes[5] === 0x0b && bytes[6] === 0x0c && bytes[7] === 0x0d);
}