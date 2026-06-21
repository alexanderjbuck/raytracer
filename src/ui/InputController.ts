import type { MovementInput } from '../app/input';

export class InputController {
  private readonly keys = new Set<string>();
  private turnInput = 0;
  private pointerLocked = false;
  private canvas: HTMLCanvasElement | null = null;

  private readonly onKeyDown = (event: KeyboardEvent) => {
    this.keys.add(event.code);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
  };
  private readonly onKeyUp = (event: KeyboardEvent) => {
    this.keys.delete(event.code);
  };
  private readonly onMouseMove = (event: MouseEvent) => {
    if (!this.pointerLocked) {
      return;
    }
    this.turnInput += event.movementX * 0.003;
  };
  private readonly onPointerLockChange = () => {
    this.pointerLocked = document.pointerLockElement !== null;
  };
  private readonly onBlur = () => {
    this.reset();
  };
  private readonly onCanvasClick = () => {
    if (this.canvas && document.pointerLockElement !== this.canvas) {
      this.canvas.requestPointerLock();
    }
  };

  attach(canvas: HTMLCanvasElement): void {
    this.detach();
    this.reset();
    this.canvas = canvas;

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('blur', this.onBlur);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    canvas.addEventListener('click', this.onCanvasClick);
  }

  detach(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('blur', this.onBlur);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);

    if (this.canvas) {
      this.canvas.removeEventListener('click', this.onCanvasClick);
      this.canvas = null;
    }

    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    this.reset();
  }

  reset(): void {
    this.keys.clear();
    this.turnInput = 0;
    this.pointerLocked = false;
  }

  getMovementInput(): MovementInput {
    let forward = 0;
    let strafe = 0;
    let turn = 0;

    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) {
      forward += 1;
    }
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) {
      forward -= 1;
    }
    if (this.keys.has('KeyA')) {
      strafe -= 1;
    }
    if (this.keys.has('KeyD')) {
      strafe += 1;
    }
    if (this.keys.has('ArrowLeft')) {
      turn -= 1;
    }
    if (this.keys.has('ArrowRight')) {
      turn += 1;
    }

    turn += this.turnInput;
    this.turnInput = 0;

    return { forward, strafe, turn };
  }
}