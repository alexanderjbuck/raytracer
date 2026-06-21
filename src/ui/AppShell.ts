import type { HelpContent } from '../app/App';
import { RayTracerApp } from '../app/RayTracerApp';
import { generateScene } from '../scene/generateScene';
import { HelpModal } from './HelpModal';

const HELP_CONTENT: HelpContent = {
  title: 'Raytracer',
  items: [
    'Press play to render a new scene.',
    'Random spheres, cubes, cones, and cylinders on a colored checkerboard plane.',
  ],
};

export class AppShell {
  private readonly helpModal: HelpModal;
  private readonly overlay: HTMLElement;
  private readonly playButton: HTMLButtonElement;
  private rayTracer: RayTracerApp | null = null;

  constructor() {
    const helpButton = document.getElementById('btn-help');
    const overlay = document.getElementById('screen-overlay');
    const playButton = document.getElementById('btn-play');

    if (
      !(helpButton instanceof HTMLButtonElement) ||
      !(overlay instanceof HTMLElement) ||
      !(playButton instanceof HTMLButtonElement)
    ) {
      throw new Error('App shell elements not found');
    }

    this.overlay = overlay;
    this.playButton = playButton;
    this.helpModal = new HelpModal('help-modal', 'help-close', HELP_CONTENT);

    helpButton.addEventListener('click', () => this.helpModal.show());
    this.playButton.addEventListener('click', () => this.handlePlay());
  }

  init(): void {
    this.showOverlay();
  }

  private handlePlay(): void {
    this.helpModal.hide();
    this.hideOverlay();

    this.rayTracer?.stop();

    const viewport = document.getElementById('screen');
    if (viewport) {
      viewport.replaceChildren();
    }

    this.rayTracer = new RayTracerApp({
      containerId: 'screen',
      world: generateScene(),
    });
    this.rayTracer.start();
  }

  private showOverlay(): void {
    this.overlay.hidden = false;
  }

  private hideOverlay(): void {
    this.overlay.hidden = true;
  }
}