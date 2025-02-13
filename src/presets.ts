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
/** A list of basic word transforms. These apply to single words only. */
export const WordTransform = {
  /** Removes apostrophes from words, if appropriate. For example, will
   * transform "They're" into "They" but will leave "A'uwe" as-is. */
  NoApostrophes: (word: string): string => {
    const parts = word.split(apostrophe);
    if (parts.length != 2) return word;
    const [main, suffix] = parts;
    if (suffix.length >= 3) return word;
    return main;
  },

  /** Removes numbers. */
  NoNumbers: (word: string): string => {
    if (Number.isNaN(Number(word))) return word;
    return "";
  },
};

/** The default word transforms. */
export const DefaultWordTransforms = [
  WordTransform.NoApostrophes,
  WordTransform.NoNumbers,
];

/** A collection of predefined weights, used in the defaults */
export const Weights = {
  Ignores: { "style, script, noscript, pre, code, math, aside": 0 },
  Headers: { "h1": 10, "h2": 5, "h3": 2 },
};

/** The default weights. */
export const DefaultWeights = {
  ...Weights.Ignores,
  ...Weights.Headers,
};
