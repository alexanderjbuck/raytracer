export class HelpModal {
  private readonly dialog: HTMLDialogElement;
  private readonly panel: HTMLElement;
  private readonly closeButton: HTMLButtonElement;

  constructor(dialogId: string, closeButtonId: string) {
    const dialog = document.getElementById(dialogId);
    const closeButton = document.getElementById(closeButtonId);
    if (!(dialog instanceof HTMLDialogElement) || !(closeButton instanceof HTMLButtonElement)) {
      throw new Error('Help modal elements not found');
    }

    const panel = dialog.querySelector('.modal__panel');
    if (!(panel instanceof HTMLElement)) {
      throw new Error('Help modal panel not found');
    }

    this.dialog = dialog;
    this.panel = panel;
    this.closeButton = closeButton;

    this.closeButton.addEventListener('click', () => this.hide());
    this.dialog.addEventListener('click', (event) => {
      if (!this.isOpen()) {
        return;
      }

      const rect = this.panel.getBoundingClientRect();
      const insidePanel =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!insidePanel) {
        this.hide();
      }
    });
  }

  show(): void {
    if (!this.dialog.open) {
      this.dialog.showModal();
    }
  }

  hide(): void {
    if (this.dialog.open) {
      this.dialog.close();
    }
  }

  private isOpen(): boolean {
    return this.dialog.open;
  }
}