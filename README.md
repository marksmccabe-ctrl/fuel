# fred

Ride fueling from the forecast and your profile: how many bottles, what mix, how many gels, how much sodium, and what to wear.
It also keeps a Journal of rides (planned vs actual) and your Races (results, PRs, age-group percentiles, wins).

fred (lowercase, always) is one static page (`index.html`, all the code in one script), a service worker (`sw.js`) for offline use, a web manifest
and icons, published by GitHub Pages from `main`. There is no build step and no server of our own.
The app was called Bluebird Fuel before; saved data keeps its `bluebird.*` storage keys and backups keep `app: "bluebird-fuel"`,
so old devices and old backup files keep working.

Everything is saved in the browser (localStorage) first. Optionally, with a Firebase project configured, people can sign in with
Google to back up and sync their profile, closet, product library, last plan, Journal and Races across devices.

- With `FIREBASE_CONFIG = null` (the default), no Firebase code loads, there is no sign-in UI, and the app works exactly as it
  always has: nothing leaves the device.
- With a config, a "Back up and sync" card sits at the top of Profile. Saving a Journal entry or a race (and the race imports and
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
Before step 7, on each device you use: Journal > **Back up (export)** and Profile > Advanced > **Export races (JSON)**. After the move:
Journal > **Restore (import)** and **Import races (JSON)** on the new address (or sign in on the new address and import there once).

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

## Changing the domain

1. Change `APP_DOMAIN` in `index.html` (the only place the domain is written in code).
2. Set `FIREBASE_CONFIG.authDomain` to the same value.
3. Re-run `sh scripts/fetch-auth-helper.sh <firebase-project-id>` (it writes the new authDomain into `__/firebase/init.json`) and
   commit `__`.
4. Firebase > Authentication > Settings > Authorized domains: add the new domain (keep the old one while people move).
5. DNS CNAME for the new name → `marksmccabe-ctrl.github.io`, then GitHub Pages > Custom domain + Enforce HTTPS.
6. Mind per-address storage: signed-in people get their data back by signing in on the new address; others should export first.
