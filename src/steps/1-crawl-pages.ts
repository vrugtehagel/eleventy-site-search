import type { PageCrawlOptions } from "../options.ts";
import type { ContentPage, EleventyConfig } from "../types.ts";

export function crawlPages(
  config: EleventyConfig,
  options: PageCrawlOptions,
): Map<string, ContentPage> {
  const pages = new Map<string, ContentPage>();
  config.addGlobalData("eleventyComputed._siteSearch", () => (data: any) => {
    if (!data.page.url) return;
    const search = data.search ?? !options.manual;
    if (!search) return;
    const terms = typeof search == "object" ? search : {};
    const meta = typeof options.metadata == "function"
      ? options.metadata(data)
      : Object.fromEntries(options.metadata.map((key) => [key, data[key]]));
    const url = options.pathPrefix.replace(/\/$/, "") + data.page.url;
    pages.set(url, { terms, meta });
  });
  return pages;
}
