# fred

Ride fueling from the forecast and your profile: how many bottles, what mix, how many gels, how much sodium, and what to wear.
It also keeps a Journal of rides (planned vs actual) and your Races (results, PRs, age-group percentiles, wins).

fred (lowercase, always) is one static page (`index.html`, all the code in one script), a service worker (`sw.js`) for offline use, a web manifest
and icons, published by GitHub Pages from `main`. There is no build step. The only server of our own is optional: a small
Cloudflare Worker (`worker/fred-api.js`) that holds the Strava connection (see "Strava connection").
The app was called Bluebird Fuel before; saved data keeps its `bluebird.*` storage keys and backups keep `app: "bluebird-fuel"`,
so old devices and old backup files keep working.

Everything is saved in the browser (localStorage) first. Optionally, with a Firebase project configured, people can sign in with
Google to back up and sync their profile, closet, product library, last plan, Journal and Races across devices.

- With `FIREBASE_CONFIG = null` (the default), no Firebase code loads, there is no sign-in UI, and the app works exactly as it
  always has: nothing leaves the device.
- With a config, the Account row (Profile › Account & data) holds "Back up and sync". Saving a Journal entry or a race (and the race imports and
  the Journal restore) asks for a sign-in first; everything else works signed out. Nothing uploads before sign-in.

## Setup (cloud sync)

Do these in order. The app's domain is set in one place, `APP_DOMAIN` near the top of the script in `index.html`
(currently `fuel.bluebirdmultisport.com`).

1. **Firebase project.** At console.firebase.google.com, add a project. Google Analytics: off (the app has no analytics).
2. **Google sign-in.** Build > Authentication > Get started > Sign-in method > Google > Enable (pick a support email) > Save.
3. **Firestore, US.** Build > Firestore Database > Create database > location **nam5 (United States)** > production mode.
   Then the Rules tab: paste the rules below (also in `firestore.rules`) and Publish.
4. **Web app config.** Project settings > General > Your apps > Web (`</>`) > register an app (no Firebase Hosting needed).
   Copy the `firebaseConfig` object and paste it into `index.html` in place of `null`:

   ```js
   const FIREBASE_CONFIG = { apiKey: "…", authDomain: "fuel.bluebirdmultisport.com", projectId: "…", storageBucket: "…", messagingSenderId: "…", appId: "…" }; // paste the Firebase web app config object here
   ```

   Change `authDomain` from `<project>.firebaseapp.com` to **the same value as `APP_DOMAIN`**. The app warns in the browser
   console if they differ. (The apiKey is an identifier, not a secret; the security rules protect the data. You may restrict it to
   HTTP referrer `https://fuel.bluebirdmultisport.com/*` in Google Cloud > APIs & Services > Credentials.)
5. **Auth helper on our own domain.** Safari blocks the third-party storage Firebase's redirect sign-in needs when the helper lives on
   firebaseapp.com, so the site serves it itself under `/__/auth/`. Run

   ```sh
   sh scripts/fetch-auth-helper.sh <firebase-project-id>
   git add __ && git commit -m "Self-host the Firebase auth helper"
   ```

   It downloads `handler.js`, `experiments.js`, `iframe.js` and the two helper pages, saved as `__/auth/handler/index.html` and
   `__/auth/iframe/index.html` (GitHub Pages serves extensionless files as downloads; a folder's `index.html` is served as a page,
   and `/__/auth/handler?…` gets a 301 to `/__/auth/handler/?…` with the query kept). It writes `__/firebase/init.json`
   (apiKey, authDomain = APP_DOMAIN, projectId). Check: `curl -sI "https://fuel.bluebirdmultisport.com/__/auth/handler/"` shows
   `content-type: text/html`. If init.json can't be fetched, the script prints the one line to write by hand.
   `.nojekyll` (already in the repo) makes GitHub Pages publish a folder that starts with `_`.
