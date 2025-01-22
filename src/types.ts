/** Your `eleventyConfig` object. You should need to pass this manually, this
 * is handled automatically with `.addPlugin(EleventySiteSearch, {…})`. */
export type EleventyConfig = any;

/** The argument one might receive in an `eleventyComputed` callback. */
export type EleventyComputedDataArg = any;

/** Internal. This represents a page with content, to potentially read through
 * for search purposes. This does not include pages that have search disabled
 * (through the lack of a `search` front matter key if the `manual` option is
 * set to `true`, or with `search: false`). It _does_ include pages that do not
 * have any to-read elements on it, since documents are not yet parsed at this
 * stage. */
export type ContentPage = {
  /** Manually added search terms. */
  terms: Record<string, number>;

  /** The page's metadata from the front matter. */
  meta: any;
};

/** Internal. This is used for counting words, both on a per-page basis as well
 * as globally for all pages. */
export type Tally = {
  /** Maps a word to how many times it occurs. Accounts for weights. */
  counts: Map<string, number>;

  /** The total number of word occurrances. In other words; the sum of the
   * numbers from `counts`. */
  total: number;
};

/** Internal. Represents a page with its top ranking keywords, and includes the
 * metadata for the page. */
export type DatabaseEntry = {
  /** The highest ranking search terms with their score, rounded to the nearest
   * integer. */
  terms: Record<string, number>;

  /** The page info to be exposed through the search results, except for the
   * `score` because it is not yet matched to a query. */
  info: Omit<PageInfo, "score">;
};

/** Represents one search result. */
export type PageInfo = {
  /** The URL for the page. */
  url: string;

  /** A score for how close the page matches the query. Is a number between
   * 0 and 100. */
  score: number;

  /** The page's metadata. Can be configured through the `metadata` option. By
   * default includes the page title as per the `title`  */
  meta: Record<string, any>;
};
