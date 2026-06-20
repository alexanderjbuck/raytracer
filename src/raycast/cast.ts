import { CellType, type GridWorld } from '../world/types';

export interface RayHit {
  distance: number;
  cellType: CellType;
  side: 0 | 1;
}

function cellAt(world: GridWorld, x: number, y: number): CellType {
  if (x < 0 || y < 0 || x >= world.width || y >= world.height) {
    return CellType.Wall;
  }
  return world.cells[y * world.width + x] as CellType;
}

export function castRay(world: GridWorld, originX: number, originY: number, angle: number): RayHit {
  const rayDirX = Math.cos(angle);
  const rayDirY = Math.sin(angle);

  let mapX = Math.floor(originX);
  let mapY = Math.floor(originY);

  const deltaDistX = Math.abs(1 / (rayDirX || 1e-9));
  const deltaDistY = Math.abs(1 / (rayDirY || 1e-9));

  let stepX = 0;
  let stepY = 0;
  let sideDistX = 0;
  let sideDistY = 0;

  if (rayDirX < 0) {
    stepX = -1;
    sideDistX = (originX - mapX) * deltaDistX;
  } else {
    stepX = 1;
    sideDistX = (mapX + 1 - originX) * deltaDistX;
  }

  if (rayDirY < 0) {
    stepY = -1;
    sideDistY = (originY - mapY) * deltaDistY;
  } else {
    stepY = 1;
    sideDistY = (mapY + 1 - originY) * deltaDistY;
  }

  let side: 0 | 1 = 0;

  for (let step = 0; step < 128; step++) {
    if (sideDistX < sideDistY) {
      sideDistX += deltaDistX;
      mapX += stepX;
      side = 0;
    } else {
      sideDistY += deltaDistY;
      mapY += stepY;
      side = 1;
    }

    const cell = cellAt(world, mapX, mapY);
    if (cell === CellType.Wall || cell === CellType.Exit) {
      const perpWallDist =
        side === 0
          ? (mapX - originX + (1 - stepX) / 2) / (rayDirX || 1e-9)
          : (mapY - originY + (1 - stepY) / 2) / (rayDirY || 1e-9);

      return {
        distance: Math.max(0.0001, Math.abs(perpWallDist)),
        cellType: cell,
        side,
      };
    }
  }

  return { distance: 32, cellType: CellType.Wall, side };
}