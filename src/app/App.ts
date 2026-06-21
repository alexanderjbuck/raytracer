import type { MovementInput } from './input';
import type { GameStatus, GridWorld, PlayerState } from '../world/types';

export interface HelpContent {
  title: string;
  items: readonly string[];
}

export interface AppFrame {
  world: GridWorld | null;
  player: PlayerState | null;
  status: GameStatus;
  statusText: string;
  winMessage?: string;
}

export interface App {
  getHelpContent(): HelpContent;
  start(gameCode: string): void;
  stop(): void;
  update(input: MovementInput, deltaSeconds: number): AppFrame;
  isRunning(): boolean;
}