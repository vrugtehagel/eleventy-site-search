# eleventy-site-search

Creates a client-side search for Eleventy websites.

## Installation

To install, run any of the following commands:

```bash
# For npm:
npx jsr add @vrugtehagel/eleventy-site-search
# For yarn:
yarn dlx jsr add @vrugtehagel/eleventy-site-search
# For pnpm:
pnpm dlx jsr add @vrugtehagel/eleventy-site-search
# For deno:
deno add @vrugtehagel/eleventy-site-search
```

## Config

In your Eleventy configuration file (usually `.eleventy.js`), import/require the
module and add the plugin using `.addPlugin()`:

```js
import EleventySiteSearch from "@vrugtehagel/eleventy-site-search";

export default function (eleventyConfig) {
  // …
  eleventyConfig.addPlugin(EleventySiteSearch, {
    metadata: ['title', 'description'],
    frequencyBias: .4,
    manualTermMode: 'integrated',
    cutoff: 20,
    logDatabaseEntries: process.env.ELEVENTY_RUN_MODE != 'build',
  });
  // …
}
```

- `manual`: Whether or not the indexing of pages should be opt-in or opt-out. By
  default, all pages are indexed; set this to `true` to index no pages by
  default. In that case, pages need to define a `search` front matter key either
  set to `true` or to an object with additional keywords. Defaults to `false`.
- `metadata`: A function or array of strings to add additional metadata to
  indexed pages. If an array of strings is passed, each item is looked up on the
  page's data and added to the indexed page. For example, if the `description`
  of a page is needed in the search results, then `['description']` achieves
  that. They must be top-level keys (e.g. `hero.image` is not supported). For
  more advanced use-cases, pass a function that takes a `data` argument like any
  `eleventyComputed` function would, and extracts the necessary information from
  each page. Defaults to `["title"]`.
- `pathPrefix`: If your site lives under a specific path on a domain, not at the
  top level of the domain, provide the path to your site here. This makes sure
  the search results contain correct URLs. Defaults to `"/"`.
- `rootElements`: The elements to read the words from. Generally, things like
  sidebars or navigation menus shouldn't be indexed, so this allows for more
  specific control on what to index. This should be a CSS selector. If nothing
  is matched, then the page is not indexed. Defaults to `"article"`.
- `lang`: Currently, this plugin is focused on English only, but could also work
  on many other languages. This option determines how the words are "chopped".
  For example, "don't" should be considered one word. In some other languages,
  like Japanese, segmenting words is much less trivial; this option allows you
  to specify how the word cutting should happen. Defaults to `"en"`.
- `contentTransforms`: A set of transforms to apply to content as a whole. By
  default, diacritics are removed and text is lowercased. Diacritics are _not_
  removed from search strings, so those will not match against anything that
  originally had the diacritic. Search terms are, however, lowercased. Removing
  the diacritics is fine for English, but for other languages, anything you do
  here must be reflected on to the search term before passing it to the
  client-side `search` function.
- `wordTransforms`: Similar to `contentTransforms`, but applies to every word
  found. By default, it removes the tail of words with an apostrophe. For some
  words, like "it's", that doesn't matter much because those types of words are
  unlikely to score high anyway, but for things like "Ghandi's mind" you would
  want "Ghandi" to rank without the "'s" even though that technically is one
  word. The defaults are very focused on English; probably you should overwrite
  them if you are using a different language.
- `weights`: An object mapping a CSS selector to a score multiplier. By default,
  a set of elements are ignored (such as `<style>`, `<script>`, elements and a
  handful of others) by having their multiplier set to `0`. Headers have default
  multipliers; `h1` counts 10 times as heavy, content in `h2`s is multiplied by
  `5`, and `h3`s are twice as heavy as usual. Note that setting this option
  overwrites the defaults; see the exported `Weights` object to retrieve the
  defaults.
- `frequencyBias`: This determines how frequency should be considered when
  scoring words. Should be a number between 0 and 1. If set to 0, it means words
  are ranked purely on how often they occur in a specific document compared to
  how often they are used in total. If set to 1, it means the global word count
  is also taken into account. For example, if there are 100 documents, 1000
  words each, and one of them contains the word "coffee" once, then a
  frequencyBias of 0 will cause "coffee" to score 100 for that particular page.
  If set to 1, it scores much lower because it was only used once within 100,000
  words and therefore unlikely to be relevant. Anything between 0 and 1
  interpolates between the two behaviors. Defaults to `.5`.
