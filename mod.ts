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

export declare function search(query: string): Promise<PageInfo>;
