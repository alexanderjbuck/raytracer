import { describe, expect, it } from 'vitest';
import { planeCellColor } from './planeColor';

describe('planeCellColor', () => {
  it('returns stable colors for the same cell', () => {
    expect(planeCellColor(1.2, -3.7)).toEqual(planeCellColor(1.8, -3.1));
  });

  it('can differ between neighboring cells', () => {
    const a = planeCellColor(0.1, 0.1);
    const b = planeCellColor(1.1, 0.1);
    const same = a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
    expect(same).toBe(false);
  });
});