- `manualTermMode`: When specifying manual search terms for a page, there are
  two ways of merging them into the generated search results. One option is to
  mix the manual results in with the generated ones. This would mean that, if,
  say, a maximum number of search terms is set, the generated words that score
  higher than the manually specified terms could beat and push out some of the
  manual terms. This generally results in the highest scoring terms. This is the
  `"integrated"` mode. On the other hand, you might want to prioritize manual
  terms (you did manually specify them after all). This means generated terms
  are the first to get kicked out, and manually specified terms are guaranteed
  to end up in the index. Defaults to `"integrated"`.
- `minTerms`: Specifies a minimum number of terms to index. This is useful if a
  page doesn't score high on any word in particular, causing it to be searchable
  even if the scores are lower than the cutoff score. Defaults to `10`.
- `maxTerms`: Specifies a maximum number of terms. This can be used to more
  tightly control the size of the client-side database file. Defaults to `25`.
- `cutoff`: A cutoff score. If a word scores lower than this, it will not be
  included in the index, unless a minimum number of terms is specified and the
  word scores high enough to be in the top-ranking words for that page. Defaults
  to `30`.
- `output`: The location for the client-side script file, relative to the
  Eleventy output directory. Defaults to `"/site-search.js"`.
- `useMainThread`: Specifies whether or not to run the search on the main thread
  or in a worker. In general, it's not important for the search to happen
  instantly, since most searches hit the network, so the small thread-hopping
  cost is negligible and makes the page feel more responsive by not blocking the
  main thread. Set to `true` at your own risk. Defaults to `false`.
- `maxResults`: Cuts off the best search results at a certain number of results.
  Defaults to 10. Set to `Infinity` to avoid cutting off the search results,
  although note that you will get all of your pages in every search.
- `logDatabaseEntries`: During development, you're likely to want to inspect the
  ranked words for a give page. Setting this to `true` causes the client-side
  script to log some details about the words that are ranking for the current
  page.
- `urlRelevance`: Adds extra weight to searches that match a page's URL, rather
  than the indexed words. Defaults to `100`. Set to `0` to disable the behavior.

## About the codebase

### The index

Each document is read and analyzed. For each document, each word is assigned a
relevancy score as a percentage (0-100), which depends on how often it occurs in
the document, and how often it occurs in _other_ documents. Words also get a
heightened relevancy score if they appear in the main title, other headers, or
the URL. The relevancy score can then be interpreted as follows; if a word has a
relevancy score of X%, then when searching for said word, the document is X%
likely of being the correct match for that particular search. For example, a
word like "the" is likely to get a score close to 0%, because whatever document
it is found in, it is unlikely that the user is searching for that particular
document using the word "the". Words that are scoring near 100% are usually
important keywords to the document, found either in the title or URL, as well as
often in the document itself (and not much in other documents).

Of course, you're unlikely to want to be able to search on low-relevance words,
so there are two options to reduce the size of the index for each document.

- You can provide a certain cutoff score. Words with a lower relevancy score are
  then dropped from the index. This results in a smaller filesize, with a
  usually-insignificant cost to searchability.
- You can provide a minimum number of terms to index. This means that documents
  that don't have many (or any) high-relevancy words still are matchable. For
  example, A guide about using tools A, B and C might not score high on keywords
  from any of A, B, and C, whereas the individual pages for them score high on
  their respective keywords. In this case, using a cutoff score could mean that
  the guide about A, B, C doesn't end up having _any_ keywords, making it
  unsearchable. The minimum number of terms then avoids this by retaining the
  highest scoring X number of terms, so that searching for A results in both A
  and the guide about A, B, C rather than only A.

### Search matching

Now, for the actual searching. Usually, searches include more than one word, and
should not only match full words. While this search function is not
typo-tolerant, it is tolerant in another way. First, the search is split up into
individual words. Then, each of those is looked up in the indexes of the pages.
If an exact match is found, the relevancy score is attributed to that word. If a
word in the index _contains_ the searched-for word, then a proportional part of
the relevancy score is attributed. If on the other hand a word in the index is
contained within the search word (i.e. the search word contains an indexed word)
then also a proportional part of the relevancy score is attributed. This means
that e.g. seaching for "subwaystation" would still match a page that scores high
on "subway" and/or "station", even if the word "subwaystation" doesn't occur
within that document. The relevancy-attributed scores are then added (although
this can be configured to a custom accumulation function) and the results are
sorted based on these cumulative scores.

### Relevancy attribution

When matching a searched-for word to a word from the index, we need a function
to determine how much of the relevancy score to deduct from a partial match.
This is not usually linear with the number of matched characters or the total
number of characters in the word. For example, when searching for "rhinocero",
nearly all of the relevancy score of "rhinoceros" should be kept, whereas when
searching for "o" it is not much more likely that the user is searching for "ox"
compared to "ostrich".
