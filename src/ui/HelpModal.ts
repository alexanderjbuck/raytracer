import type { HelpContent } from '../app/App';

export class HelpModal {
  private readonly dialog: HTMLDialogElement;
  private readonly panel: HTMLElement;
  private readonly title: HTMLElement;
  private readonly list: HTMLUListElement;
  private readonly closeButton: HTMLButtonElement;

  constructor(dialogId: string, closeButtonId: string, content: HelpContent) {
    const dialog = document.getElementById(dialogId);
    const closeButton = document.getElementById(closeButtonId);
    const title = document.getElementById('help-title');
    const list = document.getElementById('help-list');

    if (
      !(dialog instanceof HTMLDialogElement) ||
      !(closeButton instanceof HTMLButtonElement) ||
      !(title instanceof HTMLElement) ||
      !(list instanceof HTMLUListElement)
    ) {
      throw new Error('Help modal elements not found');
    }

    const panel = dialog.querySelector('.modal__panel');
    if (!(panel instanceof HTMLElement)) {
      throw new Error('Help modal panel not found');
    }

    this.dialog = dialog;
    this.panel = panel;
    this.title = title;
    this.list = list;
    this.closeButton = closeButton;

    this.setContent(content);

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

  setContent(content: HelpContent): void {
    this.title.textContent = content.title;
    this.list.replaceChildren(
      ...content.items.map((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        return li;
      }),
    );
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