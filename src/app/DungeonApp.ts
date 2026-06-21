import { createPlayer, updatePlayer } from '../game/Player';
import { generateWorld } from '../world/generator';
import type { GameStatus, GridWorld, PlayerState } from '../world/types';
import type { App, AppFrame, HelpContent } from './App';
import type { MovementInput } from './input';

const HELP_CONTENT: HelpContent = {
  title: 'How to play',
  items: [
    'Press play to enter a randomly generated dungeon.',
    'Explore the 64×64 maze of rooms and corridors from a first-person view.',
    'Find the key somewhere in the reachable maze.',
    'Reach the exit on the outer wall. It stays locked until you have the key.',
    'Move with WASD or arrow keys. Tap the game view to capture the mouse and look around.',
  ],
};

const WIN_MESSAGE = 'Congratulations! You escaped the dungeon.';

export class DungeonApp implements App {
  private world: GridWorld | null = null;
  private player: PlayerState | null = null;
  private status: GameStatus = 'playing';

  getHelpContent(): HelpContent {
    return HELP_CONTENT;
  }

  start(gameCode: string): void {
    this.world = generateWorld(gameCode);
    this.player = createPlayer(this.world);
    this.status = 'playing';
  }

  stop(): void {
    this.world = null;
    this.player = null;
    this.status = 'playing';
  }

  update(input: MovementInput, deltaSeconds: number): AppFrame {
    if (!this.world || !this.player) {
      return {
        world: null,
        player: null,
        status: 'playing',
        statusText: '',
      };
    }

    if (this.status === 'playing') {
      this.status = updatePlayer(this.world, this.player, input, deltaSeconds);
    }

    return {
      world: this.world,
      player: this.player,
      status: this.status,
      statusText: this.buildStatusText(this.player),
      winMessage: this.status === 'won' ? WIN_MESSAGE : undefined,
    };
  }

  isRunning(): boolean {
    return this.world !== null && this.player !== null;
  }

  private buildStatusText(player: PlayerState): string {
    const keyText = player.hasKey ? 'Key: collected' : 'Key: not found';
    const exitText = player.hasKey ? 'Exit: unlocked' : 'Exit: locked';
    return `${keyText} | ${exitText} | Tap view to capture mouse`;
  }
}