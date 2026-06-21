import { describe, expect, it } from 'vitest';
import { CellType, type GridWorld } from '../world/types';
import { hasLineOfSight } from './cast';

function makeWorld(cells: number[][]): GridWorld {
  const height = cells.length;
  const width = cells[0].length;
  const flat = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      flat[y * width + x] = cells[y][x];
    }
  }
  return {
    width,
    height,
    cells: flat,
    startX: 0,
    startY: 0,
    keyX: 0,
    keyY: 0,
    exitX: 0,
    exitY: 0,
  };
}

describe('hasLineOfSight', () => {
  it('returns true when no wall blocks the path', () => {
    const world = makeWorld([
      [CellType.Floor, CellType.Floor, CellType.Floor],
      [CellType.Floor, CellType.Floor, CellType.Floor],
      [CellType.Floor, CellType.Floor, CellType.Floor],
    ]);

    expect(hasLineOfSight(world, 0.5, 0.5, 2.5, 2.5)).toBe(true);
  });

  it('returns false when a wall blocks the path', () => {
    const world = makeWorld([
      [CellType.Floor, CellType.Wall, CellType.Floor],
      [CellType.Floor, CellType.Floor, CellType.Floor],
      [CellType.Floor, CellType.Floor, CellType.Floor],
    ]);

    expect(hasLineOfSight(world, 0.5, 0.5, 2.5, 0.5)).toBe(false);
  });
});