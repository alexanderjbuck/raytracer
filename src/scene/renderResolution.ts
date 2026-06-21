export const RESOLUTION_STEPS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.625, 0.75, 1] as const;

export const DEFAULT_RESOLUTION_INDEX = 2;

export function formatResolution(resolution: number): string {
  return `${Math.round(resolution * 100)}%`;
}

export function clampResolutionIndex(index: number): number {
  return Math.max(0, Math.min(RESOLUTION_STEPS.length - 1, index));
}