6. **DNS.** Where bluebirdmultisport.com's DNS is managed, add a **CNAME** record: `fuel` → `marksmccabe-ctrl.github.io`.
7. **GitHub Pages custom domain.** Repo Settings > Pages > Custom domain: `fuel.bluebirdmultisport.com` > Save (GitHub commits a
   `CNAME` file; that is expected now). When the certificate is ready, tick **Enforce HTTPS**. Do not add a CNAME file before the
   DNS record exists: the live site would redirect to a domain that doesn't answer yet.
8. **Authorized domains.** Firebase > Authentication > Settings > Authorized domains: add `fuel.bluebirdmultisport.com`. Keep
   `marksmccabe-ctrl.github.io` while migrating.
9. Commit the config and push. Then run the manual checklist below.

**Moving to the new domain and existing data.** Browser storage belongs to one address. When GitHub starts redirecting
`marksmccabe-ctrl.github.io/fuel` to `fuel.bluebirdmultisport.com`, data saved at the old address is not visible at the new one.
Before step 7, on each device you use: Profile > Backup > **Download a backup** (profile, closet, bikes, products, journal and races in
one file). After the move: Profile > Backup > **Restore a backup** on the new address (or sign in on the new address).

## Security rules

Saved verbatim in `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /{sub=**} { allow read, write: if request.auth != null && request.auth.uid == uid; }
    }
  }
}
```

Data model: `users/{uid}` = `{profile, settings, library, lastPlan, createdAt, schemaVersion}` (settings / library / lastPlan each
carry an `updatedAt`); `users/{uid}/journal/{id}` and `users/{uid}/races/{id}` = one record each, with `updatedAt` (ms) and
`schemaVersion`. A delete is written as `{id, deleted: true, updatedAt}` so it reaches other devices.

Journal entries: **Save to Journal** (the bar under the Plan results) stores `status: 'planned'` with `date`, `start` (HH:MM), `durMin`
(planned), the usual `gel` / `pw` / `plan` keys and `snap` (the plan as shown: bottles with recipes, gels with times, per-hour carbs /
sodium / fluid, caffeine, weather, clothing, stops; `snap.nutrition` is null for a Clothing-only plan). The check-in adds `exec`
(`bottles` in quarter steps, `gels`, `durMin`, `durSrc: 'strava' | 'import'` when the ride time came from there), `extra` (extra
food: `{name, carbs, sodium, n}`), `fb`, `verdict`, `wore`, `notes`, `name`, and sets `status: 'done'` + `checkedInAt`. Entries from
before have no status and read as `done` (normalized in memory, never bulk re-saved). Strava's distance, name and id are never stored.

## Owner's manual checklist

1. TEST Google account first
2. log a race
3. sign out
4. sign in on device B
5. race appears
6. edit on B
7. A updates on next open
8. delete test account
9. Firestore console shows no data
10. Strava (when switched on): connect, see "Syncing Strava…" and the "Strava: … activities" line, Disconnect, and check the
    Firestore console shows no `strava` documents

## How sync behaves

- **Local first.** localStorage is the source of truth; the network never blocks a save. Signed in, every save also queues a cloud
  write (`bluebird.syncqueue.v1`): journal entries and races at once, settings / library / last plan 1.5 s after the last change.
  The queue survives reloads and replays on load, when the connection comes back and when the app returns to the front, where it
  also pulls what other devices changed.
- **Conflicts.** Newest `updatedAt` wins per record (per race, per journal entry, per settings / library / last-plan document), never
  field by field. The first sign-in on a device merges both sides and never drops a record that exists on only one side.
- **Signing in as someone else** on a device that holds another account's data asks before merging or replacing.
- **Signed out:** everything works; saving to the Journal or Races (and the race imports, the Journal restore) asks for a sign-in
  and finishes the save right after it, also after the iPhone redirect. Cancel keeps the form and stores nothing.
- **Sign out** keeps the data on the device. **Delete my account** (Profile) deletes the cloud copy, then the sign-in, and erases
  the device only if you tick the box.
