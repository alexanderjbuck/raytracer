import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RESOLUTION_INDEX,
  RESOLUTION_STEPS,
  clampResolutionIndex,
  formatResolution,
} from './renderResolution';

describe('renderResolution', () => {
  it('formats resolution as a percentage', () => {
    expect(formatResolution(0.5)).toBe('50%');
    expect(formatResolution(1)).toBe('100%');
  });

  it('clamps resolution index to available steps', () => {
    expect(clampResolutionIndex(-1)).toBe(0);
    expect(clampResolutionIndex(99)).toBe(RESOLUTION_STEPS.length - 1);
    expect(RESOLUTION_STEPS[DEFAULT_RESOLUTION_INDEX]).toBe(0.5);
  });
});