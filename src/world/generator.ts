import type { Rng } from '../util/seededRandom';
import { createRng } from '../util/seededRandom';
import { getReachableFloors } from './reachability';
import { CellType, GRID_SIZE, type GridWorld } from './types';

interface Room {
  x: number;
  y: number;
  w: number;
  h: number;
}

function cellIndex(width: number, x: number, y: number): number {
  return y * width + x;
}

function carveRoom(cells: Uint8Array, width: number, room: Room): void {
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      cells[cellIndex(width, x, y)] = CellType.Floor;
    }
  }
}

function roomsOverlap(a: Room, b: Room, padding: number): boolean {
  return (
    a.x - padding < b.x + b.w &&
    a.x + a.w + padding > b.x &&
    a.y - padding < b.y + b.h &&
    a.y + a.h + padding > b.y
  );
}

function connectRooms(cells: Uint8Array, width: number, a: Room, b: Room): void {
  let x = Math.floor(a.x + a.w / 2);
  let y = Math.floor(a.y + a.h / 2);
  const targetX = Math.floor(b.x + b.w / 2);
  const targetY = Math.floor(b.y + b.h / 2);

  while (x !== targetX) {
    cells[cellIndex(width, x, y)] = CellType.Floor;
    x += x < targetX ? 1 : -1;
  }

  while (y !== targetY) {
    cells[cellIndex(width, x, y)] = CellType.Floor;
    y += y < targetY ? 1 : -1;
  }

  cells[cellIndex(width, x, y)] = CellType.Floor;
}

function carveMaze(cells: Uint8Array, width: number, height: number, rng: Rng): Room[] {
  const rooms: Room[] = [];

  for (let attempt = 0; attempt < 48; attempt++) {
    const room: Room = {
      x: rng.int(1, width - 12),
      y: rng.int(1, height - 12),
      w: rng.int(4, 11),
      h: rng.int(4, 11),
    };

    if (room.x + room.w >= width - 1 || room.y + room.h >= height - 1) {
      continue;
    }

    if (rooms.some((existing) => roomsOverlap(existing, room, 2))) {
      continue;
    }

    carveRoom(cells, width, room);
    rooms.push(room);
  }

  if (rooms.length === 0) {
    const fallback: Room = { x: 26, y: 26, w: 12, h: 12 };
    carveRoom(cells, width, fallback);
    rooms.push(fallback);
  }

  rooms.sort((a, b) => a.x - b.x || a.y - b.y);
  for (let i = 1; i < rooms.length; i++) {
    connectRooms(cells, width, rooms[i - 1], rooms[i]);
  }

  if (rooms.length > 2) {
    connectRooms(cells, width, rooms[0], rooms[rng.int(1, rooms.length - 1)]);
  }

  return rooms;
}

function listFloorCells(world: GridWorld): Array<{ x: number; y: number }> {
  const floors: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < world.height; y++) {
    for (let x = 0; x < world.width; x++) {
      if (world.cells[cellIndex(world.width, x, y)] === CellType.Floor) {
        floors.push({ x, y });
      }
    }
  }
  return floors;
}

function placeExit(
  cells: Uint8Array,
  width: number,
  height: number,
  reachable: Set<number>,
  rng: Rng,
): { exitX: number; exitY: number } | null {
  const candidates: Array<{ exitX: number; exitY: number; innerX: number; innerY: number }> = [];

  for (let x = 1; x < width - 1; x++) {
    const northInner = cellIndex(width, x, 1);
    const southInner = cellIndex(width, x, height - 2);
    if (reachable.has(northInner)) {
      candidates.push({ exitX: x, exitY: 0, innerX: x, innerY: 1 });
    }
    if (reachable.has(southInner)) {
      candidates.push({ exitX: x, exitY: height - 1, innerX: x, innerY: height - 2 });
    }
  }

  for (let y = 1; y < height - 1; y++) {
    const westInner = cellIndex(width, 1, y);
    const eastInner = cellIndex(width, width - 2, y);
    if (reachable.has(westInner)) {
      candidates.push({ exitX: 0, exitY: y, innerX: 1, innerY: y });
    }
    if (reachable.has(eastInner)) {
      candidates.push({ exitX: width - 1, exitY: y, innerX: width - 2, innerY: y });
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  const chosen = rng.pick(candidates);
  cells[cellIndex(width, chosen.exitX, chosen.exitY)] = CellType.Exit;
  return { exitX: chosen.exitX, exitY: chosen.exitY };
}

function carveCorridorToBorder(
  cells: Uint8Array,
  width: number,
  height: number,
  reachable: Set<number>,
  rng: Rng,
): { exitX: number; exitY: number } {
  const floors = [...reachable].map((index) => ({
    x: index % width,
    y: Math.floor(index / width),
  }));

  const anchor = rng.pick(floors);
  const options = [
    { exitX: anchor.x, exitY: 0, stepX: 0, stepY: -1 },
    { exitX: anchor.x, exitY: height - 1, stepX: 0, stepY: 1 },
    { exitX: 0, exitY: anchor.y, stepX: -1, stepY: 0 },
    { exitX: width - 1, exitY: anchor.y, stepX: 1, stepY: 0 },
  ];

  const route = rng.pick(options);
  let x = anchor.x;
  let y = anchor.y;

  while (x !== route.exitX || y !== route.exitY) {
    cells[cellIndex(width, x, y)] = CellType.Floor;
    if (x !== route.exitX) {
      x += route.stepX;
    } else {
      y += route.stepY;
    }
  }

  cells[cellIndex(width, route.exitX, route.exitY)] = CellType.Exit;
  return { exitX: route.exitX, exitY: route.exitY };
}

export function generateWorld(seed: string, size = GRID_SIZE): GridWorld {
  const rng = createRng(seed);
  const width = size;
  const height = size;
  const cells = new Uint8Array(width * height).fill(CellType.Wall);

  carveMaze(cells, width, height, rng);

  const floors = listFloorCells({ width, height, cells, startX: 0, startY: 0, keyX: 0, keyY: 0, exitX: 0, exitY: 0 });
  const start = rng.pick(floors);
  const reachable = getReachableFloors(
    { width, height, cells, startX: start.x, startY: start.y, keyX: 0, keyY: 0, exitX: 0, exitY: 0 },
    start.x,
    start.y,
  );

  const reachableFloors = floors.filter((floor) => reachable.has(cellIndex(width, floor.x, floor.y)));
  const keyCandidates = reachableFloors.filter((floor) => floor.x !== start.x || floor.y !== start.y);
  const key = keyCandidates.length > 0 ? rng.pick(keyCandidates) : start;

  const exit = placeExit(cells, width, height, reachable, rng) ?? carveCorridorToBorder(cells, width, height, reachable, rng);

  return {
    width,
    height,
    cells,
    startX: start.x,
    startY: start.y,
    keyX: key.x,
    keyY: key.y,
    exitX: exit.exitX,
    exitY: exit.exitY,
  };
}