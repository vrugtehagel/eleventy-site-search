import * as HTMLParser from "npm:node-html-parser@^6.1";

import type { PagesProcessingOptions } from "../options.ts";
import type { ContentPage, EleventyConfig, Tally } from "../types.ts";

export function processPages(
  config: EleventyConfig,
  pages: Map<string, ContentPage>,
  options: PagesProcessingOptions,
): Map<string, Tally> {
  const tallies = new Map();
  const wordTransforms = new Map();
  const segmenter = globalThis.Intl?.Segmenter
    ? new Intl.Segmenter(options.lang, { granularity: "word" })
    : new FallbackSegmenter();
  config.addTransform("site-search", function (this: any, content: string) {
    if (!this.page.outputPath.endsWith(".html")) return content;
    const url = options.pathPrefix.replace(/^\//, "") + this.page.url;
    const page = pages.get(url);
    if (!page) return content;
    const doc = HTMLParser.parse(content);
    const roots = doc.querySelectorAll(options.rootElements);
    if (roots.length == 0) return content;
    const weightEntries = Object.entries(options.weights);
    const weights = weightEntries.map(([selector, weight]) => {
      let content = "";
      for (const root of roots) {
        for (const element of root.querySelectorAll(selector)) {
          content += element.textContent + " ";
          element.replaceWith(" ");
        }
      }
      const weightedContent: [string, number] = [content, weight];
      return weightedContent;
    }).filter(([_content, weight]) => weight > 0);
    const leftoverContent = roots.map((root) => root.textContent).join(" ");
    weights.push([leftoverContent, 1]);
    const counts = new Map();
    let total = 0;
    for (const [content, weight] of weights) {
      const transformed = options.contentTransforms
        .reduce((transformed, transform) => transform(transformed), content);
      const iterator = segmenter.segment(transformed);
      for (const { segment, isWordLike } of iterator) {
        if (!isWordLike) continue;
        if (!wordTransforms.has(segment)) {
          let transformed = segment;
          for (const transform of options.wordTransforms) {
            transformed = transform(transformed);
            if (!transformed) break;
          }
          wordTransforms.set(segment, transformed);
        }
        const word = wordTransforms.get(segment);
        const seen = counts.get(word) ?? 0;
        counts.set(word, seen + weight);
        total += weight;
      }
    }
    if (total > 0) {
      tallies.set(url, { counts, total });
    }
    return content;
  });
  return tallies;
}

class FallbackSegmenter {
  *segment(content: string) {
    yield* content.split(/\b/g).map((segment) => ({
      isWordLike: /\w/.test(segment),
      segment,
    }));
  }
}
