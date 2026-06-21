export interface Rng {
  next(): number;
  int(min: number, max: number): number;
  float(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
}

export function createRng(seed = Date.now()): Rng {
  let state = seed >>> 0;

  return {
    next(): number {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },

    int(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },

    float(min: number, max: number): number {
      return min + this.next() * (max - min);
    },

    pick<T>(items: readonly T[]): T {
      return items[this.int(0, items.length - 1)];
    },
  };
}