# eleventy-site-search

## How the search works

### The index

Each document is read and analyzed. For each document, each word is assigned a
relevancy score as a percentage (0-100), which depends on how often it occurs in
the document, how often it occurs in _other_ documents. Words also get a
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

#### Relevancy attribution

When matching a searched-for word to a word from the index, we need a function
to determine how much of the relevancy score to deduct from a partial match.
This is not usually linear with the number of matched characters or the total
number of characters in the word. For example, when searching for "rhinocero",
nearly all of the relevancy score of "rhinoceros" should be kept, whereas when
searching for "o" it is not much more likely that the user is searching for "ox"
compared to "ostrich".
