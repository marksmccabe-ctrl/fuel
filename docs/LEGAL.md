# Legal and data-use records

Approvals and permissions fred relies on, with what each one allows. The code that enforces each one is named under it.

## IRONMAN: reading ironman.com (item 53)

IRONMAN has approved fred reading ironman.com for (a) IRONMAN Pro Series standings and (b) the upcoming race calendar. Nothing else on
ironman.com is read (no results pages, athlete pages, course or aid-station pages, photos). Approved {date}, by {name}, see {email}.

> **Mark: paste the approval email's text here** (the whole email, with its date and sender), and fill in {date}, {name} and {email}
> above.

```
{the approval email}
```

### What fred reads, and how

- **Exactly these addresses**, nothing else on ironman.com or its subdomains (`scripts/news/lib/ironman.mjs`, `IM_ALLOW`):
  - `https://www.ironman.com/proseries/standings` (and `/proseries/standings/{year}`, where that page redirects to the current season);
  - `https://www.ironman.com/races` (the race calendar);
  - `https://www.ironman.com/robots.txt`, read first so the site's crawl rules are respected.

  The fetcher refuses every other ironman.com address before any request is made: link checks, feeds, articles, JSON calls, and redirects
  that would leave the list (`scripts/news/lib/fetch.mjs`). A test proves it (`tests/news/ironman.test.mjs`).
- **Facts only.** Standings: rank, athlete, country, points, races counted, for women and men. Calendar: each upcoming IRONMAN and
  IRONMAN 70.3 race's name, date, place, series flags (Pro Series, World Championship, Regional Championship) and its official race page
  link. The pages themselves are never stored, not even in the job's cache. The last good facts are kept in `data/ironman.json`.
- **Only in the GitHub Actions news jobs.** Nothing else reads ironman.com: not the app, and not a run on any other machine.
- **How often.** The calendar at most once a day (the daily job). The standings at most once a day in a race week (Monday to Sunday with
  a Pro Series or World Championship race), plus the news-results run on Sunday night and Monday morning.
- **Who is asking.** Every request carries the User-Agent `fred-news (+https://fuel.bluebirdmultisport.com; hello@flipturncreative.com)`.
- **Errors and blocks.** On an HTTP error, a refusal (401, 403, 429, a bot-check page, robots.txt) or a page fred cannot read, fred makes
  no more ironman.com requests that run and logs the reason. The last good copy stays in place and the app keeps showing it.
- **Never passed to the AI.** No standings row, race name or place from ironman.com goes into any AI prompt. The story of a race on the
  ironman.com calendar asks about "the race". The Pro Series is no longer read from news reports.
- **Credited wherever it shows.** "Standings: IRONMAN Pro Series ↗" (the official standings page) and "Race calendar: IRONMAN ↗" (the
  official race calendar) appear on every screen that shows these facts: News › Racing, the race page, the pro card and Pros you follow.

### Still never read

Every other ironman.com page, and T100 (t100triathlon.com), PTO (protriathletes.org) and every other site's results pages. fred links to
them only. See `docs/NEWS.md`.
