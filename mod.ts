import type { PageInfo } from "./src/types.ts";

export { EleventySiteSearch as default } from "./src/index.ts";
export { type EleventySiteSearchOptions } from "./src/options.ts";
export { type PageInfo } from "./src/types.ts";
export {
  ContentTransform,
  DefaultContentTransforms,
  DefaultWeights,
  DefaultWordTransforms,
  Weights,
  WordTransform,
} from "./src/presets.ts";

/** The client-side search function. This takes a search string as input, and
 * returns a promise with an array of matched pages. This function is exported
 * from the package for documentation purposes, but you must import it from
 * the generated client-side search script instead (`"/site-search.js"` by
 * default). */
export async function search(_query: string): Promise<PageInfo[]> {
  throw Error(
    "Do not import `search` from the eleventy-site-search package itself.\n" +
      "Instead, import it from the client-side search script" +
      " (`/site-search.js` by default).",
  );
}
