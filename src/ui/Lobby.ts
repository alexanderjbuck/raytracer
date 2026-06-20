import { generateGameCode } from '../util/randomCode';

export interface LobbyHandlers {
  onPlay: (gameCode: string) => void;
  onHelp: () => void;
}

export class Lobby {
  private readonly root: HTMLElement;
  private readonly input: HTMLInputElement;
  private readonly randomButton: HTMLButtonElement;
  private readonly playButton: HTMLButtonElement;
  private readonly helpButton: HTMLButtonElement;

  constructor(rootId: string, handlers: LobbyHandlers) {
    const root = document.getElementById(rootId);
    const input = document.getElementById('game-code');
    const randomButton = document.getElementById('btn-random');
    const playButton = document.getElementById('btn-play');
    const helpButton = document.getElementById('btn-help');

    if (
      !root ||
      !(input instanceof HTMLInputElement) ||
      !(randomButton instanceof HTMLButtonElement) ||
      !(playButton instanceof HTMLButtonElement) ||
      !(helpButton instanceof HTMLButtonElement)
    ) {
      throw new Error('Lobby elements not found');
    }

    this.root = root;
    this.input = input;
    this.randomButton = randomButton;
    this.playButton = playButton;
    this.helpButton = helpButton;

    this.randomButton.addEventListener('click', () => {
      this.input.value = generateGameCode();
    });

    this.playButton.addEventListener('click', () => {
      const code = this.input.value.trim().toUpperCase();
      if (code.length === 0) {
        this.input.value = generateGameCode();
        handlers.onPlay(this.input.value);
        return;
      }
      handlers.onPlay(code);
    });

    this.helpButton.addEventListener('click', handlers.onHelp);

    this.input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.playButton.click();
      }
    });

    if (this.input.value.trim().length === 0) {
      this.input.value = generateGameCode();
    }
  }

  show(): void {
    this.root.hidden = false;
  }

  hide(): void {
    this.root.hidden = true;
  }
}