- The service worker caches the Firebase SDK from www.gstatic.com (stale-while-revalidate) so sign-in state and sync work offline
  after the first load; it never touches Firestore or Google sign-in requests, or the `/__/` auth helper.

## Strava connection

Optional. Google sign-in stays the login; Strava is an extra account a signed-in person can connect so fred can count their
training hours. This build connects, and syncs activity summaries. (No Volume screen yet.)

- **Off by default.** With `FRED_API_URL = null` in `index.html` there is no Strava anywhere: no card, no calls, no storage.
- **How it fits together.** The app (`index.html`) talks to one small Cloudflare Worker, `fred-api` (`worker/fred-api.js`). The
  Worker keeps each person's Strava keys in Cloudflare KV (`STRAVA_TOKENS`) and never sends them to the browser. Every call from the
  app carries the person's Firebase sign-in token, which the Worker checks with Google before doing anything. The Worker only
  answers `https://fuel.bluebirdmultisport.com`.
- **Connecting.** Profile › Strava › **Connect with Strava** → Strava asks → Strava sends the browser to
  `/strava/callback/` → that page hands the one-time code and Strava's scope to the Worker → the Worker trades the code, then
  checks the scope (from Strava's redirect and its token answer; commas or `%2C`, decoded and trimmed) → "Connected. Back to fred".
  `activity:read_all` sees every activity; `activity:read` alone connects too, without private activities, and says so (with
  "Include private activities"). With neither, the page explains why fred needs it, shows what Strava sent, and offers Try again.
  Every Try again asks Strava with `approval_prompt=force`, so the boxes show again.
- **Syncing.** The first time, fred reads every activity, newest first, 200 at a time ("Syncing Strava… 1,240 activities"). If
  Strava's limit is reached it pauses and carries on by itself later, from where it stopped. After that, each time the app opens
  (if the last sync is over 30 minutes old) it fetches what's new. **Sync now** does it at once; **More › Full resync** reads
  everything again.
- **Where it's kept.** A short summary per activity (name, sport, date, time, distance, climbing, heart-rate and power averages)
  on the device (IndexedDB) and in the person's Firestore: `users/{uid}/strava/{year}` (`2024`, and `2024-2` if a year grows past
  ~900 KB) plus `users/{uid}/strava/_meta`. The existing rules already make these owner-only.

### Volume tab

