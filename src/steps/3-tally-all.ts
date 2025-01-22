import type { Tally } from "../types.ts";

export function tallyAll(tallies: Map<string, Tally>): Tally {
  const counts = new Map();
  let total = 0;
  for (const tally of tallies.values()) {
    total += tally.total;
    for (const [word, count] of tally.counts) {
      const seen = counts.get(word) ?? 0;
      counts.set(word, seen + count);
    }
  }
  return { counts, total };
}
