import { describe, expect, it } from 'vitest';
import { getReachableFloors } from './reachability';
import { generateWorld } from './generator';
import { CellType, GRID_SIZE } from './types';

describe('generateWorld', () => {
  it('produces the same layout for the same seed', () => {
    const a = generateWorld('TEST12');
    const b = generateWorld('TEST12');
    expect(Array.from(a.cells)).toEqual(Array.from(b.cells));
    expect(a.startX).toBe(b.startX);
    expect(a.keyX).toBe(b.keyX);
    expect(a.exitX).toBe(b.exitX);
  });

  it('creates a 64x64 world with reachable key and exit', () => {
    const world = generateWorld('DUNGEON');
    expect(world.width).toBe(GRID_SIZE);
    expect(world.height).toBe(GRID_SIZE);
    expect(world.cells[world.startY * world.width + world.startX]).toBe(CellType.Floor);
    expect(world.cells[world.exitY * world.width + world.exitX]).toBe(CellType.Exit);

    const reachable = getReachableFloors(world, world.startX, world.startY);
    expect(reachable.has(world.keyY * world.width + world.keyX)).toBe(true);
  });
});