export interface MovementInput {
  forward: number;
  strafe: number;
  turn: number;
}

export class InputController {
  private readonly keys = new Set<string>();
  private turnInput = 0;
  private pointerLocked = false;
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

  attach(canvas: HTMLCanvasElement): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);

    canvas.addEventListener('click', () => {
      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
      }
    });
  }

  detach(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
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