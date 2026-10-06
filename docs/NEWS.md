# fred News: where its facts come from

News is built by scheduled GitHub Actions jobs (`scripts/news/build.mjs`, `.github/workflows/news-*.yml`) into `data/news.json`, which
the app reads. These are the rules the jobs follow. The tests in `tests/news/` check them.

## Facts and links only

- Headlines are each source's own titles, linked to the source. fred never stores or shows article text, transcripts or photos.
- fred's own words are short: "In short", and 1–3 story lines per race, each credited to one report.
- Results appear only when they are official (World Triathlon) or two independent reports agree. Standings come from World Triathlon
  (WTCS, T100) and from ironman.com (IRONMAN Pro Series, below).
- A "Report a problem" link sits at the bottom of every News tab, race page and pro card.

## Polite fetching

- Every request carries the User-Agent `fred-news (+https://fuel.bluebirdmultisport.com; hello@flipturncreative.com)`.
- robots.txt is respected. Each URL is requested at most once per run, with a small cache (ETag / Last-Modified).
- An article page is read only to get facts for that run. Its text is never written anywhere.

## Sites fred never reads (links only)

fred never scrapes results or other pages from **T100 (t100triathlon.com)**, **PTO (protriathletes.org)** or **ironman.com**: it links to
them only. A daily link check may ask a T100 or PTO standings page for its status, and keeps nothing from it.

**The one exception: ironman.com (item 53).** IRONMAN approved fred reading exactly two things on ironman.com (`docs/LEGAL.md`):

- the IRONMAN Pro Series standings, from `https://www.ironman.com/proseries/standings`;
- the upcoming race calendar, from `https://www.ironman.com/races`.

Nothing else on ironman.com is read: no results pages, athlete pages, course or aid-station pages, or photos. ironman.com links are never
link-checked either. The fetcher refuses any other ironman.com address before making a request.

Reading these two pages happens only in the GitHub Actions jobs:

- the calendar at most once a day;
- the standings at most once a day in a race week, plus the Sunday/Monday results runs.

On an error or a block, fred stops, logs it, and keeps the last good copy (`data/ironman.json`). The ironman.com data never goes to the
AI, and is credited wherever the app shows it ("Standings: IRONMAN Pro Series ↗", "Race calendar: IRONMAN ↗").

`data/pro-races.json` holds only the races typed by hand from official announcements: T100 and other races. It never lists a race that
ironman.com's calendar has (same name and date). If one is there, the ironman.com entry is used and the job log says to remove it.

## AI

The AI (when `ANTHROPIC_API_KEY` is set) reads the feeds' articles to write "In short", story lines and results claims (checked by the
confidence rule), and T100 standings from reports when the World Triathlon API lists none. It is never given ironman.com's standings or
race calendar.