Built on the Strava sync: hours, miles or sessions per season and per month, a goal (More / Same / Less vs last season), and an
off-season view after the last race on the Races calendar. fred is a reference, not a coach: it shows what's true and what published
guidance says (grey "Friel: …" tags; fred's own math is tagged "fred: …") and never tells anyone what to do.

- Everything is computed on the device from the local Strava copy and recomputed after each sync; no derived number is stored.
- The person's choices (goal per season, counted sports, season start, off-season) live in `settings.volume` and sync with the
  settings. The Science page card "Training volume and the off-season" lists the sources and how fred calculates.
- The off-season can start now or on a date ("Start on a date…"): the schedule (`settings.volume.sched`) shows as "Off-season
  starts {date}" with Change and Cancel, and turns into the off-season (starting on that date) the first time Volume renders on or
  after it.
- The tab only appears with a Strava connection (`FRED_API_URL` set). Imported training files (Volume › More › Import training
  history) fill it too, and those are ordinary user data (part of "Download a backup").

### Aero estimate (CdA)

Log a race › Bike › "Aero estimate (CdA)" works out CdA from the race averages and a few answers (weights, tires, road); the
weather lookup adds air pressure and altitude. With Strava connected and a matching ride (same day, starting near the bike start,
distance within 20%, a power meter), the button "Use ride data from Strava for a tighter estimate" calls `GET /strava/streams`,
works through the ride's steady stretches on the device, and keeps only `{cda, lo, hi, n}` with the race (`aero.ride`). That
result is cleared on Disconnect and on Delete my account, and left out of "Download a backup". The Science page card explains
the maths.

### Strava rules (fred follows these)

- Strava data is shown only to the signed-in owner.
- It is never sent to any AI model or service.
- Disconnecting deletes fred's copy (on the device and in the cloud). Deleting the fred account disconnects Strava too.
- It is not part of "Download a backup".
- Strava's official "Connect with Strava" button and "Powered by Strava" logo are used as provided, wherever Strava numbers appear.

### Setting it up (no terminal needed)

You need: the Strava app's **Client Secret** (strava.com › Settings › My API Application, click "show"), and about 20 minutes.
Never paste the Client Secret anywhere except step 5 below. It must never go into GitHub.

1. **Make a free Cloudflare account** at dash.cloudflare.com and log in.
2. **Make the key box.** In the left menu open **Storage & Databases › KV** (older dashboards: **Workers & Pages › KV**).
   Click **Create** (or "Create a namespace"), type the name `STRAVA_TOKENS`, and click **Add** / **Create**.
3. **Make the Worker.** Left menu: **Workers & Pages › Create › Create Worker** (pick "Start with Hello World!" if asked). Name it
   `fred-api` and click **Deploy**. Cloudflare shows its address, something like `https://fred-api.yourname.workers.dev`.
   Write it down.
4. **Put fred's code in it.** On the Worker's page click **Edit code**. Select everything in the editor and delete it. In another
   tab open this repository on GitHub, open `worker/fred-api.js`, click the **Copy raw file** button (two squares), go back and paste.
   Click **Deploy**.
5. **Settings.** Worker page › **Settings › Variables and Secrets › Add**. Add these four, one at a time:

   | Type   | Name                   | Value                                   |
   |--------|------------------------|-----------------------------------------|
   | Text   | `STRAVA_CLIENT_ID`     | `282871`                                |
   | Text   | `FIREBASE_PROJECT_ID`  | `bluebird-fuel`                         |
   | Text   | `ALLOWED_ORIGIN`       | `https://fuel.bluebirdmultisport.com`   |
   | Secret | `STRAVA_CLIENT_SECRET` | *(the Client Secret from Strava)*       |

   Click **Deploy** when it asks.
6. **Connect the key box.** Worker page › **Settings › Bindings › Add › KV namespace**. Variable name `STRAVA_TOKENS`, namespace
   `STRAVA_TOKENS`. Click **Add binding** / **Deploy**.
7. **Check it's alive.** Open your Worker address in a browser. It should say `Forbidden`. That's right: it only talks to fred.
8. **Strava's settings.** strava.com › Settings › My API Application: "Authorization Callback Domain" must be
   `fuel.bluebirdmultisport.com`.
9. **Strava's artwork.** From Strava's brand page (developers.strava.com › Guidelines) download the **Connect with Strava** button
   (orange, SVG) and the **Powered by Strava** logo (horizontal, SVG). On GitHub open the `assets/strava` folder › **Add file ›
   Upload files**, and name them exactly `connect-with-strava.svg` and `powered-by-strava.svg`. (Until they are there, fred shows
   the same words as plain text.)
10. **Switch it on.** On GitHub open `index.html`, click the pencil (Edit), search for `const FRED_API_URL = null;` and change it
    to your address from step 3, in quotes:
    `const FRED_API_URL = 'https://fred-api.yourname.workers.dev';`
    Click **Commit changes**. After a minute or two, reload fred: Profile › Strava › Connect with Strava.

To switch Strava off again, put `null` back in step 10. The Worker can stay; nothing calls it.

Strava allows fred **10 connected athletes**. When all 10 are used, a new person sees "fred's Strava connection is full right
now". Strava also limits reads (200 every 15 minutes, 2,000 a day, for everyone together); the Worker watches that and fred
pauses and resumes by itself.

### Updating the Worker

When `worker/fred-api.js` changes (for example, the aero estimate added `/strava/streams`), the copy in Cloudflare has to be
replaced by hand: Cloudflare dashboard › **Workers & Pages › fred-api › Edit code**, select everything and delete it, paste the
whole new `worker/fred-api.js` from GitHub (open the file, **Raw**, select all, copy), then **Deploy**. The settings and the key box
stay as they are; nobody has to reconnect Strava.

**Check which code Cloudflare is running.** Open `https://fred-api.marks-mccabe.workers.dev/version` in a browser. It answers
`{"version":"abc1234","builtAt":"…"}`: the git short hash of the commit that last changed the Worker's code. fred's `index.html`
carries the same value as `FRED_WORKER_VERSION`, and fred shows the comparison in small grey text in Profile › Strava and at
the bottom of the Strava return page ("fred server abc1234 · up to date", or "an older copy … paste worker/fred-api.js into
Cloudflare again"). Whenever the Worker's code changes, a follow-up commit stamps the new hash in both files; a Worker test checks
they match.

**Reading the Worker's log.** Each Strava connection attempt writes one line (never a token, code or state): the scope in Strava's
redirect, the scope in Strava's token answer (or `(missing)`), the token answer's field names, and the decision (`all`, `public`,
`none`). To see it: Cloudflare dashboard › **Workers & Pages** › **fred-api** › the **Logs** tab. The first time, turn logs on
(on the Logs tab, or **Settings › Observability › Workers Logs › Enable**). For a live view, use the Logs tab's live / real-time
option and start it, then connect Strava on the phone; the line appears within a few seconds (it starts `{"at":"strava/exchange"`).

For developers: `worker/wrangler.toml` deploys the same Worker with the wrangler command line (`wrangler secret put
STRAVA_CLIENT_SECRET`, and set the KV namespace id). Worker tests: `node worker/fred-api.test.mjs`.

## Known limits

- **Settings are one document.** Profile, closet, bikes and the other settings sync as a single record. A device with an older copy
  that saves settings (for example a units change) can overwrite a newer settings edit made elsewhere (for example a closet change)
  if it hadn't pulled that edit yet. The same holds for the product library and the last plan. Accepted for now.
- **Device clocks decide "newest".** A device whose clock is far off can win or lose a conflict it shouldn't. Pulls allow for
  10 minutes of skew and do a full pull once a day.
- **Slow networks.** A cloud write or read gives up after 25 seconds; queued writes are retried every 30 seconds while the app is
  open, and on the next open / reconnect otherwise. Nothing is lost; it just waits.
- **Deleted records leave a small marker** (`deleted: true`) in the cloud so other devices learn about the delete. They are removed
  with the account.
- **A save waiting for sign-in lives on that device only.** If an iPhone sign-in is cancelled, the entry waits there (a banner offers
  sign-in or Discard) until you finish or discard it.
- **Delete my account interrupted.** If the connection drops mid-delete, the device stays signed in with sync paused; tap Delete
  again to finish. If Google's confirmation is cancelled, the backup is already gone, the device signs out, and signing in and
  deleting again removes the account itself.
- **Per-address storage.** Data saved in the browser belongs to one web address (see "Moving to the new domain").
- **Strava on an iPhone Home Screen app.** Strava's page opens in a separate browser; when it says "Connected", go back to the
  fred app and it picks up the connection by itself.

## Changing the domain

1. Change `APP_DOMAIN` in `index.html` (the only place the domain is written in code).
2. Set `FIREBASE_CONFIG.authDomain` to the same value.
3. Re-run `sh scripts/fetch-auth-helper.sh <firebase-project-id>` (it writes the new authDomain into `__/firebase/init.json`) and
   commit `__`.
4. Firebase > Authentication > Settings > Authorized domains: add the new domain (keep the old one while people move).
5. DNS CNAME for the new name → `marksmccabe-ctrl.github.io`, then GitHub Pages > Custom domain + Enforce HTTPS.
6. Mind per-address storage: signed-in people get their data back by signing in on the new address; others should export first.
7. Strava (if switched on): change `REDIRECT_URI` in `worker/fred-api.js` and the Worker's `ALLOWED_ORIGIN`, paste the Worker code
   again, and change "Authorization Callback Domain" in Strava's API settings.
