import type { App } from '../app/App';
import { generateGameCode } from '../util/randomCode';
import { GridRenderer } from '../renderer/GridRenderer';
import { InputController } from './InputController';
import { HelpModal } from './HelpModal';

const RENDER_CONFIG = {
  width: 640,
  height: 400,
  resolution: 0.75,
  fov: Math.PI / 3,
};

const NO_INPUT = { forward: 0, strafe: 0, turn: 0 };

type ShellPhase = 'idle' | 'playing' | 'won';

export class AppShell {
  private readonly app: App;
  private readonly helpModal: HelpModal;
  private readonly statusBar: HTMLElement;
  private readonly overlay: HTMLElement;
  private readonly overlayMessage: HTMLElement;
  private readonly playButton: HTMLButtonElement;
  private readonly renderer: GridRenderer;
  private readonly input = new InputController();

  private phase: ShellPhase = 'idle';
  private animationFrameId: number | null = null;
  private lastFrameTime: number | null = null;

  constructor(app: App) {
    this.app = app;

    const statusBar = document.getElementById('status-bar');
    const helpButton = document.getElementById('btn-help');
    const overlay = document.getElementById('screen-overlay');
    const overlayMessage = document.getElementById('overlay-message');
    const playButton = document.getElementById('btn-play');

    if (
      !statusBar ||
      !(helpButton instanceof HTMLButtonElement) ||
      !(overlay instanceof HTMLElement) ||
      !(overlayMessage instanceof HTMLElement) ||
      !(playButton instanceof HTMLButtonElement)
    ) {
      throw new Error('App shell elements not found');
    }

    this.statusBar = statusBar;
    this.overlay = overlay;
    this.overlayMessage = overlayMessage;
    this.playButton = playButton;
    this.renderer = new GridRenderer('screen', RENDER_CONFIG);
    this.helpModal = new HelpModal('help-modal', 'help-close', app.getHelpContent());

    helpButton.addEventListener('click', () => this.helpModal.show());
    this.playButton.addEventListener('click', () => this.handlePlay());
  }

  init(): void {
    this.input.detach();
    this.phase = 'idle';
    this.lastFrameTime = null;
    this.statusBar.hidden = true;
    this.showOverlay();
    this.renderer.renderClear();
    this.startLoop();
  }

  private handlePlay(): void {
    this.helpModal.hide();
    this.input.detach();
    this.app.stop();
    this.app.start(generateGameCode());
    this.phase = 'playing';
    this.lastFrameTime = null;
    this.statusBar.hidden = false;
    this.hideOverlay();
    this.input.attach(this.renderer.getCanvas());
  }

  private showOverlay(message?: string): void {
    if (message) {
      this.overlayMessage.textContent = message;
      this.overlayMessage.hidden = false;
    } else {
      this.overlayMessage.textContent = '';
      this.overlayMessage.hidden = true;
    }
    this.overlay.hidden = false;
  }

  private hideOverlay(): void {
    this.overlay.hidden = true;
    this.overlayMessage.hidden = true;
  }

  private startLoop(): void {
    this.stopLoop();
    this.animationFrameId = requestAnimationFrame((timestamp) => this.tick(timestamp));
  }

  private stopLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private tick(timestamp: number): void {
    const deltaSeconds =
      this.lastFrameTime === null ? 0 : Math.min(0.05, (timestamp - this.lastFrameTime) / 1000);
    this.lastFrameTime = timestamp;

    if (this.phase === 'idle') {
      this.renderer.renderClear();
    } else if (this.app.isRunning()) {
      const movement = this.phase === 'playing' ? this.input.getMovementInput() : NO_INPUT;
      const frame = this.app.update(movement, deltaSeconds);

      if (frame.world && frame.player) {
        this.renderer.render(frame.world, frame.player);
      }

      if (this.phase === 'playing') {
        this.statusBar.textContent = frame.statusText;

        if (frame.status === 'won') {
          this.phase = 'won';
          this.input.detach();
          this.lastFrameTime = null;
          this.showOverlay(frame.winMessage);
        }
      }
    }

    this.animationFrameId = requestAnimationFrame((nextTimestamp) => this.tick(nextTimestamp));
  }
}