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
 * returns a promise with an array of matched pages. */
export async function search(query: string): Promise<PageInfo[]>;
