export const GRID_SIZE = 64;

export enum CellType {
  Floor = 0,
  Wall = 1,
  Exit = 2,
}

export interface GridWorld {
  width: number;
  height: number;
  cells: Uint8Array;
  startX: number;
  startY: number;
  keyX: number;
  keyY: number;
  exitX: number;
  exitY: number;
}

export interface PlayerState {
  x: number;
  y: number;
  angle: number;
  hasKey: boolean;
}

export type GameStatus = 'playing' | 'won';