import type { DatabaseGeneratingOptions } from "../options.ts";
import type { ContentPage, DatabaseEntry, Tally } from "../types.ts";

export function generateDatabase(
  tallies: Map<string, Tally>,
  all: Tally,
  pages: Map<string, ContentPage>,
  options: DatabaseGeneratingOptions,
): DatabaseEntry[] {
  const scoreMap = new Map<string, Array<[string, number]>>();
  let maxScore = 0;
  for (const [url, tally] of tallies) {
    const page = pages.get(url)!;
    const scores: Array<[string, number]> = [];
    for (const [word, localCount] of tally.counts) {
      if (page.terms[word] == 0) continue;
      const globalCount = all.counts.get(word)!;
      const spread = localCount / globalCount;
      const frequency = (localCount / all.total) ** options.frequencyBias;
      const score = 100 * spread * frequency;
      if (score > maxScore) maxScore = score;
      scores.push([word, score]);
    }
    scoreMap.set(url, scores);
  }
  const db = [];
  const correction = 80 / maxScore;
  for (const [url, scores] of scoreMap) {
    scores.forEach((entry) => entry[1] *= correction);
    const page = pages.get(url)!;
    const manualTerms = Object.entries(page.terms);
    const manualTermsAdditive = options.manualTermMode == "additive";
    if (!manualTermsAdditive) scores.unshift(...manualTerms);
    scores.sort(([wordA, scoreA], [wordB, scoreB]) => {
      return scoreB - scoreA ||
        wordA.length - wordB.length ||
        wordA.localeCompare(wordB);
    });
    if (manualTermsAdditive) scores.unshift(...manualTerms);
    const safeIndex = manualTermsAdditive
      ? Math.max(options.minTerms, manualTerms.length)
      : options.minTerms;
    const safeTerms = scores.slice(0, safeIndex);
    const otherTerms = scores
      .slice(safeIndex, options.maxTerms - safeIndex)
      .filter(([_term, score]) => score >= options.cutoff);
    const termEntries = [...safeTerms, ...otherTerms]
      .map(([term, score]) => [term, Math.round(score)]);
    const terms = Object.fromEntries(termEntries);
    const meta = page.meta;
    const info = { url, meta };
    db.push({ terms, info });
  }
  return db;
}
