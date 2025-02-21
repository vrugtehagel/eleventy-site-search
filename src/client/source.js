// This is a literal copy of `src/client/search.ts`.
// It sucks that we need this, but projects with a deno.json just cannot
// fetch a local file as text because import.meta.url resolves to the remote
// JSR URL.
export const clientSource = `
import type { DatabaseEntry, PageInfo } from "../types.ts";

// Prepended to this file…
declare const db: DatabaseEntry[];
// Injected through esbuild…
declare const USE_MAIN_THREAD: boolean;
declare const URL_RELEVANCE: number;
declare const LANG: string;
declare const MAX_RESULTS: number;
declare const LOG_DB_ENTRIES: boolean;
declare const PATH_PREFIX: string;

const isWorker = globalThis.WorkerGlobalScope &&
  globalThis instanceof WorkerGlobalScope;

if (!isWorker && LOG_DB_ENTRIES) {
  const path = PATH_PREFIX + globalThis.location.pathname;
  const entry = db.find((entry) => entry.info.url == path);
  if (!entry) {
    console.log("eleventy-site-search: Page not indexed.");
  } else {
    console.log("eleventy-site-search: Page meta:", entry.info.meta);
    console.log("eleventy-site-search: Terms:");
    console.table(entry.terms);
  }
}

function similarity(longer: string, shorter: string): number {
  if (longer == shorter) return 1;
  if (longer.length < shorter.length) {
    [longer, shorter] = [shorter, longer];
  }
  if (!longer.includes(shorter)) return 0;
  return shorter.length / longer.length;
}

const segmenter = new Intl.Segmenter(LANG, { granularity: "word" });
async function mainThreadSearch(query: string): Promise<PageInfo[]> {
  const words = [...segmenter.segment(query)]
    .filter(({ isWordLike }) => isWordLike)
    .map(({ segment }) => segment.toLowerCase());
  return db.map((entry) => {
    let score = 0;
    for (const word of words) {
      score += URL_RELEVANCE * similarity(entry.info.url, word);
      for (const [term, relevance] of Object.entries(entry.terms)) {
        score += relevance * similarity(term, word);
      }
    }
    const scoredEntry: [number, DatabaseEntry] = [
      score / (words.length + 1),
      entry,
    ];
    return scoredEntry;
  })
    .filter(([score]) => score > 0)
    .sort(([scoreA], [scoreB]) => scoreB - scoreA)
    .slice(0, MAX_RESULTS)
    .map(([score, entry]) => ({ ...entry.info, score }));
}

const pending: Record<string, (results: PageInfo[]) => void> = {};
let worker = null;
if (!USE_MAIN_THREAD) {
  if (isWorker) {
    globalThis.addEventListener("message", async (event: MessageEvent) => {
      const { query, uid } = event.data;
      const results = await mainThreadSearch(query);
      globalThis.postMessage({ uid, results });
    });
  } else {
    worker = new Worker(import.meta.url, { type: "module" });
    worker.addEventListener("message", (event: MessageEvent) => {
      const { uid, results } = event.data;
      pending[uid]?.(results);
      delete pending[uid];
    });
  }
}

async function workerSearch(query: string): Promise<PageInfo[]> {
  const uid = Math.random().toString(16).slice(2);
  const promise: Promise<PageInfo[]> = new Promise((resolve) => {
    pending[uid] = resolve;
  });
  worker!.postMessage({ uid, query });
  return promise;
}

export const search = USE_MAIN_THREAD ? mainThreadSearch : workerSearch;
`;
