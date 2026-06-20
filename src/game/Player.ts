import { CellType, type GameStatus, type GridWorld, type PlayerState } from '../world/types';

const MOVE_SPEED = 2.8;
const ROTATE_SPEED = 2.4;
const PLAYER_RADIUS = 0.18;

export function createPlayer(world: GridWorld): PlayerState {
  return {
    x: world.startX + 0.5,
    y: world.startY + 0.5,
    angle: 0,
    hasKey: false,
  };
}

function isBlockingCell(cellType: CellType, hasKey: boolean): boolean {
  if (cellType === CellType.Floor) {
    return false;
  }
  if (cellType === CellType.Exit) {
    return !hasKey;
  }
  return true;
}

function collides(world: GridWorld, x: number, y: number, hasKey: boolean): boolean {
  const corners = [
    [x - PLAYER_RADIUS, y - PLAYER_RADIUS],
    [x + PLAYER_RADIUS, y - PLAYER_RADIUS],
    [x - PLAYER_RADIUS, y + PLAYER_RADIUS],
    [x + PLAYER_RADIUS, y + PLAYER_RADIUS],
  ] as const;

  for (const [cx, cy] of corners) {
    const mapX = Math.floor(cx);
    const mapY = Math.floor(cy);
    if (mapX < 0 || mapY < 0 || mapX >= world.width || mapY >= world.height) {
      return true;
    }
    const cell = world.cells[mapY * world.width + mapX] as CellType;
    if (isBlockingCell(cell, hasKey)) {
      return true;
    }
  }

  return false;
}

function tryMove(world: GridWorld, player: PlayerState, dx: number, dy: number): GameStatus {
  const nextX = player.x + dx;
  const nextY = player.y + dy;

  if (!collides(world, nextX, player.y, player.hasKey)) {
    player.x = nextX;
  }
  if (!collides(world, player.x, nextY, player.hasKey)) {
    player.y = nextY;
  }

  const cellX = Math.floor(player.x);
  const cellY = Math.floor(player.y);
  const cell = world.cells[cellY * world.width + cellX] as CellType;
  if (cell === CellType.Exit && player.hasKey) {
    return 'won';
  }

  return 'playing';
}

export function updatePlayer(
  world: GridWorld,
  player: PlayerState,
  input: { forward: number; strafe: number; turn: number },
  deltaSeconds: number,
): GameStatus {
  const moveStep = MOVE_SPEED * deltaSeconds;
  const rotateStep = ROTATE_SPEED * deltaSeconds;

  player.angle += input.turn * rotateStep;

  const sin = Math.sin(player.angle);
  const cos = Math.cos(player.angle);
  const dx = (cos * input.forward + -sin * input.strafe) * moveStep;
  const dy = (sin * input.forward + cos * input.strafe) * moveStep;

  const status = tryMove(world, player, dx, dy);

  if (!player.hasKey) {
    const keyDistance = Math.hypot(player.x - (world.keyX + 0.5), player.y - (world.keyY + 0.5));
    if (keyDistance < 0.45) {
      player.hasKey = true;
    }
  }

  return status;
}