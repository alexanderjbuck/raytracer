import { CellType, type GridWorld } from './types';

export function getReachableFloors(world: GridWorld, fromX: number, fromY: number): Set<number> {
  const reachable = new Set<number>();
  const startIndex = fromY * world.width + fromX;
  const queue = [startIndex];
  reachable.add(startIndex);

  while (queue.length > 0) {
    const index = queue.pop()!;
    const x = index % world.width;
    const y = Math.floor(index / world.width);

    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= world.width || ny >= world.height) {
        continue;
      }

      const nextIndex = ny * world.width + nx;
      if (reachable.has(nextIndex)) {
        continue;
      }

      if (world.cells[nextIndex] === CellType.Floor) {
        reachable.add(nextIndex);
        queue.push(nextIndex);
      }
    }
  }

  return reachable;
}

export function isFloorReachable(world: GridWorld, fromX: number, fromY: number, toX: number, toY: number): boolean {
  return getReachableFloors(world, fromX, fromY).has(toY * world.width + toX);
}