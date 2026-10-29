import { sampleRandom } from './random';

describe('sampleRandom', () => {
  const items = Array.from({ length: 100 }, (_, i) => i);

  it('returns n distinct items from the list', () => {
    let seed = 1;
    const rng = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const sample = sampleRandom(items, 20, rng);
    expect(sample).toHaveLength(20);
    expect(new Set(sample).size).toBe(20);
    sample.forEach((x) => expect(items).toContain(x));
  });

  it('returns the whole list when n exceeds its size', () => {
    expect(sampleRandom([1, 2, 3], 10, () => 0).sort()).toEqual([1, 2, 3]);
  });

  it('is deterministic for a given random source', () => {
    expect(sampleRandom(items, 3, () => 0)).toEqual([0, 1, 2]);
    // Fisher–Yates: after picking index 99, slot 99 holds the swapped-out item 0.
    expect(sampleRandom(items, 2, () => 0.999)).toEqual([99, 0]);
  });

  it('handles empty input', () => {
    expect(sampleRandom([], 5, Math.random)).toEqual([]);
  });
});
