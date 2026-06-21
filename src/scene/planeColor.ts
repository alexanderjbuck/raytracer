import type { Color } from './types';

function cellHash(cellX: number, cellZ: number, salt: number): number {
  const n = Math.sin(cellX * 12.9898 + cellZ * 78.233 + salt) * 43758.5453;
  return n - Math.floor(n);
}

export function planeCellColor(x: number, z: number): Color {
  const cellX = Math.floor(x);
  const cellZ = Math.floor(z);
  const r = Math.floor(70 + cellHash(cellX, cellZ, 0) * 185);
  const g = Math.floor(70 + cellHash(cellX, cellZ, 17) * 185);
  const b = Math.floor(70 + cellHash(cellX, cellZ, 31) * 185);
  return [r, g, b];
}