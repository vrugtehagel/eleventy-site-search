import type { EleventyComputedDataArg } from "./types.ts";

/** A set of options determining how to crawl the site in question. */
export type PageCrawlOptions = {
  /** Whether or not the indexing of pages should be opt-in or opt-out. By
   * default, all pages are indexed; set this to `true` to index no pages by
   * default. In that case, pages need to define a `search` front matter key
   * either set to `true` or to an object with additional keywords. Defaults to
   * `false`. */
  manual: boolean;

  /** A function to add additional metadata to indexed pages. If an array
   * of strings is passed, each item is looked up on the page's data and added
   * to the indexed page. For example, if the `description` of a page is needed
   * in the search results, then `['description']` achieves that. They must be
   * top-level keys (e.g. `hero.image` is not supported). For more advanced
   * use-cases, pass a function that takes a `data` argument like any
   * `eleventyComputed` function would, and extracts the necessary information
   * from each page. Defaults to `["title"]`. */
  metadata: string[] | ((data: EleventyComputedDataArg) => any);

  /** If your site lives under a specific path on a domain, not at the top
   * level of the domain, provide the path to your site here. This makes sure
   * the search results contain correct URLs. Defaults to `"/"`. */
  pathPrefix: string;
};

/** A set of options for how the words on the pages are processed. */
export type PagesProcessingOptions = {
  /** The elements to read the words from. Generally, things like sidebars or
   * navigation menus shouldn't be indexed, so this allows for more specific
   * control on what to index. This should be a CSS selector. If nothing is
   * matched, then the page is not indexed. Defaults to `"article"`. */
  rootElements: string;

  /** Currently, this plugin is focused on English only, but could also work
   * on many other languages. This option determines how the words are
   * "chopped". For example, "don't" should be considered one word. In some
   * other languages, like Japanese, segmenting words is much less trivial;
   * this option allows you to specify how the word cutting should happen.
   * Defaults to `"en"`. */
  lang: string;

  /** A set of transforms to apply to content as a whole. By default,
   * diacritics are removed and text is lowercased. Diacritics are _not_
   * removed from search strings, so those will not match against anything that
   * originally had the diacritic. Search terms are, however, lowercased.
   * Removing the diacritics is fine for English, but for other languages,
   * anything you do here must be reflected on to the search term before
   * passing it to the client-side `search` function. */
  contentTransforms: Array<(content: string) => string>;

  /** Similar to `contentTransforms`, but applies to every word found. By
   * default, it removes the tail of words with an apostrophe. For some words,
   * like "it's", that doesn't matter much because those types of words are
   * unlikely to score high anyway, but for things like "Ghandi's mind" you
   * would want "Ghandi" to rank without the "'s" even though that technically
   * is one word. The defaults are very focused on English; probably you should
   *  overwrite them if you are using a different language. */
  wordTransforms: Array<(word: string) => string>;

  /** An object mapping a CSS selector to a score multiplier. By default, a set
   * of elements are ignored (such as `<style>`, `<script>`, elements and a
   * handful of others) by having their multiplier set to `0`. Headers have
   * default multipliers; `h1` counts 10 times as heavy, content in `h2`s is
   * multiplied by `5`, and `h3`s are twice as heavy as usual. Note that
   * setting this option overwrites the defaults; see the exported `Weights`
   * object to retrieve the defaults. */
  weights: Record<string, number>;

  /** If your site lives under a specific path on a domain, not at the top
   * level of the domain, provide the path to your site here. This makes sure
   * the search results contain correct URLs. Defaults to `"/"`. */
  pathPrefix: string;
};

/** A set of options influencing how the database is generated and prepared for
 * the client-side. */
export type DatabaseGeneratingOptions = {
  /** This determines how frequency should be considered when scoring words.
   * Should be a number between 0 and 1. If set to 0, it means words are ranked
   * purely on how often they occur in a specific document compared to how often
   * they are used in total. If set to 1, it means the global word count is also
   * taken into account. For example, if there are 100 documents, 1000 words
   * each, and one of them contains the word "coffee" once, then a frequencyBias
   * of 0 will cause "coffee" to score 100 for that particular page. If set to 1,
   * it scores much lower because it was only used once within 100,000 words and
   * therefore unlikely to be relevant. Anything between 0 and 1 interpolates
   * between the two behaviors. Defaults to `.5`. */
  frequencyBias: number;

  /** When specifying manual search terms for a page, there are two ways of
   * merging them into the generated search results. One option is to mix the
   * manual results in with the generated ones. This would mean that, if, say,
   * a maximum number of search terms is set, the generated words that score
   * higher than the manually specified terms could beat and push out some of
   * the manual terms. This generally results in the highest scoring terms.
   * This is the `"integrated"` mode. On the other hand, you might want to
   * prioritize manual terms (you did manually specify them after all). This
   * means generated terms are the first to get kicked out, and manually
   * specified terms are guaranteed to end up in the index. Defaults to
   * `"integrated"`. */
  manualTermMode: "additive" | "integrated";

  /** Specifies a minimum number of terms to index. This is useful if a page
   * doesn't score high on any word in particular, causing it to be searchable
   * even if the scores are lower than the cutoff score. Defaults to `10`. */
  minTerms: number;

  /** Specifies a maximum number of terms. This can be used to more tightly
   * control the size of the client-side database file. Defaults to `25`. */
  maxTerms: number;

  /** A cutoff score. If a word scores lower than this, it will not be included
   * in the index, unless a minimum number of terms is specified and the word
   * scores high enough to be in the top-ranking words for that page. Defaults
   * to `30`. */
  cutoff: number;
};

/** A set of options allowing you to configure the generated client-side
 * script. */
export type ClientSideScriptOptions = {
  /** The location for the client-side script file, relative to the Eleventy
   * output directory. Defaults to `"/site-search.js"`. */
  output: string;

  /** Specifies whether or not to run the search on the main thread or in a
   * worker. In general, it's not important for the search to happen instantly,
   * since most searches hit the network, so the small thread-hopping cost is
   * negligible and makes the page feel more responsive by not blocking the
   * main thread. Set to `true` at your own risk. Defaults to `false`. */
  useMainThread: boolean;

  /** Cuts off the best search results at a certain number of results. Defaults
   * to 10. Set to `Infinity` to avoid cutting off the search results, although
   * note that you will get all of your pages in every search. */
  maxResults: number;

  /** Like in `PageProcessingOptions`, this determines how words are cut. Set
   * this to the language you expect your users to search in. Defaults to
   * `"en"`. */
  lang: string;

  /** During development, you're likely to want to inspect the ranked words for
   * a give page. Setting this to `true` causes the client-side script to log
   * some details about the words that are ranking for the current page. */
  logDatabaseEntries: boolean;

  /** Adds extra weight to searches that match a page's URL, rather than the
   * indexed words. Defaults to `100`. Set to `0` to disable the behavior. */
  urlRelevance: number;

  /** If your site lives under a specific path on a domain, not at the top
   * level of the domain, provide the path to your site here. This makes sure
   * the search results contain correct URLs. Defaults to `"/"`. */
  pathPrefix: string;
};

/** The options object for the plugin is an amalgamation of options for the
 * different steps the plugin goes through to generate the database and
 * client-side script. See the individual options objects for more info. */
export type EleventySiteSearchOptions =
  & PageCrawlOptions
  & PagesProcessingOptions
  & DatabaseGeneratingOptions
  & ClientSideScriptOptions;
