const diacritics =
  /\u{b7}\u{2bc}\u{2be}\u{300}-\u{304}\u{306}-\u{30c}\u{30f}\u{311}\u{31b}\u{323}-\u{328}\u{32d}\u{32e}\u{330}\u{331}/gu;

/** A list of basic content transforms. These apply to the content of a whole
 * document. */
export const ContentTransform = {
  /** Removes diacritics from characters. For example, "lämp" becomes "lamp".
   * Use this transform if and only if the target audience is expected _not_
   * to type the diacritics themselves. */
  RemoveDiacritics: (content: string): string =>
    content.normalize("NFKD").replaceAll(diacritics, ""),
  /** Lowercases everything. Searches become case-insensitive. */
  Lowercase: (content: string): string => content.toLowerCase(),
};
export const DefaultContentTransforms = [
  ContentTransform.RemoveDiacritics,
  ContentTransform.Lowercase,
];

const apostrophe = /'|\u{2019}/u;
export const WordTransform = {
  NoApostrophes: (word: string): string => {
    const parts = word.split(apostrophe);
    if (parts.length != 2) return word;
    const [main, suffix] = parts;
    if (suffix.length > 3) return word;
    return main;
  },
  NoPlurals: (word: string): string => {
    if (!word.endsWith("s")) return word;
    if (word.endsWith("sses")) return word;
    if (word.endsWith("ss")) return word;
    return word.slice(0, -1);
  },
};
export const DefaultWordTransforms = [
  WordTransform.NoApostrophes,
  WordTransform.NoPlurals,
];

export const Weights = {
  Ignores: { "style, script, noscript, pre, code, math, aside": 0 },
  Headers: { "h1": 10, "h2": 5, "h3": 2 },
};
export const DefaultWeights = {
  ...Weights.Ignores,
  ...Weights.Headers,
};
