export class HelpModal {
  private readonly modal: HTMLElement;
  private readonly closeButton: HTMLButtonElement;

  constructor(modalId: string, closeButtonId: string) {
    const modal = document.getElementById(modalId);
    const closeButton = document.getElementById(closeButtonId);
    if (!modal || !(closeButton instanceof HTMLButtonElement)) {
      throw new Error('Help modal elements not found');
    }
    this.modal = modal;
    this.closeButton = closeButton;

    this.closeButton.addEventListener('click', () => this.hide());
    this.modal.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.hide();
      }
    });
  }

  show(): void {
    this.modal.hidden = false;
  }

  hide(): void {
    this.modal.hidden = true;
  }
}