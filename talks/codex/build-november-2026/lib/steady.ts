/**
 * A number from 0 to 1 that is always the same for the same `seed`.
 * Slides use it to scatter things. Unlike Math.random, it gives the same picture on every load.
 */
export function steady(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}
