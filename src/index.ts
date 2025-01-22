import type { EleventySiteSearchOptions } from "./options.ts";
import type {
  ContentPage,
  DatabaseEntry,
  EleventyConfig,
  Tally,
} from "./types.ts";
// deno-fmt-ignore
import {
  normalizeOptions,
  crawlPages,
  processPages,
  tallyAll,
  generateDatabase,
  assembleClientSideScript,
} from "./steps/index.ts";

/** The main plugin function. */
export async function EleventySiteSearch(
  config: EleventyConfig,
  rawOptions?: Partial<EleventySiteSearchOptions>,
): Promise<void> {
  const options = normalizeOptions(rawOptions ?? {});
  const pages: Map<string, ContentPage> = crawlPages(config, options);
  const tallies: Map<string, Tally> = processPages(config, pages, options);
  config.events.addListener("eleventy.after", async ({ dir }: any) => {
    const outputDir: string = dir.output.replace(/\/?$/, "");
    const all: Tally = tallyAll(tallies);
    const db: DatabaseEntry[] = generateDatabase(tallies, all, pages, options);
    await assembleClientSideScript(db, outputDir, options);
  });
}
