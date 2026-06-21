import type { HelpContent } from '../app/App';
import { RayTracerApp } from '../app/RayTracerApp';
import { defaultRenderConfig } from '../scene/defaultScene';
import {
  DEFAULT_RESOLUTION_INDEX,
  RESOLUTION_STEPS,
  clampResolutionIndex,
  formatResolution,
} from '../scene/renderResolution';
import { generateScene } from '../scene/generateScene';
import { HelpModal } from './HelpModal';

const HELP_CONTENT: HelpContent = {
  title: 'Raytracer',
  items: [
    'Press play to render a new scene.',
    'Random spheres, cubes, cones, and cylinders on a colored checkerboard plane.',
    'A small glowing sphere marks the point light as it drifts slowly through the scene.',
    'Use + and − below the render to change resolution.',
  ],
};

export class AppShell {
  private readonly helpModal: HelpModal;
  private readonly overlay: HTMLElement;
  private readonly overlayPlayButton: HTMLButtonElement;
  private readonly playButton: HTMLButtonElement;
  private readonly resolutionDownButton: HTMLButtonElement;
  private readonly resolutionUpButton: HTMLButtonElement;
  private readonly resolutionLabel: HTMLElement;
  private rayTracer: RayTracerApp | null = null;
  private resolutionIndex = DEFAULT_RESOLUTION_INDEX;
  private isPlaying = false;

  constructor() {
    const helpButton = document.getElementById('btn-help');
    const overlay = document.getElementById('screen-overlay');
    const overlayPlayButton = document.getElementById('btn-play-overlay');
    const playButton = document.getElementById('btn-play');
    const resolutionDownButton = document.getElementById('btn-resolution-down');
    const resolutionUpButton = document.getElementById('btn-resolution-up');
    const resolutionLabel = document.getElementById('resolution-label');

    if (
      !(helpButton instanceof HTMLButtonElement) ||
      !(overlay instanceof HTMLElement) ||
      !(overlayPlayButton instanceof HTMLButtonElement) ||
      !(playButton instanceof HTMLButtonElement) ||
      !(resolutionDownButton instanceof HTMLButtonElement) ||
      !(resolutionUpButton instanceof HTMLButtonElement) ||
      !(resolutionLabel instanceof HTMLElement)
    ) {
      throw new Error('App shell elements not found');
    }

    this.overlay = overlay;
    this.overlayPlayButton = overlayPlayButton;
    this.playButton = playButton;
    this.resolutionDownButton = resolutionDownButton;
    this.resolutionUpButton = resolutionUpButton;
    this.resolutionLabel = resolutionLabel;
    this.helpModal = new HelpModal('help-modal', 'help-close', HELP_CONTENT);

    helpButton.addEventListener('click', () => this.helpModal.show());
    this.overlayPlayButton.addEventListener('click', () => this.handlePlay());
    this.playButton.addEventListener('click', () => this.handlePlay());
    this.resolutionDownButton.addEventListener('click', () => this.changeResolution(-1));
    this.resolutionUpButton.addEventListener('click', () => this.changeResolution(1));

    this.updateResolutionControls();
  }

  init(): void {
    this.showOverlay();
    this.setPlaying(false);
  }

  private handlePlay(): void {
    this.helpModal.hide();
    this.hideOverlay();
    this.startScene();
    if (!this.isPlaying) {
      this.setPlaying(true);
    }
  }

  private startScene(): void {
    this.rayTracer?.stop();

    const viewport = document.getElementById('screen');
    if (viewport) {
      viewport.replaceChildren();
    }

    this.rayTracer = new RayTracerApp({
      containerId: 'screen',
      world: generateScene(),
      config: {
        ...defaultRenderConfig,
        resolution: RESOLUTION_STEPS[this.resolutionIndex],
      },
    });
    this.rayTracer.start();
  }

  private changeResolution(delta: number): void {
    const nextIndex = clampResolutionIndex(this.resolutionIndex + delta);
    if (nextIndex === this.resolutionIndex) {
      return;
    }

    this.resolutionIndex = nextIndex;
    this.updateResolutionControls();

    if (this.rayTracer) {
      this.rayTracer.setResolution(RESOLUTION_STEPS[this.resolutionIndex]);
    }
  }

  private updateResolutionControls(): void {
    const resolution = RESOLUTION_STEPS[this.resolutionIndex];
    this.resolutionLabel.textContent = formatResolution(resolution);
    this.resolutionDownButton.disabled = this.resolutionIndex === 0;
    this.resolutionUpButton.disabled = this.resolutionIndex === RESOLUTION_STEPS.length - 1;
  }

  private setPlaying(playing: boolean): void {
    this.isPlaying = playing;
    this.playButton.textContent = playing ? 'New scene' : 'Play';
    this.playButton.setAttribute('aria-label', playing ? 'Generate new scene' : 'Play');
    this.playButton.title = playing ? 'New scene' : 'Play';
  }

  private showOverlay(): void {
    this.overlay.hidden = false;
  }

  private hideOverlay(): void {
    this.overlay.hidden = true;
  }
}