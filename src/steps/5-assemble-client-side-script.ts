import fs from "node:fs/promises";
import * as esbuild from "npm:esbuild@^0.24";
import { clientSource } from "../client/source.js";

import type { ClientSideScriptOptions } from "../options.ts";
import type { DatabaseEntry } from "../types.ts";

export async function assembleClientSideScript(
  db: DatabaseEntry[],
  outputDirectory: string,
  options: ClientSideScriptOptions,
): Promise<void> {
  const stringifiedDB = JSON.stringify(db)
    .replaceAll(/(\$(?={)|`|\\")/g, "\\$1");
  const source = `
    const db = JSON.parse(\`${stringifiedDB}\`);
    ${clientSource}
  `;
  const transpiled = await esbuild.transform(source, {
    loader: "ts",
    logLevel: "warning",
    minify: true,
    treeShaking: true,
    define: {
      USE_MAIN_THREAD: options.useMainThread ? "true" : "false",
      URL_RELEVANCE: options.urlRelevance.toString(),
      LANG: JSON.stringify(options.lang),
      MAX_RESULTS: options.maxResults.toString(),
      LOG_DB_ENTRIES: options.logDatabaseEntries ? "true" : "false",
      PATH_PREFIX: JSON.stringify(options.pathPrefix),
    },
  });
  const outputPath = options.output.replace(/^\/?/, "/");
  await fs.writeFile(`${outputDirectory}${outputPath}`, transpiled.code);
}
