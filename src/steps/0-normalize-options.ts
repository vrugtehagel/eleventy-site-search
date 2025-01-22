import type { EleventySiteSearchOptions } from "../options.ts";
import {
  DefaultContentTransforms,
  DefaultWeights,
  DefaultWordTransforms,
} from "../presets.ts";

const defaults: EleventySiteSearchOptions = {
  manual: false,
  metadata: ["title"],
  pathPrefix: "/",
  rootElements: "article",
  lang: "en",
  contentTransforms: DefaultContentTransforms,
  wordTransforms: DefaultWordTransforms,
  weights: DefaultWeights,
  frequencyBias: .5,
  cutoff: 30,
  minTerms: 10,
  maxTerms: 25,
  manualTermMode: "integrated",
  output: "/site-search.js",
  useMainThread: false,
  maxResults: 10,
  logDatabaseEntries: false,
  urlRelevance: 100,
} as const;

export function normalizeOptions(
  rawOptions: Partial<EleventySiteSearchOptions>,
): EleventySiteSearchOptions {
  const normalized = { ...defaults, ...rawOptions };

  function fail(message: string) {
    throw Error(`eleventy-site-search: ${message}`);
  }
  function assertType(option: keyof EleventySiteSearchOptions, type: string) {
    const value = normalized[option];
    // deno-lint-ignore valid-typeof
    if (typeof value == type) return;
    fail(`Option "${option}" must be a ${type}`);
  }
  assertType("manual", "boolean");
  assertType("pathPrefix", "string");
  assertType("rootElements", "string");
  assertType("lang", "string");
  assertType("frequencyBias", "number");
  assertType("cutoff", "number");
  assertType("minTerms", "number");
  assertType("maxTerms", "number");
  assertType("manualTermMode", "string");
  assertType("output", "string");
  assertType("useMainThread", "boolean");
  assertType("maxResults", "number");
  assertType("logDatabaseEntries", "boolean");
  assertType("urlRelevance", "number");

  if (normalized.pathPrefix.startsWith("/")) {
    normalized.pathPrefix = "/" + normalized.pathPrefix;
  }
  if (normalized.pathPrefix.endsWith("/")) {
    normalized.pathPrefix = normalized.pathPrefix.slice(0, -1);
  }
  if (normalized.frequencyBias < 0 || normalized.frequencyBias > 1) {
    fail(`"frequencyBias" must be between 0 and 1`);
  }
  if (!["integrated", "additive"].includes(normalized.manualTermMode)) {
    fail(`"manualTermMode" must be either "integrated" or "additive"`);
  }
  return normalized;
}
