import type { EleventyComputedDataArg } from "./types.ts";

export type PageCrawlOptions = {
  manual: boolean;
  metadata: string[] | ((data: EleventyComputedDataArg) => any);
  pathPrefix: string;
};

export type PagesProcessingOptions = {
  rootElements: string;
  lang: string;
  contentTransforms: Array<(content: string) => string>;
  wordTransforms: Array<(word: string) => string>;
  weights: Record<string, number>;
  pathPrefix: string;
};

export type DatabaseGeneratingOptions = {
  frequencyBias: number;
  manualTermMode: "additive" | "integrated";
  minTerms: number;
  maxTerms: number;
  cutoff: number;
};

export type ClientSideScriptOptions = {
  output: string;
  useMainThread: boolean;
  maxResults: number;
  lang: string;
  logDatabaseEntries: boolean;
  urlRelevance: number;
  pathPrefix: string;
};

export type EleventySiteSearchOptions =
  & PageCrawlOptions
  & PagesProcessingOptions
  & DatabaseGeneratingOptions
  & ClientSideScriptOptions;
