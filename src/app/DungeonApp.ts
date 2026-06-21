import { createPlayer, updatePlayer } from '../game/Player';
import { InputController } from '../game/InputController';
import { GridRenderer } from '../renderer/GridRenderer';
import { HelpModal } from '../ui/HelpModal';
import { Lobby } from '../ui/Lobby';
import { generateWorld } from '../world/generator';
import type { GameStatus, GridWorld, PlayerState } from '../world/types';

const RENDER_CONFIG = {
  width: 640,
  height: 400,
  resolution: 0.75,
  fov: Math.PI / 3,
};

export class DungeonApp {
  private readonly lobby: Lobby;
  private readonly helpModal: HelpModal;
  private readonly gamePanel: HTMLElement;
  private readonly statusBar: HTMLElement;
  private readonly renderer: GridRenderer;
  private readonly input = new InputController();

  private world: GridWorld | null = null;
  private player: PlayerState | null = null;
  private status: GameStatus = 'playing';
  private animationFrameId: number | null = null;
  private lastFrameTime: number | null = null;

  constructor() {
    const gamePanel = document.getElementById('game-panel');
    const statusBar = document.getElementById('status-bar');
    if (!gamePanel || !statusBar) {
      throw new Error('Game panel elements not found');
    }

    this.gamePanel = gamePanel;
    this.statusBar = statusBar;
    this.renderer = new GridRenderer('screen', RENDER_CONFIG);
    this.helpModal = new HelpModal('help-modal', 'help-close');

    const helpButton = document.getElementById('btn-help');
    if (!(helpButton instanceof HTMLButtonElement)) {
      throw new Error('Help button not found');
    }
    helpButton.addEventListener('click', () => this.helpModal.show());

    this.lobby = new Lobby('lobby', {
      onPlay: (gameCode) => this.startGame(gameCode),
    });
  }

  init(): void {
    this.lobby.show();
    this.gamePanel.hidden = true;
  }

  private startGame(gameCode: string): void {
    this.world = generateWorld(gameCode);
    this.player = createPlayer(this.world);
    this.status = 'playing';
    this.lastFrameTime = null;

    this.lobby.hide();
    this.helpModal.hide();
    this.gamePanel.hidden = false;
    this.updateStatusBar();

    this.input.attach(this.renderer.getCanvas());
    this.stopLoop();
    this.animationFrameId = requestAnimationFrame((timestamp) => this.tick(timestamp));
  }

  private updateStatusBar(): void {
    if (!this.player) {
      return;
    }

    const keyText = this.player.hasKey ? 'Key: collected' : 'Key: not found';
    const exitText = this.player.hasKey ? 'Exit: unlocked' : 'Exit: locked';
    this.statusBar.textContent = `${keyText} | ${exitText} | Click view to capture mouse`;
  }

  private stopLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private tick(timestamp: number): void {
    if (!this.world || !this.player) {
      return;
    }

    const deltaSeconds =
      this.lastFrameTime === null ? 0 : Math.min(0.05, (timestamp - this.lastFrameTime) / 1000);
    this.lastFrameTime = timestamp;

    if (this.status === 'playing') {
      const movement = this.input.getMovementInput();
      this.status = updatePlayer(this.world, this.player, movement, deltaSeconds);
      this.updateStatusBar();
    }

    const message =
      this.status === 'won'
        ? 'You escaped! Refresh or pick a new game code to play again.'
        : undefined;

    this.renderer.render(this.world, this.player, message);
    this.animationFrameId = requestAnimationFrame((nextTimestamp) => this.tick(nextTimestamp));
  }
}