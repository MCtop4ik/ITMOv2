/** Returns a number in [0, 1); injected so sampling stays pure and testable. */
export type RandomSource = () => number;

/** Picks up to `n` distinct items without repetition (partial Fisher–Yates on indexes). */
export function sampleRandom<T>(items: readonly T[], n: number, random: RandomSource): T[] {
  const count = Math.min(n, items.length);
  const picked = new Map<number, number>();
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(random() * (items.length - i));
    const atJ = picked.get(j) ?? j;
    picked.set(j, picked.get(i) ?? i);
    result.push(items[atJ]);
  }
  return result;
}
