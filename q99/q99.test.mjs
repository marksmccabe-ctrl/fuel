// node q99.test.mjs <null.html> [main null.html]   (cd into this folder first) -- item 99: Your rider, and the rider on the Closet card.
// Every numbered point, QA line and decision (DECISIONS.md "Item 99"):
//   cache    sw.js CACHE and APP_BUILD match, v123 or later; the bundle is the design chat's v9 (FW.built 2026-11-20 17:38) or later (item
//            100 takes v9 first: a v8 page fails here), and each inlined block is that build byte for byte (its sha1 in BUILDS: a hand edit
//            fails; a newer build fails until its sha1 is added)
//   row      99.1: Settings › You has the row Your rider (a sheet row, searchable; with Settings on Running, a search for it names
//            the row under Cycling, one tap away, never a blank page; and back: on Cycling, a Running-only match is named under
//            Running; the button 4.5:1), "Not set" until a rider is built, then the jersey; it opens
//            the sheet titled Your rider with no "Saves as you type." line (a tap saves); the sheet's words are titles and labels only
//            (none painted by CSS either: review round 5); (review round 6) a search finds it by each decided word (avatar, look,
//            skin, hair, helmet, glasses, jersey, kit, shorts) with no rider built; (review round 7) several matches on the other side
//            ("closet" on Running: Your rider and Closet) read "2 under Cycling ›", and its button finds both and focuses the first
//   sheet    99.1: the live rider on top (FW.riderOutfit of the rider shown, ids aside; still), then Look / Gear / Kit (v-folds, closed the
//            first time, aria-expanded), each with a one-line summary that names the choices ("Coral jersey · dots · navy shorts"); every
//            option of every FW.RIDER_OPTIONS field is a button named from FW.RIDER_NAMES (or the option's own name) by aria-label, with
//            aria-pressed, exactly one pressed per group (the rider's value), each at least 44 x 44 px; each group is a group named by its
//            label (VoiceOver: the accessibility tree, Playwright's aria snapshot: every swatch's name, the pressed one pressed, inside
//            its labelled group); the jersey's fade and sleeves under More colours (hidden until opened, aria-expanded); lens and frame
//            hidden with no glasses; keyboard: one Tab stop per group (the pressed one), the arrow keys (left / right, up / down) move and
//            choose within it, wrapping at both ends; the live rider is on top (before the groups, above the first) and a still fwMount spot;
//            each swatch is painted its own option's colour (skin FW.SKIN, "Same as jersey" the jersey's) and no two swatches of a field
//            look alike, for every jersey ("Same as jersey" carries a ring of its own: a black jersey's fade has Black too); the pressed
//            choice is marked in normal colours (a ring on a swatch, a fill on a word); the Look summary reads per hair style ("dark brown
//            ponytail", "dark brown head covering": the bundle draws 'covered' as a covering, its colour field then "Covering colour");
//            the folds are remembered on this device (closed, reopened, reloaded); with Covered the six colours are a covering's (plain
//            colours: Rust and Gold, not Auburn and Blond, in the buttons' names, the field's name and the summary); no glasses: the Gear
//            summary says so; a typical rider's summaries are one line at 390 px (RIDER99's, the default's), the longest choices wrap to
//            two lines at most and are never cut (no ellipsis, nothing hidden: the round's 150% and 200% text); each swatch's edge stands out from the sheet (it, or the swatch, 3:1 against the panel: a White one on white);
//            the live rider follows each tap with the sheet still open (every jersey) and shows as painted (see "painted" below);
//            (review round 4) the live rider stays in view while choosing (stuck under the title bar: after a tap in each field, every
//            group open, it is wholly in view, redrawn, the button not under it; Tab and Shift+Tab never leave focus under it; at 390 px,
//            320 px with 200% text and the computer layout); with Covered the colour field and the Look summary name what it colours
//            ("Covering and beard colour", "black head covering and beard"); the glasses 'pair' reads "glasses" in the Gear summary; each
//            label is the bundle's name of the choice pressed; the pressed mark can be seen (the ring 3:1 on the panel, a word's fill 3:1
//            against an unpressed one and its words 4.5:1); the live rider is kept by its key (reopened, re-tapped, riderApply);
//            (review round 5) with Shaved the colour field is the beard's or mustache's ("Beard colour", "shaved head · grey beard"),
//            hidden with no face; a field is shown exactly when its choices draw different riders; the rider's size (80 x 120 below 700 px
//            of height) and room for a whole field beside or under it; (review round 6) each fold holds its decided fields in order and
//            each field's label is its own (LABELS; the accessibility tree's group names too); every two choices of a field shown draw
//            different riders as painted (PAIR; "Same as jersey" against the jersey's own colour allowed by name); every pattern reads on
//            every jersey and fade (PAT_SHOW; none held from v8 on: v7's misses, PAT_WAS, judged and printed beside v7's); a window too short
//            for a stuck rider and too narrow for the side column (320 x 256, 427 x 267) and a short computer layout (1280 x 400): the
//            rider scrolls with the choices, the whole view holds a field, taps and the keyboard stay clear of the title bar (fit);
//            (review round 7) the arrow keys in every field shown (the word groups, the colours, the fade and sleeves), not the jersey alone
//   build    99.2: settings.rider absent until built (opening and closing the sheet stores nothing; no DEFAULT_SETTINGS entry: absent at
//            boot, in the stored copy and in a fresh page's settings); a tap stores the whole rider (every bundle field, checked);
//            a rider built, closed (Done) and reopened is the same (every pressed swatch, summary and the live rider), and after a reload;
//            the row then names the jersey; right after the taps the live rider is the rider built; tapping the choice already pressed builds the rider (the default rider stored); not built,
//            the sheet names the default rider's choices (each field's name, the three summaries: face none, a plain jersey, shield glasses);
//            right after the taps each label is the bundle's name of the choice made
//   norm     99.2: riderNorm with tampered values for every field (a number, null, an object, an unknown string, '__proto__',
//            'constructor', 'toString', a near-miss colour) and a rider that is not an object: on load (stored on the device), on
//            restore (a backup) and when synced settings arrive (the cloud, the q91 Firebase stand-in): each tampered field is its
//            default, the others are kept, keys the bundle has no field for are gone; the sheet and the avatar draw that rider; no errors;
//            the merge itself (sfDocMerge) run again on the cloud copy pulled brings nothing new for the rider and queues no rider upload;
//            (review round 4) and a rider whose fields hold values another field offers (BAD_X: a jersey colour for the skin and the
//            helmet, a sleeve colour for the frame, a hair style for the glasses ...) is each field's default on load, restore and sync;
//            (review round 5) a stored copy with "__proto__": {"rider": ...} builds no rider; the cloud's rider null or deleted under a
//            newer stamp is no change (the rider built stands on both devices)
//   backup   99.5: a backup made here carries the rider (backupData, the app's own export) and brings it to a fresh page; a backup
//            from before item 99 (no settings.rider) restores without losing this device's rider (as birthday and gender);
//            a backup with a rider brings it; a tampered one draws the default; (review round 5) a file with "__proto__": {"rider": ...}
//            builds no rider on a device with none; a backup whose rider is null keeps this device's (on both devices and in the cloud)
//   sync     99.2, QA: two devices (the q91 Firebase stand-in): A builds a rider, B (not pulled yet) saves an unrelated setting, both
//            sync: A's rider on both and in the cloud, B's setting on both; the rider is one key (users/u1.settings.rider whole, one
//            settingsAt stamp, no dotted part of it written); then B changes the rider already built (two taps): B's whole rider on A, on
//            B and in the cloud, one stamp newer than A's, A's header circle redrawn; then A changes it while B (not pulled) saves an
//            unrelated setting: A's rider stands on both; (review round 6) the cloud's rider deleted or null under a newer stamp after an
//            edit B missed: the first device to pull puts its rider back stamped past the deletion, and A, B, a new device C and the cloud
//            end with one rider (A first: A's newer edit; B first: B's); (review round 7) A's header circle, redrawn in B's rider, never moves
//   private  99.5: the troubleshooting copy leaves the rider out (no rider key, none of its values, no strip); no AI prompt has it (every
//            prompt kind, and a static scan: the prompt builder reads no settings.rider); (review round 4) nor by name: every prompt is the
//            same with the rider as without it and holds none of its summaries or chosen names, and outside the rider's own code only the
//            functions RIDER_USERS names read it or call into it; (review round 5) the troubleshooting copy by name too: the same with the
//            rider as without it but for when, none of its summaries or names; the privacy note's "What's stored" names "your rider's look"
//   avatar   99.3: signed out: the outline (header) and the empty circle (#sbAv), built or not; signed in, not built: the initial; signed
//            in and built: the rider (FW.riderAvatar of the rider, ids aside) in the header circle at 32 px and in #sbAv at 30 px on the
//            computer layout, the initial kept under it (print and forced colours show it, no art); the same on the run (graphite);
//            the header's sync badge still follows the sync state with the rider in the circle (offline: data-st and the badge; back: synced);
//            #sbAv is kept by its key (offline, online and its re-renders draw nothing again); the header's rider is drawn once on a
//            signed-in load (one drawing from before sign-in is known through sign-in and the pulls); both avatars show as painted;
//            (review round 6) signing out in the session leaves the outline and #sbAv's empty circle, signing in again brings the rider
//            (drawn once) or the initial, at 390 px and on the computer layout, built and not; (review round 7) always still when the rider
//            changes: a tap in the sheet (its live rider and #sbAv beside it) and a restore (#sbAv, the header circle), watched every 100 ms
//   strip    99.4: hot, mild, cold, freezing and wet rides (each its own forecast) and a Hard freezing and a Recovery cold one (the effort
//            tapped), the starter closet and every catalog item, the default rider and the built one (RIDER99) on each: the
//            strip (#rRider, above the list, 100 x 150 px, aria-hidden, no text) gets exactly outfit()'s list (o.wear) with only string
//            ids FW.OUTFIT_LOOK has as its own, in its order; its drawing is FW.riderOutfit(rider, those ids) (ids aside); each item it
//            lists shows on it (leave-one-out at strip size, and its own colour where it has one: knee grey and the like), the under-
//            layers drawn by design as nothing aside (with v7 also wool socks under any foot cover, everything under the rain jacket,
//            a thermal jersey under any sleeved outer piece); nothing else is held (bundle v8) but ACCEPTED_V8 (bundle v8 accepted, Mark's
//            decision, below): every case v7 held (V7_GAPS, FROM-APP-CHAT-6
//            points 1-3: leg wear under overshoes, the shoe covers' own colour, dark gloves on deep brown skin; AWAIT, 6B points 6-7: the
//            dark jackets on Black and Navy jerseys, the thermal jersey in Black under the vest with arm warmers) is judged in full, must be
//            judged on a list the strip gets and is printed with its least measurement beside v7's (FIXED_BY_V8); every v6 gap v7 fixed is judged
//            (a ride or a direct list where no ride reaches it: the rain jacket over the jackets, a windbreaker over a thermal jersey,
//            the skullcap with glasses none, which leaves the eyes alone) and printed with its least measurement, and so is each
//            by-design rule's edge (wool socks with toe covers or bare shoes, the vest and a thermal jersey with no rain jacket or
//            sleeves over them); the detector's self-test: bib shorts (nothing in every version) not showing; the built rider and
//            every other skin are judged on the same lists (the default rider in that skin), and every jersey colour (both riders, the
//            direct lists too: review round 4); the strip
//            is kept by its key (re-rendered results draw nothing again); a rider changed while the results are up (in the sheet, by sync,
//            by a restore) redraws
//            the strip shown; a ride that warms (items shed on the way) lists them all; a closet item of your own and a tampered '__proto__' /
//            'constructor' closet id never reach the strip and never break it; the Clothing-only results (renderClothingOnly) have the strip
//            too, and it follows a closet change there; on every ride and closet the strip shows as painted (and on the computer layout);
//            a rider arriving by sync with the sheet open: the sheet (pressed, names, summaries, its live rider) and the row follow;
//            (review round 5) no words painted by CSS in the strip (its box only the drawing); wool socks are by design only where v8 draws
//            nothing (v8 check round 1): with knee warmers under any cover, or leg wear under overshoes or boots (over bare shins under any
//            cover and over leg wear above shoe covers they are judged: a closet with no leg wear on the cold, freezing, Hard freezing and
//            Recovery cold rides, the cold full list, and direct lists); (review round 6)
//            the strip centred in its box (within 1 px: here, the Clothing-only results, the computer layout and fit); (review round 7) every
//            list with an outer layer judged for both riders in every jersey with every other fade, sleeves, shorts and pattern (the wide
//            sweep); the strip built in the app for riders on which v7's dark jackets read poorly; (bundle v8) each item's own colour is
//            v8's (OWN: the covers #4F6478, the thermal jacket #5B4E9E, the winter jacket #2F6B4F; since item 100 v9's boots #B0343A; the gloves their fill, the #C9D1DA cuff
//            being shared by every glove and the overshoe hem; the thermal jersey the jersey's colour or its white cuff, which it alone draws);
//            (v8 check round 1) each former hold over its whole v7 width: every item of an entry and each part judged on a ride's list (each leg
//            wear under overshoes with and without wool socks: six more closets on the Hard freezing and Recovery cold rides, and direct lists in
//            every jersey and skin), and every rider of AWAIT's widths (the product of the fields it held: 192, 48 and 864 riders on each of the
//            default rider and RIDER99) on every list a ride gave where it holds; (v8 check round 2) the cases found on v7 and left unjudged
//            because no ride's list had them, which the app's strip gets (FOUND: boots with no wool socks and the leg wear above them, on the
//            freezing ride with closets without wool socks; wool socks under knee warmers with toe covers or bare shoes, on the wet ride and
//            a cool dry one with closets without leg warmers; direct lists for each in every jersey and skin), each judged on a ride's list;
//            and every item that shows within half again of SHOW (Chromium at 2x) measured again as other screens draw it (Chromium at 3x,
//            WebKit at 2x and 3x: Safari, an iPhone), against SHOW in CSS px (30 / 10 CSS px: 270 / 90 device px at 3x);
//            (bundle v8 accepted) item 99 ships on v8 (Mark's decision; FROM-APP-CHAT-7 asks the design chat for polish, a v9 a later
//            item takes): ACCEPTED_V8 named the six cases that read under SHOW on v8, each tied to its FROM-APP-CHAT-7 point and exactly as
//            wide as measured on v8 (its lists; per screen, item and skin). (item 100, bundle v9) v9 answers points 1-4: entries 1-5 (boots
//            over leg wear with no wool socks; leg wear above boots and above overshoes with no wool socks; wool socks under knee warmers
//            with toe covers or bare shoes; wool socks over leg wear above shoe covers at 3x) each printed "now shows" and "never under SHOW"
//            on every screen of its width on an otherwise green run, so they are gone and those cases are judged in full as any item (and
//            each case measured on every screen in every skin, FORMER_V8, so Safari and 3x keep judging them as item 99's q99 did on v8,
//            where they read close to the line; v9 check round 1: the v8 widths alone left fair skin's leg wear above boots out); one
//            entry is left, dark gloves on deep brown skin, read by their #C9D1DA cuff ("for the record", unchanged in v9). Inside its width a reading under SHOW passes
//            at or over the entry's floor for that item on that screen (90% of the item's least v8 reading there, pixels changed and own
//            colour separately: per item, since the fingerless gloves could lose their cuff over the full-finger gloves' floor), and
//            is measured on the other screens too; at SHOW it prints "now shows" (a note); every cell of each width must be judged; each
//            prints a note with its reading. Anything else under SHOW fails as before; SHOW, PAT_SHOW, OWN (but v9's boots, #B0343A) and the
//            by-design rules are unchanged. Q99_ACCEPT_DUMP=<file> measures the widths again (each entry as wide as its lists; every reading, one JSON line):
//            a measuring run with no widths or floors, so it always ends FAIL (its first strip check)
//   painted  (review round 3) the strip, the sheet's live rider and both avatars as the page paints them: the spot's svg screenshot at dpr 2
//            against FW.plain of the same drawing at that size on the colour behind it (at most 0.5% of the pixels more than 48 apart, the
//            strip at most 24 device px: a fifth of what an item needs to show, review round 5;
//            an avatar inside its circle) and nothing up the tree that hides or cuts it (opacity, visibility, clip-path, filter, mask)
//   still    the strip, the sheet's rider and both avatars never move: no .fwm-go, nothing running, with Reduce Motion, with the switch
//            off and on, seen, scrolled to and after a new app open
//   media    print: no strip, the avatars' initial, no sheet rider; forced colours (dark and light): no strip, the initial, no sheet rider,
//            every swatch keeps its colour with a CanvasText edge (the pressed one a Highlight ring), "Same as jersey" its ring, the pressed one ringed, the word buttons' pressed one marked
//   fit      320 px and 200% text: the sheet (every group open, More colours) has no sideways scroll, every button 44 px or more, nothing
//            past the sheet, no summary cut; the strip inside its card; the computer layout: the sheet is the pane beside the list, the strip in the
//            results column; the sheet's rider and the strip as painted at each of these sizes (review round 4); short screens (375 x 667,
//            and phones held sideways, 667 x 375 and 844 x 390 at 100% and 200% text): figView with the rider 80 x 120, the sheet fits
//   main     (with [main null.html]) main has no Your rider row and no strip (the row check fails there)
// Q99_ONLY=section,section runs some sections.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium, webkit } from 'playwright';
import { checker, open, reload } from '../lib/open.mjs';
import { crunch, toY, settle, weatherRouteFor, RIDER99 } from '../lib/screens.mjs';
import { Backend, syncPageSource } from '../q91/fbmock.mjs';

const PAGE = path.resolve(process.argv[2] || '../../fred99/null.html'), MAIN = process.argv[3] ? path.resolve(process.argv[3]) : null;
const ONLY = (process.env.Q99_ONLY || '').split(',').filter(Boolean);
const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = process.env.Q99_REPO || path.resolve(HERE, '../../wt-q99');
const C = checker('q99 '), ok = C.ok, ERRS = [];
const SRC = fs.readFileSync(PAGE, 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, ms = 15000, step = 100) { const t = Date.now(); let v; while (Date.now() - t < ms) { try { v = await fn(); } catch (e) { v = null; } if (v) return v; await sleep(step); } return v; }
const browser = await chromium.launch();

// the hooked copy (the rider's code lives inside the app's strict-mode function; this copy hands some of it out, as q97 and q98 do)
const HOOK = "\nObject.defineProperty(window,'__q99',{configurable:true,get(){ return {FWM, AOPEN, riderNorm, riderNow, riderIds, riderApply, outfit, readInputs, dbgDump, aiFill, AI_CARD, backupData, closetItemFromCatalog, CLOSET_CATALOG, CLOSET_STARTER, refreshResults, sbAcctRender, sfDocMerge, save, KEYS, DEFAULT_SETTINGS, get lastResult(){ return lastResult; }, get settings(){ return settings; }, set settings(v){ settings=v; }}; }});\n";
function hooked(page, name = 'q99-hook.html', hook = HOOK) { const src = fs.readFileSync(page, 'utf8'), k = src.indexOf("\n'use strict';\n"); if (k < 0) throw new Error("no 'use strict' line in " + page);
  const f = path.join(path.dirname(page), name), at = k + "\n'use strict';".length; fs.writeFileSync(f, src.slice(0, at) + hook + src.slice(at)); return f; }
const HOOKED = hooked(PAGE), MADE = [HOOKED];
const syncOf = f => { const g = f.replace(/\.html$/, '-sync.html'); fs.writeFileSync(g, syncPageSource(fs.readFileSync(f, 'utf8'))); MADE.push(g); return g; };
const SYNCED = syncOf(HOOKED);
// a copy that also records every drawing put in the header circle's .av-r (from the app's first line on, before sign-in is known): the
// avatar section's check that the header's rider is drawn once on a signed-in load and kept (review round 3)
const AVWATCH = HOOK + "new MutationObserver(R=>R.forEach(m=>{ if(m.target.nodeType===1 && m.target.matches('.hav>.av-r')) m.addedNodes.forEach(n=>{ if(n.nodeType===1 && n.matches('svg')) (window.__q99hav||(window.__q99hav=[])).push(n); }); })).observe(document.documentElement, {subtree:true, childList:true});\n";
const AVW = hooked(PAGE, 'q99-av.html', AVWATCH); MADE.push(AVW); const AVW_SYNCED = syncOf(AVW);

const NOW = '2026-10-29T15:00:00-07:00';
// the bundle builds this item may ship: the sha1 of each handoff file, trimmed (as fw-inline.mjs inlines it). v9 17:38, the build the
// independent check confirmed and item 100 takes first (probe100/verify-bundle7.json; handoff file sha1 js 3efc2de2..., css a621409b...).
// v8 14:45 (css e24007a5..., js 45548763...), item 99's, went with v9, as v7 went with v8: ACCEPTED_V8's entries 1-5 were v8's and are gone,
// so a v8 page is not this item any more (Item 100, Bundle v9)
const BUILDS = { '2026-11-20 17:38 EST': { css: 'bf5dc54651cc367cc2d0dfb0131a62d74d9690a0', js: '5b51b1e40b7938d290fb3f6a6d667ec790e0bcdf' } };
// a page: athlete A, the hooked copy, a made-up forecast (wx: its day's temperatures and rain), motion on unless o.motion === false
const openH = (o = {}) => open(o.file || HOOKED, Object.assign({ athlete: 'A', browser, motion: true, repo: REPO, now: NOW, settle: 600 }, o, {
  route: (r, u) => (o.route && o.route(r, u)) || (o.forecast === false ? null : weatherRouteFor(o.wx || {})(r, u)) })).then(x => { if (!o.noErrs) ERRS.push(x.errors); x.p.on('dialog', d => d.accept()); return x; });
const WHO = { uid: 'u1', email: 'u1@example.com', displayName: 'Test u1' };
const signedIn = () => ({ '__mock_user': WHO, '__mock_auth': 'u1', 'bluebird.owner.v1': { uid: 'u1', name: WHO.displayName, email: WHO.email, photo: '', signedIn: true } });
const synced = (be, o = {}) => openH(Object.assign({ file: o.file || SYNCED, settle: 1200 }, o, { storage: Object.assign(signedIn(), o.storage || {}), route: be.handler(o.label || 'a') }));
const LS = (p, k) => p.evaluate(n => { try { return JSON.parse(localStorage.getItem(n)); } catch (e) { return null; } }, k);
const stored = p => LS(p, 'bluebird.settings.v2').then(v => v || {});
const doc = be => be.fs.get('users/u1') || {};
async function nudge(pages, cond, ms = 45000) { const t = Date.now(); while (Date.now() - t < ms) { for (const pg of pages) await pg.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await sleep(1500); const v = await cond().catch(() => null); if (v) return v; } return null; }
const ready = async (be, ...xs) => { for (const x of xs) await until(() => x.p.evaluate(() => { const o = JSON.parse(localStorage.getItem('bluebird.synccursor.v1') || 'null'); return !!(o && o.full); }), 20000); await until(() => doc(be).settings, 15000); };

const FIELDS = Object.keys(RIDER99); // the bundle's rider fields (lib/screens.mjs RIDER99 sets every one)
const J = v => JSON.stringify(v, (k, x) => x && typeof x === 'object' && !Array.isArray(x) ? Object.keys(x).sort().reduce((o, n) => { o[n] = x[n]; return o; }, {}) : x); // equal by value, whatever the key order
const norm = h => String(h).replace(/\b(fw-[a-z]+)\d+/g, '$1#'); // a drawing's ids, numbered afresh by each FW call
// Settings › You › Your rider (the header's account button, or the sidebar's on the computer layout)
async function toSettings(p) { await p.click('#syncHdrIn:visible, #syncHdr:visible, #sbAcct:visible'); await until(() => p.evaluate(() => document.getElementById('view-profile').classList.contains('active'))); await settle(p, 150); }
async function sheet(p) { await toSettings(p); await p.click('#prowBtn-rider'); await until(() => p.evaluate(() => document.getElementById('setSheet').classList.contains('open') && !document.getElementById('prowB-rider').hidden)); await settle(p, 150); }
async function done(p) { await p.click('#setSheetDone'); await until(() => p.evaluate(() => !document.getElementById('setSheet').classList.contains('open'))); await settle(p, 100); }
async function group(p, g, open = true) { const h = '#rdGroups [data-fold="rider-' + g + '"] .v-fold-h'; if (((await p.getAttribute(h, 'aria-expanded')) === 'true') !== open) await p.click(h); }
async function allOpen(p) { for (const g of ['look', 'gear', 'kit']) await group(p, g); if ((await p.getAttribute('#rdMore', 'aria-expanded')) !== 'true') await p.click('#rdMore'); }
async function tap(p, k, v) { const s = `#rdGroups [data-rd="${k}"][data-v="${v}"]`; await p.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center' }), s); await p.click(s); }
// the sheet as shown: each field's pressed value(s), the shown names, the summaries, the live rider (normalised) and the rider it should be
const sheetOf = p => p.evaluate(F => { const pressed = {}, names = {};
  F.forEach(k => { pressed[k] = [...document.querySelectorAll(`#rdGroups [data-rd="${k}"][aria-pressed="true"]`)].map(b => b.dataset.v); const n = document.getElementById('rdN-' + k); names[k] = n ? n.textContent : null; });
  const sums = ['look', 'gear', 'kit'].map(g => (document.getElementById('rdS-' + g) || {}).textContent), fig = document.querySelector('#rdFig'), r = window.__q99 ? window.__q99.riderNow() : null;
  const nm = h => String(h).replace(/\b(fw-[a-z]+)\d+/g, '$1#');
  return { pressed, names, sums, title: document.getElementById('setSheetTitle').textContent, hint: !document.getElementById('setSaveHint').hidden, figSame: !!fig && !!r && nm(fig.innerHTML) === nm(Object.assign(document.createElement('div'), { innerHTML: window.FW.riderOutfit(r) }).innerHTML), fig: !!(fig && fig.querySelector('svg')), r }; }, FIELDS);
// what a rider's summaries say (the names from the bundle, as the app writes them)
// a head covering's colours are plain colours (the bundle's names are hair names: no "blond head covering")
const COVER = { '#C8743C': 'Rust', '#E9C46A': 'Gold' };
const sumsOf = (p, r) => p.evaluate(([r, COVER]) => { const n = k => { const o = FW.RIDER_OPTIONS[k]; return k === 'hair' && r.hairStyle === 'covered' && COVER[r[k]] || (Array.isArray(o) ? FW.RIDER_NAMES[k][r[k]] : o[r[k]]); }, lc = s => s.charAt(0).toLowerCase() + s.slice(1);
  // with Covered the bundle draws a beard or mustache in the covering's colour: "gold head covering and beard" (review round 4); the glasses
  // 'pair' is "glasses" ("pair" alone names nothing, folded or read out: review round 4); shaved hair is drawn as nothing under the helmet,
  // so its colour is the beard's or mustache's only: "shaved head", "shaved head · grey beard" (review round 5)
  const hs = r.hairStyle, bare = hs === 'shaved', hc = lc(n('hair')), fc = r.face !== 'none' ? (bare ? hc + ' ' : '') + lc(n('face')) : '', cov = hs === 'covered', hair = cov ? hc + ' head covering' + (fc ? ' and ' + fc : '') : bare ? 'shaved head' : hs === 'pony' || hs === 'braids' ? hc + ' ' + lc(n('hairStyle')) : lc(n('hairStyle')) + ' ' + hc + ' hair';
  return [`${n('skin')} skin · ${hair}${fc && !cov ? ' · ' + fc : ''}`, `${n('helmet')} helmet · ${r.glasses === 'none' ? 'no glasses' : (r.glasses === 'pair' ? 'glasses' : lc(n('glasses'))) + ' · ' + lc(n('lens')) + ' lens'}`, `${n('kit')} jersey · ${lc(n('pattern'))} · ${lc(n('shorts'))} shorts`]; }, [r, COVER]);
// the decided folds and labels (review round 6: nothing checked which fields each fold holds, or that a label belongs to its field: the face
// under Gear and the fade and sleeves' labels swapped both passed). Each fold's fields in order (Kit's last two under More colours); each
// field's label (the hair colour's when the style is not Covered or Shaved: those have their own forms, checked below)
const GROUPS = { look: ['skin', 'hairStyle', 'hair', 'face'], gear: ['helmet', 'glasses', 'lens', 'frame'], kit: ['kit', 'pattern', 'shorts', 'kit2', 'sleeve'] }, MORE = ['kit2', 'sleeve'];
const LABELS = { skin: 'Skin', hairStyle: 'Hair', hair: 'Hair colour', face: 'Face', helmet: 'Helmet', glasses: 'Glasses', lens: 'Lens', frame: 'Frame', kit: 'Jersey', pattern: 'Pattern', shorts: 'Shorts', kit2: 'Jersey fade', sleeve: 'Sleeves' };
// each field's chosen name for a rider (the bundle's names; a covering's colour plain)
const namesOf = (p, r) => p.evaluate(([r, F, COVER]) => Object.fromEntries(F.map(k => { const o = FW.RIDER_OPTIONS[k]; return [k, k === 'hair' && r.hairStyle === 'covered' && COVER[r[k]] || (Array.isArray(o) ? FW.RIDER_NAMES[k][r[k]] : o[r[k]])]; })), [r, FIELDS, COVER]);
// in the page: WCAG contrast (rgbOf an rgb()/rgba() string; over: a on b; bgOf: the first opaque background up the tree)
const CONTRAST = `const rgbOf=s=>(String(s).match(/[\\d.]+/g)||[]).map(Number), over=(a,b)=>{ const al=a.length>3?a[3]:1; return [0,1,2].map(i=>a[i]*al+b[i]*(1-al)); },
  lum=c=>{ const f=v=>{ v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4); }; return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]); },
  ratio=(a,b)=>{ const x=lum(a), y=lum(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); },
  bgOf=e=>{ for(let n=e;n&&n.nodeType===1;n=n.parentElement){ const c=rgbOf(getComputedStyle(n).backgroundColor); if(c.length&&(c.length<4||c[3]>0)) return c.slice(0,3); } return [255,255,255]; };`;

// the rider as painted (review round 3: the markup can be right while the page shows none of it, or half). The spot's svg is screenshot (the
// page at dpr 2) and set against the same drawing made plain (FW.plain) at that size on the colour behind it (the svg's own background
// first: an avatar's disc is a CSS background, not drawn in an <img>): the pixels more than 48 apart in a channel (the round's measure; an
// avatar inside its circle only, the corners being the page's). The screenshot takes 2 CSS px more on each side and the drawing is matched
// at the best of the device-pixel offsets up to 2 each way (a spot on a half pixel, #sbAv at y .5, is painted where Chromium snaps it).
// And up the tree from the svg, nothing that hides or cuts it: opacity, visibility, clip-path, filter, mask. what: 'strip'
// (FW.riderOutfit(rider, the strip's ids)), 'fig' (FW.riderOutfit(rider)) or an avatar's size (FW.riderAvatar(rider, size))
const PAINT = 0.005; // the share of the compared pixels that may be apart (the antialiased edges: the strip as built measured 0)
// the strip's own allowance (review round 5: 0.5% of it is 300 device px, more than some listed items change at all, so the wool socks could
// vanish from the painted strip and pass): at most a fifth of what an item needs to show (SHOW.d48, 120); as built 0-3
const STRIP_APART = 24;
async function paintOf(p, sel, what) {
  await p.evaluate(() => Promise.race([Promise.all(document.getAnimations().filter(a => a.playState === 'running' && isFinite(a.effect && a.effect.getComputedTiming().endTime)).map(a => a.finished.catch(() => {}))), new Promise(r => setTimeout(r, 2000))])); /* a sheet still sliding in */
  await p.evaluate(s => { const e = document.querySelector(s); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }); }, sel); await settle(p, 60);
  const rc = await p.evaluate(s => { const e = document.querySelector(s), r = e && e.getBoundingClientRect(); if (!r || !r.width || !r.height) return null;
    const x = Math.max(0, Math.floor(r.left) - 2), y = Math.max(0, Math.floor(r.top) - 2); return { x, y, width: Math.min(innerWidth, Math.ceil(r.right) + 2) - x, height: Math.min(innerHeight, Math.ceil(r.bottom) + 2) - y }; }, sel);
  if (!rc) return { none: true, sel };
  const shot = (await p.screenshot({ clip: rc })).toString('base64');
  await p.evaluate(`(()=>{ ${CONTRAST} window.__c={rgbOf, over, ratio, bgOf}; })()`);
  return p.evaluate(async ([s, what, b64, lim, clip, sa]) => { const e = document.querySelector(s), dpr = devicePixelRatio, rc = e.getBoundingClientRect(), W = Math.round(rc.width * dpr), H = Math.round(rc.height * dpr), r = window.__q99.riderNow(), C = window.__c;
    const mk = what === 'strip' ? FW.riderOutfit(r, document.getElementById('rRider')._ids || []) : what === 'fig' ? FW.riderOutfit(r) : FW.riderAvatar(r, +what), bg = C.bgOf(e);
    const img = async src => { const i = new Image(); i.src = src; await i.decode(); return i; }, data = (i, w, h, fill, sw, sh) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true });
      if (fill) { x.fillStyle = 'rgb(' + fill.join(',') + ')'; x.fillRect(0, 0, w, h); } x.drawImage(i, 0, 0, sw || w, sh || h); return x.getImageData(0, 0, w, h).data; };
    const si = await img('data:image/png;base64,' + b64), SW = si.naturalWidth, SH = si.naturalHeight, got = data(si, SW, SH);
    const want = data(await img('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(FW.plain(mk).replace(/<svg([^>]*)>/, (m, at) => '<svg' + at.replace(/\s(width|height)="[^"]*"/g, '') + ` width="${W}" height="${H}">`))), W, H, bg);
    const ox = Math.round((rc.left - clip.x) * dpr), oy = Math.round((rc.top - clip.y) * dpr), round = what !== 'strip' && what !== 'fig', R2 = Math.pow(W / 2 - 1, 2), inside = [];
    let ink = 0; for (let q = 0; q < W * H; q++) { const dx = q % W + 0.5 - W / 2, dy = Math.floor(q / W) + 0.5 - H / 2; if (round && dx * dx + dy * dy > R2) continue; inside.push(q); const i = q * 4; if (Math.max(Math.abs(want[i] - bg[0]), Math.abs(want[i + 1] - bg[1]), Math.abs(want[i + 2] - bg[2])) > 48) ink++; }
    let best = null; for (let ddy = -2; ddy <= 2; ddy++) for (let ddx = -2; ddx <= 2; ddx++) { let apart = 0;
      for (const q of inside) { const x = q % W + ox + ddx, y = Math.floor(q / W) + oy + ddy, i = q * 4; if (x < 0 || y < 0 || x >= SW || y >= SH) { apart++; continue; } const j = (y * SW + x) * 4;
        if (Math.max(Math.abs(got[j] - want[i]), Math.abs(got[j + 1] - want[i + 1]), Math.abs(got[j + 2] - want[i + 2])) > 48) apart++; }
      if (!best || apart < best.apart) best = { apart, at: [ddx, ddy] }; }
    const n = inside.length, apart = best.apart, hide = [];
    for (let t = e; t && t.nodeType === 1; t = t.parentElement) { const c = getComputedStyle(t), bad = [parseFloat(c.opacity) < 1 && 'opacity ' + c.opacity, c.visibility !== 'visible' && 'visibility ' + c.visibility, c.clipPath !== 'none' && 'clip-path ' + c.clipPath, c.filter !== 'none' && 'filter ' + c.filter, (c.maskImage || 'none') !== 'none' && 'mask ' + c.maskImage].filter(Boolean);
      if (bad.length) hide.push((t.id ? '#' + t.id : t.tagName.toLowerCase() + (t.classList.length ? '.' + [...t.classList].join('.') : '')) + ': ' + bad.join(', ')); }
    return { W, H, n, apart, at: best.at, ink, share: Math.round(apart / n * 10000) / 10000, hide, lim: what === 'strip' ? Math.min(Math.floor(n * lim), sa) : Math.floor(n * lim), ok: dpr === 2 && ink > n * 0.05 && apart <= (what === 'strip' ? Math.min(n * lim, sa) : n * lim) && !hide.length }; }, [sel, what, shot, PAINT, rc, STRIP_APART]); }
const painted = (P, tag) => ok(!!P && !P.none && P.ok, tag + ' (as painted at dpr 2: ' + (P && !P.none ? P.apart + ' of ' + P.n + ' device px more than 48 apart from FW.plain of it (at most ' + P.lim + ')' + (P.at[0] || P.at[1] ? ', matched ' + P.at.join(', ') + ' device px off' : '') + (P.hide.length ? '; hidden up the tree: ' + P.hide.join('; ') : '') : 'no svg') + ')', P);

// the live rider stays in view while the rider chooses (review round 4: it scrolled away with the groups, so a tap showed no change on
// screen): every group open and More colours (the folds stay as opened), each field's buttons brought into view the way the page does it
// (scrollIntoView nearest: the scroller's own padding), a real tap on a choice not pressed; then the rider must be wholly in the sheet's view
// (under its title bar, above its bottom and the tab bar), redrawn in that choice, and the button tapped not under it (not overlapping the
// rider's band: above the groups, or beside them on a phone held sideways). And the keyboard: Tab forward and back (Shift+Tab: the page
// scrolls up to what it focuses) through the sheet never leaves the focused control under the rider or the title bar. Review round 5: the
// rider's size per screen (o.size: 120 x 180, 80 x 120 below 700 px of height) and room for the choices: the view left beside or under the
// stuck rider holds a whole field (its label and its first row of buttons), every field. Review round 6: a window too short for that
// (o.stuck false: under 400 px of height and narrower than 480, the computer layout under 440) has the rider scroll with the choices: it is
// not stuck, the whole view holds a field, the button tapped is clear of the title bar and in view (the rider need not be), the keyboard too
async function figView(p, where, o = {}) {
  const stuck = o.stuck !== false;
  await allOpen(p); await settle(p, 100);
  const view = () => p.evaluate(() => { const sc = document.querySelector('#setSheet .set-sheet'), S = sc.getBoundingClientRect(), tb = document.querySelector('nav.tabs'), T = tb && tb.getClientRects().length ? tb.getBoundingClientRect() : null, F = document.querySelector('#rdFig svg').getBoundingClientRect(), B = document.getElementById('rdFig').getBoundingClientRect(), G = document.getElementById('rdGroups').getBoundingClientRect();
    return { top: Math.max(S.top, document.querySelector('#setSheet .set-top').getBoundingClientRect().bottom), bot: Math.min(S.bottom, innerHeight, T && T.top > innerHeight / 2 ? T.top : 1e9) /* the phone's tab bar at the bottom (on the computer layout nav.tabs is the side bar) */, F: { top: F.top, bottom: F.bottom, height: F.height, width: F.width }, band: { top: B.top, bottom: B.bottom, left: B.left, right: B.right }, figB: B.bottom, side: B.right <= G.left + 0.5, pos: getComputedStyle(document.getElementById('rdFig')).position }; });
  const under = (r, b, e) => r.bottom > b.top + e && r.top < b.bottom - e && r.right > b.left + e && r.left < b.right - e; /* a control's rect over the rider's band */
  // room for the choices: the sheet scrolled to its middle, the rider stuck; the view beside it (sideways) or under it, against each field's label and first row
  const RM = await p.evaluate(() => { const sc = document.querySelector('#setSheet .set-sheet'); sc.scrollTop = (sc.scrollHeight - sc.clientHeight) / 2;
    return [...document.querySelectorAll('#rdGroups .rd-f')].filter(f => f.getClientRects().length).map(f => { const t = f.getBoundingClientRect().top, b = f.querySelector('[data-rd]').getBoundingClientRect().bottom; return { k: f.dataset.rdF, need: Math.ceil(b - t) }; }); });
  await settle(p, 80); const V0 = await view(), room = Math.floor(V0.bot - (V0.side || !stuck ? V0.top : V0.figB)), need = Math.max(...RM.map(x => x.need));
  const sz = [Math.round(V0.F.width), Math.round(V0.F.height)];
  ok(room >= need && (!o.size || sz.join('x') === o.size.join('x')) && (V0.pos === 'sticky') === stuck, 'sheet: ' + where + ': the live rider is ' + sz.join(' x ') + (o.size ? ' (as decided: ' + o.size.join(' x ') + ')' : '') + (stuck ? ', stuck,' : ', not stuck (it scrolls with the choices),') + ' and leaves room for a whole field ' + (!stuck ? 'in the view' : V0.side ? 'beside it' : 'under it') + ' (' + room + ' px of view for ' + need + ': a label and its first row)', { room, need, size: sz, want: o.size, pos: V0.pos, stuck, V0, RM: RM.filter(x => x.need > room) });
  const fields = await p.evaluate(() => [...document.querySelectorAll('#rdGroups .rd-f')].filter(f => f.getClientRects().length).map(f => f.dataset.rdF)), bad = [], seen = [];
  for (const k of fields) {
    const v = await p.evaluate(k => { const f = document.querySelector(`#rdGroups [data-rd-f="${k}"]`), b = [...f.querySelectorAll('[data-rd]')].find(b => b.getAttribute('aria-pressed') !== 'true'); f.querySelector('.rd-sw').scrollIntoView({ block: 'nearest' }); return b ? b.dataset.v : null; }, k);
    if (v == null) continue; await settle(p, 60);
    await p.click(`#rdGroups [data-rd="${k}"][data-v="${v}"]`, { timeout: 5000 }).catch(e => bad.push({ k, v, click: String(e).split('\n')[0] })); await settle(p, 80);
    const V = await view(), m = await p.evaluate(([k, v]) => { const b = document.querySelector(`#rdGroups [data-rd="${k}"][data-v="${v}"]`).getBoundingClientRect(), r = window.__q99.riderNow(), nm = h => String(h).replace(/\b(fw-[a-z]+)\d+/g, '$1#');
      return { btn: { top: b.top, bottom: b.bottom, left: b.left, right: b.right }, chose: r[k] === v, same: nm(document.getElementById('rdFig').innerHTML) === nm(Object.assign(document.createElement('div'), { innerHTML: FW.riderOutfit(r) }).innerHTML) }; }, [k, v]);
    const vis = Math.max(0, Math.min(V.F.bottom, V.bot) - Math.max(V.F.top, V.top)) / V.F.height, clear = !under(m.btn, V.band, 1) && m.btn.bottom <= V.bot + 1 && m.btn.top >= V.top - 1; /* 1 px, as the keyboard's below: the scroll lands on whole pixels (375 x 667: the row 0.55 px past the tab bar's top, which sits 0.19 px over the sheet) */
    seen.push(k + ' ' + Math.round(vis * 100) + '%'); if ((stuck && vis < 0.99) || !clear || !m.chose || !m.same) bad.push({ k, v, vis: Math.round(vis * 1000) / 1000, fig: [Math.round(V.F.top), Math.round(V.F.bottom)], view: [Math.round(V.top), Math.round(V.bot)], btn: [m.btn.top, m.btn.bottom].map(Math.round), clear, chose: m.chose, same: m.same }); }
  ok(fields.length >= 12 && seen.length === fields.length && !bad.length, 'sheet: ' + where + (stuck ? ': the live rider stays in view while the rider chooses: after a tap in each field (every group open), it is wholly in the sheet\'s view, redrawn in the choice, and the button tapped is not under it (' : ': a real tap in each field (every group open) lands, the rider is redrawn in the choice and the button tapped is in view, clear of the title bar (the rider in view: ') + seen.join(', ') + ')', { bad: bad.slice(0, 4), fields });
  // the keyboard: forward from the first group's chosen button, then back
  const hid = [], walked = [], talls = [];
  for (const key of ['Tab', 'Shift+Tab']) { await p.evaluate(back => { const sc = document.querySelector('#setSheet .set-sheet'); sc.scrollTop = back ? sc.scrollHeight : 0; const L = [...document.querySelectorAll('#rdGroups [aria-pressed="true"]')].filter(b => b.getClientRects().length); (back ? L[L.length - 1] : L[0]).focus(); }, key !== 'Tab'); await settle(p, 60);
   for (let i = 0; i < 40; i++) { await p.keyboard.press(key); await settle(p, 40);
    const V = await view(), f = await p.evaluate(() => { const e = document.activeElement; if (!e || !e.closest('#prowB-rider')) return null; const r = e.getBoundingClientRect(); return { n: e.dataset.rd ? e.dataset.rd + ' ' + e.getAttribute('aria-label') : e.textContent.trim().slice(0, 20), top: r.top, bottom: r.bottom, left: r.left, right: r.right }; });
    if (!f) break; walked.push(f.n);
    /* a control taller than the free view (review round 6: a fold header with its summary at 200% text, 130-167 px, against 122-125 px of view
       on the short windows) can never be wholly clear: it must fill the free view (as much of it shows as the view can hold) */
    const ft = V.side || !stuck ? V.top : V.figB, free = V.bot - ft, tall = f.bottom - f.top > free + 1, shows = Math.min(f.bottom, V.bot) - Math.max(f.top, ft);
    if (tall ? shows < free - 1 : (under(f, V.band, 1) || f.top < V.top - 1 || f.bottom > V.bot + 1)) hid.push(Object.assign({ key, band: V.band, top0: V.top, bot: V.bot, tall, shows: Math.round(shows), free: Math.round(free) }, f)); else if (tall) talls.push(f.n.slice(0, 12) + ' ' + Math.round(f.bottom - f.top) + ' px'); } } /* 1 px: the scroll lands on whole pixels */
  ok(walked.length >= 20 && !hid.length, 'sheet: ' + where + ': Tab and Shift+Tab through the sheet never leave the focused control under the live rider or the title bar or past the view\'s bottom (' + walked.length + ' stops' + (talls.length ? '; taller than the free view, so filling it: ' + [...new Set(talls)].join(', ') : '') + ')', { hid: hid.slice(0, 4), walked: walked.length });
}

const sections = [];
const section = (n, f) => sections.push([n, f]);

section('cache', async () => {
  const swf = fs.readFileSync(path.join(path.dirname(PAGE), 'sw.js'), 'utf8');
  const b = (SRC.match(/const APP_BUILD='([^']+)'/) || [])[1], c = (swf.match(/const CACHE = '([^']+)'/) || [])[1];
  ok(!!b && b === c && +(b.match(/v(\d+)$/) || [])[1] >= 123, 'cache: APP_BUILD = sw.js CACHE, v123 or later', { b, c });
  const built = (/window\.FW = \{[^\n]*built: '([^']+)'/.exec(SRC) || [])[1], ver = (/window\.FW = \{ version: '(\d+)'/.exec(SRC) || [])[1];
  ok(!!built && built >= '2026-11-20 17:38 EST' && +ver >= 9, 'cache: the bundle is the design chat\'s v9 (17:38) or later (FW.version ' + ver + ', built ' + built + ')', { ver, built });
  // each block is the design chat's file byte for byte (as q97's byte check, which skips when the handoff folder holds a newer build): a
  // hand edit inside the bundle fails here whatever that folder holds; the item that takes a new build adds its sha1 here
  const sha = t => crypto.createHash('sha1').update(t).digest('hex'), blk = re => (re.exec(SRC) || [])[1];
  const css = blk(/<style id="fwCss">\n([\s\S]*?)\n<\/style>/), js = blk(/<script id="fwJs">\n([\s\S]*?)\n<\/script>/), want = BUILDS[built], got = { css: css && sha(css), js: js && sha(js) };
  ok(!!want && got.css === want.css && got.js === want.js, 'cache: each bundle block is the ' + built + ' build byte for byte (sha1 of the handoff files, trimmed: no hand edit)', { built, got, want: want || 'no sha1 here for this build' });
});

section('row', async () => {
  const x = await openH(), p = x.p;
  await toSettings(p);
  const R = await p.evaluate(() => { const b = document.getElementById('prowBtn-rider'), g = b && b.closest('.pgroup'); return b && { inYou: !!g && g.classList.contains('sg-you'), sheet: b.dataset.sheet, popup: b.getAttribute('aria-haspopup'), label: b.querySelector('.prow-l').textContent, v: document.getElementById('prowV-rider').textContent, kw: b.dataset.kw || '', h: b.getBoundingClientRect().height }; });
  ok(!!R && R.inYou && R.sheet === 'rider' && R.popup === 'dialog' && R.label === 'Your rider' && R.h >= 44, '99.1: Settings › You has the row Your rider (a sheet row, 44 px or more)', R);
  ok(!!R && R.v === 'Not set', 'row: "Not set" until a rider is built', R);
  // the words the row is searchable by (review round 6: only "avatar" was searched, so a row found by it alone passed), on a page with no
  // rider built (the row's value "Not set" matches none of them)
  const KW = ['avatar', 'look', 'skin', 'hair', 'helmet', 'glasses', 'jersey', 'kit', 'shorts'], found = [];
  for (const w of KW) { await p.fill('#setSearch', w); await settle(p, 150); if (await p.evaluate(() => { const r = document.querySelector('.prow[data-prow="rider"]'); return !!r && !r.classList.contains('sf-out') && r.getClientRects().length > 0; })) found.push(w); }
  ok(found.length === KW.length && R && R.v === 'Not set', 'row: a settings search finds it by each decided word (' + found.join(', ') + ' of ' + KW.join(', ') + ')', { missed: KW.filter(w => !found.includes(w)) });
  await p.fill('#setSearch', ''); await settle(p, 150);
  await p.click('#prowBtn-rider'); await until(() => p.evaluate(() => document.getElementById('setSheet').classList.contains('open'))); await settle(p, 200);
  const S = await sheetOf(p);
  ok(S.title === 'Your rider' && !S.hint, 'row: the sheet is titled Your rider, with no "Saves as you type." line (each tap saves)', { title: S.title, hint: S.hint });
  // the sheet's words: titles and labels only (item 76): the group titles, their summaries, each field's label and chosen name, More colours, the buttons' names
  await allOpen(p);
  const W = await p.evaluate(F => { const sh = document.getElementById('prowB-rider'), known = new Set(['Look', 'Gear', 'Kit', 'More colours']);
    ['look', 'gear', 'kit'].forEach(g => known.add(document.getElementById('rdS-' + g).textContent));
    F.forEach(k => { known.add(document.getElementById('rdL-' + k).textContent); known.add(document.getElementById('rdN-' + k).textContent); });
    sh.querySelectorAll('[data-rd]').forEach(b => { if (b.textContent) known.add(b.textContent); });
    const out = []; const walk = n => { if (n.nodeType === 3) { const t = n.nodeValue.trim(); if (t && !known.has(t)) out.push(t); } else if (n.nodeType === 1 && n.tagName !== 'svg') n.childNodes.forEach(walk); }; walk(sh);
    /* and words painted by CSS (review round 5: a ::before line passed): every pseudo-element in the sheet's part, the part itself too, holds no words */
    [sh, ...sh.querySelectorAll('*')].forEach(e => ['::before', '::after'].forEach(w => { const c = getComputedStyle(e, w).content; if (!['none', 'normal', '""', "''"].includes(c) && /[A-Za-z0-9]/.test(c.replace(/url\([^)]*\)/g, '').replace(/counter\([^)]*\)/g, ''))) out.push((e.id || e.className || e.tagName) + w + ' ' + c); })); return out; }, FIELDS);
  ok(!W.length, 'row: the sheet has no explanation line (its words: group titles, summaries, labels, names, More colours; none painted by CSS)', W);
  await x.close();
  // Settings on Running (the sport set to Run): the row is on the Cycling side; a search for it names it there, one tap away (never a blank page)
  for (const desk of [false, true]) { const y = await openH({ width: desk ? 1280 : 390, height: desk ? 800 : 844 }), q = y.p, where = desk ? ' (computer layout)' : '';
    await q.click('#sportBtn'); await q.click('#sportMenu [data-sport=run]'); await until(() => q.evaluate(() => document.documentElement.classList.contains('run-theme'))); await toSettings(q); await settle(q, 200);
    await q.fill('#setSearch', 'rider'); await settle(q, 200);
    const sideOf = () => q.evaluate(() => { const n = document.getElementById('setNoMatch'), b = n.querySelector('button[data-set-sport]'), rows = [...document.querySelectorAll('#setList .prow')].filter(r => r.getClientRects().length).map(r => r.dataset.prow);
      return { side: (document.querySelector('#setSport .on') || {}).dataset?.setSport, shown: !n.hidden && n.getClientRects().length > 0, text: n.textContent, btn: b ? b.textContent : null, bh: b ? b.getBoundingClientRect().height : 0, rows, focus: document.activeElement && document.activeElement.id }; });
    const R1 = await sideOf();
    ok(R1.side === 'run' && R1.shown && R1.rows.length === 0 && R1.text.startsWith('No Running settings match “rider”.') && R1.btn === 'Your rider is under Cycling ›' && R1.bh >= 44, 'row: Settings on Running' + where + ': a search for "rider" says no Running setting matches and names Your rider under Cycling (a 44 px button), never a blank page', R1);
    // the button's words: AA on what is behind them (its size is body text: 4.5:1)
    const CB = await q.evaluate(`(()=>{ ${CONTRAST} const b=document.querySelector('#setNoMatch button[data-set-sport]'), c=getComputedStyle(b), bg=bgOf(b), fg=over(rgbOf(c.color), bg);
      return { color: c.color, bg: 'rgb(' + bg.join(', ') + ')', px: parseFloat(c.fontSize), w: c.fontWeight, ratio: Math.round(ratio(fg, bg) * 100) / 100 }; })()`);
    ok(CB.ratio >= 4.5, 'row: Settings on Running' + where + ': the button "Your rider is under Cycling ›" is 4.5:1 or more on its background (' + CB.ratio + ':1)', CB);
    await q.click('#setNoMatch button[data-set-sport]'); await settle(q, 200); const R2 = await sideOf();
    ok(R2.side === 'ride' && !R2.shown && R2.rows.join() === 'rider' && R2.focus === 'prowBtn-rider', 'row: Settings on Running' + where + ': that button turns Settings to Cycling with the row found and focused', R2);
    await q.fill('#setSearch', 'zzqx'); await settle(q, 150); const R3 = await sideOf();
    ok(R3.shown && R3.text === 'No Cycling settings match “zzqx”.' && R3.btn === null, 'row: a search with no match on either side: the plain line, no button' + where, R3);
    // and back: on Cycling, a search only Running's Carry matches ("flask") names it under Running; its button turns Settings to Running
    // and focuses that row
    await q.fill('#setSearch', 'flask'); await settle(q, 200); const R4 = await sideOf();
    ok(R4.side === 'ride' && R4.shown && R4.rows.length === 0 && R4.text.startsWith('No Cycling settings match “flask”.') && R4.btn === 'Carry is under Running ›' && R4.bh >= 44, 'row: Settings on Cycling' + where + ': a search only Running matches ("flask") names Carry under Running (a 44 px button)', R4);
    await q.click('#setNoMatch button[data-set-sport]'); await settle(q, 200); const R5 = await sideOf();
    ok(R5.side === 'run' && !R5.shown && R5.rows.join() === 'runcarry' && R5.focus === 'prowBtn-runcarry', 'row: Settings on Cycling' + where + ': that button turns Settings to Running with Carry found and focused', R5);
    // several matches on the other side (review round 7: only single matches were searched, so a line naming one row of two passed): on
    // Running, "closet" matches Your rider and Closet under Cycling: "2 under Cycling ›" (the decided form), a 44 px button that turns Settings
    // to Cycling with both rows found and the first focused
    await q.fill('#setSearch', 'closet'); await settle(q, 200); const R6 = await sideOf();
    ok(R6.side === 'run' && R6.shown && R6.rows.length === 0 && R6.text === 'No Running settings match “closet”. 2 under Cycling ›' && R6.btn === '2 under Cycling ›' && R6.bh >= 44, 'row: Settings on Running' + where + ': a search two Cycling rows match ("closet") says "2 under Cycling ›" (a 44 px button), never one row\'s name', R6);
    await q.click('#setNoMatch button[data-set-sport]'); await settle(q, 200); const R7 = await sideOf();
    ok(R7.side === 'ride' && !R7.shown && R7.rows.length === 2 && R7.rows[0] === 'rider' && R7.focus === 'prowBtn-' + R7.rows[0], 'row: Settings on Running' + where + ': that button turns Settings to Cycling with both rows found (' + R7.rows.join(', ') + ') and the first focused', R7);
    await y.close(); }
});

section('sheet', async () => {
  const x = await openH({ settings: { rider: RIDER99 }, dpr: 2 }), p = x.p;
  await sheet(p);
  const F0 = await p.evaluate(() => ['look', 'gear', 'kit'].map(g => { const s = document.querySelector(`#rdGroups [data-fold="rider-${g}"]`), h = s && s.querySelector('.v-fold-h'), b = s && s.querySelector('.v-fold-b');
    return s && { cls: s.classList.contains('v-fold'), exp: h.getAttribute('aria-expanded'), ctl: h.getAttribute('aria-controls') === b.id, hid: b.hidden, t: s.querySelector('.v-fold-t').textContent }; }));
  ok(F0.every(Boolean) && F0.map(f => f.t).join() === 'Look,Gear,Kit' && F0.every(f => f.cls && f.exp === 'false' && f.hid && f.ctl), '99.1: Look / Gear / Kit, each a fold (closed the first time, aria-expanded false, aria-controls its body)', F0);
  const S = await sheetOf(p), want = await sumsOf(p, RIDER99);
  ok(S.sums.join('|') === want.join('|'), '99.1: folded, each group shows its one-line summary naming the choices (' + S.sums.join(' / ') + ')', { S: S.sums, want });
  ok(S.sums[2] === 'Coral jersey · dots · navy shorts', '99.1: the Kit summary reads as the spec\'s ("Coral jersey · dots · navy shorts" for this rider)', S.sums[2]);
  // the glasses 'pair' reads "glasses" in the Gear summary and in the fold button's name (review round 4: "pair" alone, read out, named nothing)
  const GN = await p.evaluate(() => document.querySelector('#rdGroups [data-fold="rider-gear"] .v-fold-h').textContent.replace(/\s+/g, ' ').trim());
  ok(S.sums[1] === 'Coral helmet · glasses · green lens' && GN === 'Gear' + S.sums[1] && !/(^|· )pair( ·|$)/.test(S.sums[1]), 'sheet: the Gear summary names the glasses ("' + S.sums[1] + '": never "pair" alone), folded and as the fold button\'s name', { sum: S.sums[1], name: GN });
  // each field's label shows the bundle's name of the value pressed (review round 4: the names were compared only with each other after a change)
  const N99 = await namesOf(p, RIDER99);
  ok(FIELDS.every(k => S.names[k] === N99[k] && S.pressed[k].length === 1 && S.pressed[k][0] === RIDER99[k]), 'sheet: each field\'s label shows the bundle\'s name of the choice pressed (' + FIELDS.map(k => S.names[k]).join(', ') + ')', { names: S.names, want: N99 });
  ok(S.fig && S.figSame, '99.1: the live rider on top is FW.riderOutfit of the rider shown (ids aside)', S);
  painted(await paintOf(p, '#rdFig svg', 'fig'), 'sheet: the live rider shows');
  const FG = await p.evaluate(() => { const f = document.getElementById('rdFig'), g = document.getElementById('rdGroups'), g1 = g.querySelector('.rd-g'), rec = window.__q99.FWM.get(f);
    return { before: !!(f.compareDocumentPosition(g) & Node.DOCUMENT_POSITION_FOLLOWING), figB: Math.round(f.getBoundingClientRect().bottom), g1T: Math.round(g1.getBoundingClientRect().top), fwm: f.classList.contains('fwm'), s: rec ? rec.s : null }; });
  ok(FG.before && FG.figB <= FG.g1T && FG.fwm && FG.s === true, '99.1: the live rider is on top (before the groups in the page, its bottom above the first group) and a still fwMount spot (o.still)', FG);
  const one = await p.evaluate(() => { const b = document.querySelector('#rdGroups .v-fold-h'), r = b.getBoundingClientRect(), s = document.getElementById('rdS-look'); return { h: r.height, lines: Math.round(s.getBoundingClientRect().height / parseFloat(getComputedStyle(s).lineHeight)) }; });
  ok(one.h >= 44 && one.lines === 1, 'sheet: a folded group is one header (44 px or more) with its summary on one line at 390 px', one);
  // every option, named, pressed: in the DOM
  const B = await p.evaluate(F => F.map(k => { const o = FW.RIDER_OPTIONS[k], L = Array.isArray(o) ? o : Object.keys(o), bs = [...document.querySelectorAll(`#rdGroups [data-rd="${k}"]`)], g = bs[0] && bs[0].parentElement, lab = g && document.getElementById(g.getAttribute('aria-labelledby'));
    return { k, opts: L, vals: bs.map(b => b.dataset.v), names: bs.map(b => b.getAttribute('aria-label')), want: L.map(v => Array.isArray(o) ? FW.RIDER_NAMES[k] && FW.RIDER_NAMES[k][v] : o[v]), pressed: bs.filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.v),
      ap: bs.every(b => ['true', 'false'].includes(b.getAttribute('aria-pressed'))), tag: bs.every(b => b.tagName === 'BUTTON' && b.type === 'button'), role: g && g.getAttribute('role'), all: bs.every(b => b.parentElement === g), label: lab && lab.textContent, col: k === 'skin' || Array.isArray(o), sw: bs.every(b => b.classList.contains(k === 'skin' || Array.isArray(o) ? 'rd-c' : 'rd-t')) }; }), FIELDS);
  for (const b of B) {
    ok(b.vals.join('|') === b.opts.join('|') && b.names.join('|') === b.want.join('|') && b.want.every(n => typeof n === 'string' && n), 'sheet: ' + b.k + ': every FW.RIDER_OPTIONS value is a button named from the bundle (' + b.names.join(', ') + ')', b);
    ok(b.tag && b.ap && b.pressed.length === 1 && b.pressed[0] === RIDER99[b.k], 'sheet: ' + b.k + ': buttons with aria-pressed, exactly one pressed (the rider\'s ' + JSON.stringify(RIDER99[b.k]) + ')', b);
    ok(b.role === 'group' && b.all && b.label === LABELS[b.k] && b.sw, 'sheet: ' + b.k + ': in a group of their own named by its label, the field\'s own ("' + b.label + '"; decided: "' + LABELS[b.k] + '")' + (b.col ? ', colour swatches' : ', word buttons'), b);
  }
  // each fold holds exactly its decided fields, in order (review round 6): Look skin, hair style, hair colour, face; Gear helmet, glasses, lens,
  // frame; Kit jersey, pattern, shorts, then the fade and sleeves under More colours; each summary is checked against sumsOf, which builds it
  // from its own group's fields only, so a summary part from a field in another fold fails there
  const FD = await p.evaluate(() => Object.assign(Object.fromEntries(['look', 'gear', 'kit'].map(g => [g, [...document.querySelectorAll(`#rdGroups [data-fold="rider-${g}"] .rd-f`)].map(f => f.dataset.rdF)])), { more: [...document.querySelectorAll('#rdMoreB .rd-f')].map(f => f.dataset.rdF), all: [...document.querySelectorAll('#rdGroups .rd-f')].length }));
  ok(Object.keys(GROUPS).every(g => J(FD[g]) === J(GROUPS[g])) && J(FD.more) === J(MORE) && FD.all === FIELDS.length, 'sheet: each fold holds its decided fields in order (' + Object.keys(GROUPS).map(g => g + ': ' + FD[g].join(', ')).join('; ') + '; More colours: ' + FD.more.join(', ') + ')', { FD, want: GROUPS });
  const kitL0 = B.find(b => b.k === 'kit').opts;
  const noName = B.flatMap(b => b.want.map((n, i) => n ? null : b.k + ' ' + JSON.stringify(b.opts[i]))).filter(Boolean);
  ok(!noName.length, 'sheet: every option has a name in the bundle (none missing)', noName);
  // More colours: the fade and sleeves, hidden until opened
  await allOpen(p); await p.click('#rdMore'); await settle(p, 100);
  const M0 = await p.evaluate(() => ({ exp: document.getElementById('rdMore').getAttribute('aria-expanded'), hid: document.getElementById('rdMoreB').hidden, in: ['kit2', 'sleeve'].every(k => !!document.querySelector(`#rdMoreB [data-rd="${k}"]`)), main: ['kit', 'pattern', 'shorts'].every(k => !document.querySelector(`#rdMoreB [data-rd="${k}"]`)), kitGroup: !!document.querySelector('[data-fold="rider-kit"] #rdMoreB'), ctl: document.getElementById('rdMore').getAttribute('aria-controls') }));
  await p.click('#rdMore'); await settle(p, 100);
  const M1 = await p.evaluate(() => ({ exp: document.getElementById('rdMore').getAttribute('aria-expanded'), hid: document.getElementById('rdMoreB').hidden, shown: document.getElementById('rdMoreB').getClientRects().length > 0, txt: document.getElementById('rdMore').textContent }));
  ok(M0.exp === 'false' && M0.hid && M0.in && M0.main && M0.kitGroup && M0.ctl === 'rdMoreB' && M1.exp === 'true' && !M1.hid && M1.shown && M1.txt === 'More colours', '99.1: the extra kit colours (the jersey\'s fade and sleeves) are under More colours in Kit, hidden until it is opened', { M0, M1 });
  // 44 px
  const sz = await p.evaluate(() => [...document.querySelectorAll('#prowB-rider button')].filter(b => b.getClientRects().length).map(b => { const r = b.getBoundingClientRect(); return { n: b.getAttribute('aria-label') || b.textContent.trim(), w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 }; }).filter(b => b.w < 44 || b.h < 44));
  ok(!sz.length, '99.1: every button in the sheet is at least 44 x 44 px (swatches, words, folds, More colours)', sz);
  // each swatch is painted its own option's colour (skin: FW.SKIN; "Same as jersey": the jersey's), and no two in a field look alike (colour
  // and mark: "Same as jersey" is a ring), for every jersey (a black jersey's fade offers Black too)
  await p.evaluate(`(()=>{ ${CONTRAST} window.__c={rgbOf, over, ratio, bgOf}; })()`);
  // each swatch's edge stands out from the sheet in normal colours: the edge (over the swatch) or the swatch itself 3:1 against the panel
  // (WCAG 1.4.11: a White jersey, helmet, frame or sleeves on the white sheet is seen by its edge alone)
  const swOf = () => p.evaluate(() => { const rgb = h => 'rgb(' + [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(', ') + ')', r = window.__q99.riderNow(), out = {};
    document.querySelectorAll('#rdGroups .rd-sw').forEach(g => { const bs = [...g.querySelectorAll('.rd-c')]; if (!bs.length) return; const k = bs[0].dataset.rd;
      out[k] = bs.map(b => { const v = b.dataset.v, c = getComputedStyle(b), want = k === 'skin' ? FW.SKIN[v][0] : v || r.kit; const C = window.__c, panel = C.bgOf(b.parentElement), sw = C.rgbOf(c.backgroundColor), e = C.over(C.rgbOf(c.borderTopColor), c.backgroundClip === 'border-box' ? sw : panel);
        return { v, bg: c.backgroundColor, want: rgb(want), mark: c.backgroundImage !== 'none', edge: parseFloat(c.borderTopWidth) >= 1 && c.borderTopStyle !== 'none' && (C.ratio(e, panel) >= 3 || C.ratio(sw, panel) >= 3), ec: c.borderTopColor }; }); });
    return { kit: r.kit, out }; });
  const swBad = W => Object.entries(W.out).flatMap(([k, L]) => { const look = L.map(b => b.bg + (b.mark ? '+ring' : '')), bad = [];
    L.forEach(b => { if (b.bg !== b.want) bad.push(k + ' ' + JSON.stringify(b.v) + ' painted ' + b.bg + ' not ' + b.want); if (b.mark !== (b.v === '')) bad.push(k + ' ' + JSON.stringify(b.v) + (b.mark ? ' marked' : ' has no mark of its own')); if (!b.edge) bad.push(k + ' ' + JSON.stringify(b.v) + ': its edge (' + b.ec + ') does not stand out from the sheet'); });
    if (new Set(look).size !== L.length) bad.push(k + ': two swatches look alike (' + look.filter((x, i) => look.indexOf(x) !== i).join(', ') + ')'); return bad; });
  const W0 = await swOf(), swN = Object.keys(W0.out).length;
  ok(swN === 9 && !swBad(W0).length, 'sheet: every swatch is painted its own option\'s colour (skin FW.SKIN, the rest their value, "Same as jersey" the jersey\'s), no two in a field look alike, and its edge stands out from the sheet (3:1, the edge or the swatch: a White one on white) (' + swN + ' fields)', { bad: swBad(W0), fields: Object.keys(W0.out) });
  const kitBad = [];
  const figBad = []; /* the live rider follows each tap, the sheet still open (review round 3: it was compared only on a sheet just opened) */
  for (const v of kitL0) { await tap(p, 'kit', v); await settle(p, 60); const W = await swOf(); swBad(W).forEach(b => kitBad.push(v + ': ' + b)); const F = await sheetOf(p); if (!F.figSame || F.r.kit !== v) figBad.push(v); }
  painted(await paintOf(p, '#rdFig svg', 'fig'), 'sheet: after a tap (the ' + kitL0[kitL0.length - 1] + ' jersey), the live rider shows in it');
  await tap(p, 'kit', RIDER99.kit); await settle(p, 60);
  ok(!figBad.length, '99.1: the live rider follows each tap: for each of the ' + kitL0.length + ' jerseys tapped, the sheet still open, its drawing is FW.riderOutfit of the rider in that jersey', figBad);
  kitBad.sort((a, b) => /alike/.test(b) - /alike/.test(a)); /* the look-alikes first */
  ok(!kitBad.length, 'sheet: for each of the ' + kitL0.length + ' jerseys, "Same as jersey" (the fade, the sleeves) is the jersey\'s colour with a ring of its own, never one more disc like the field\'s own colour (a Black jersey\'s Black)', kitBad.slice(0, 6));
  // the pressed choice is marked in normal colours: a ring on a swatch, a fill on a word button (not only in forced colours)
  const PV = await p.evaluate(() => { const cs = b => { const c = getComputedStyle(b); return { sh: c.boxShadow, bg: c.backgroundColor, co: c.color }; }, out = [];
    document.querySelectorAll('#rdGroups .rd-sw').forEach(g => { if (!g.getClientRects().length) return; const on = g.querySelector('[aria-pressed="true"]'), off = g.querySelector('[aria-pressed="false"]'); if (!on || !off) return;
      out.push({ k: on.dataset.rd, sw: on.classList.contains('rd-c'), on: cs(on), off: cs(off) }); }); return out; });
  const pvBad = PV.filter(x => x.sw ? !(x.on.sh !== 'none' && x.on.sh !== x.off.sh) : !(x.on.bg !== x.off.bg && x.on.co !== x.off.co));
  ok(PV.filter(x => x.sw).length >= 8 && PV.filter(x => !x.sw).length >= 4 && !pvBad.length, 'sheet: the pressed choice is marked in normal colours: a ring on the pressed swatch, a fill and colour on the pressed word button (' + PV.length + ' groups)', { pvBad, sample: PV.slice(0, 2) });
  // and the mark can be seen (review round 4: a ring in the panel's own colour passed; WCAG 1.4.11, as the swatches' edges): the pressed
  // swatch's outer ring (its widest shadow, wider than the rest) 3:1 against the panel; the pressed word button's fill 3:1 against the
  // unpressed one's (or the panel), its words 4.5:1 on it
  const PC = await p.evaluate(() => { const C = window.__c, out = [], parts = s => s === 'none' ? [] : s.split(/,(?![^(]*\))/).map(x => { const c = (x.match(/rgba?\([^)]*\)/) || [''])[0], n = x.replace(c, '').trim().split(/\s+/).map(parseFloat); return { c: C.rgbOf(c), spread: n[3] || 0 }; }), r2 = v => Math.round(v * 100) / 100;
    document.querySelectorAll('#rdGroups .rd-sw').forEach(g => { if (!g.getClientRects().length) return; const on = g.querySelector('[aria-pressed="true"]'), off = g.querySelector('[aria-pressed="false"]'); if (!on || !off) return;
      const panel = C.bgOf(g), c = getComputedStyle(on), co = getComputedStyle(off), k = on.dataset.rd;
      if (on.classList.contains('rd-c')) { const L = parts(c.boxShadow), o = L.reduce((a, b) => !a || b.spread > a.spread ? b : a, null), wider = !!o && L.every(x => x === o || x.spread <= o.spread - 1.5);
        out.push({ k, sw: true, shadow: c.boxShadow, ring: o && o.c.length >= 3 ? r2(C.ratio(C.over(o.c, panel), panel)) : 0, wider }); }
      else { const fon = C.over(C.rgbOf(c.backgroundColor), panel), foff = C.over(C.rgbOf(co.backgroundColor), panel), tx = C.over(C.rgbOf(c.color), fon);
        out.push({ k, sw: false, fill: r2(Math.max(C.ratio(fon, foff), C.ratio(fon, panel))), text: r2(C.ratio(tx, fon)) }); } }); return out; });
  const pcBad = PC.filter(x => x.sw ? !(x.wider && x.ring >= 3) : !(x.fill >= 3 && x.text >= 4.5));
  ok(PC.filter(x => x.sw).length >= 8 && PC.filter(x => !x.sw).length >= 4 && !pcBad.length, 'sheet: the pressed mark can be seen: each pressed swatch\'s outer ring 3:1 against the panel (' + [...new Set(PC.filter(x => x.sw).map(x => x.ring))].join(', ') + ':1), each pressed word button\'s fill 3:1 against an unpressed one (' + [...new Set(PC.filter(x => !x.sw).map(x => x.fill))].join(', ') + ':1) and its words 4.5:1 on it (' + [...new Set(PC.filter(x => !x.sw).map(x => x.text))].join(', ') + ':1)', { pcBad, sample: PC.slice(0, 2) });
  // the Look summary per hair style (the bundle draws 'covered' as a head covering in the colour: its field is then "Covering colour")
  const HS = [];
  for (const v of ['pony', 'braids', 'covered', 'short']) { await tap(p, 'hairStyle', v); await settle(p, 60); HS.push(await p.evaluate(() => [document.getElementById('rdS-look').textContent, document.getElementById('rdL-hair').textContent, document.getElementById('rdL-hair').closest('.rd-f').querySelector('[role=group]').getAttribute('aria-labelledby')])); }
  await tap(p, 'hairStyle', RIDER99.hairStyle); await settle(p, 60);
  ok(HS.map(h => h[0]).join('|') === 'Deep brown skin · black ponytail · beard|Deep brown skin · black braids · beard|Deep brown skin · black head covering and beard|Deep brown skin · short black hair · beard' && HS.map(h => h[1]).join() === 'Hair colour,Hair colour,Covering and beard colour,Hair colour' && HS.every(h => h[2] === 'rdL-hair'),
    'sheet: the Look summary reads per hair style ("black ponytail", "black braids", "black head covering and beard", "short black hair"); with Covered and a beard the colour field is "Covering and beard colour" (its group named so: the bundle draws the beard in the covering\'s colour)', HS);
  // with Covered, the colour field and the summary say what it colours: the covering alone with no face, the mustache too with one
  // (review round 4: "Covering colour" hid that it sets the beard's colour too)
  const CF = []; await tap(p, 'hairStyle', 'covered');
  for (const f of ['none', 'stache', 'beard']) { await tap(p, 'face', f); await settle(p, 60); CF.push(await p.evaluate(() => [document.getElementById('rdL-hair').textContent, document.getElementById('rdS-look').textContent, document.getElementById('rdL-hair').closest('.rd-f').querySelector('[role=group]').getAttribute('aria-labelledby')])); }
  await tap(p, 'hairStyle', RIDER99.hairStyle); await tap(p, 'face', RIDER99.face); await settle(p, 60);
  ok(CF.map(c => c[0]).join() === 'Covering colour,Covering and mustache colour,Covering and beard colour' && CF.map(c => c[1]).join('|') === 'Deep brown skin · black head covering|Deep brown skin · black head covering and mustache|Deep brown skin · black head covering and beard' && CF.every(c => c[2] === 'rdL-hair'),
    'sheet: with Covered the colour field names what it colours ("Covering colour"; with a mustache or a beard "Covering and mustache colour", "Covering and beard colour"), and so does the Look summary ("black head covering and beard")', CF);
  // with Covered the six colours are a covering's: plain colour names (Rust and Gold, not Auburn and Blond) in the buttons, the field's name
  // and the summary; back to hair, the hair names
  const hairNames = () => p.evaluate(() => [...document.querySelectorAll('#rdGroups [data-rd="hair"]')].map(b => b.getAttribute('aria-label')));
  await tap(p, 'hairStyle', 'covered'); await settle(p, 60); const CV = { names: await hairNames(), each: [] };
  for (const h of await p.evaluate(() => FW.RIDER_OPTIONS.hair)) { await tap(p, 'hair', h); await settle(p, 60);
    CV.each.push(await p.evaluate(() => [document.getElementById('rdS-look').textContent, document.getElementById('rdN-hair').textContent])); }
  const CVw = await p.evaluate(([r, COVER]) => FW.RIDER_OPTIONS.hair.map(h => COVER[h] || FW.RIDER_NAMES.hair[h]), [RIDER99, COVER]);
  await tap(p, 'hairStyle', RIDER99.hairStyle); await tap(p, 'hair', RIDER99.hair); await settle(p, 60); const CV1 = await hairNames(), HN = await p.evaluate(() => FW.RIDER_OPTIONS.hair.map(h => FW.RIDER_NAMES.hair[h]));
  ok(CV.names.join() === CVw.join() && CVw.join() === 'Black,Dark brown,Brown,Rust,Gold,Grey' && CV.each.map(e => e[0]).join('|') === CVw.map(c => 'Deep brown skin · ' + c.toLowerCase() + ' head covering and beard').join('|') && CV.each.map(e => e[1]).join() === CVw.join() && CV1.join() === HN.join(),
    'sheet: with Covered the colours are a covering\'s (' + CV.names.join(', ') + '): the buttons\' names, the field\'s chosen name and the summary ("rust head covering", never "blond head covering"); back to hair, the hair names (' + CV1.join(', ') + ')', { CV, CVw, CV1 });
  // Shaved (review round 5): the bundle draws shaved hair as nothing under the helmet (the rider always wears one), so the colour field
  // sets only the beard or mustache: with no face it hides (as lens and frame do with no glasses; the stored colour kept) and the summary
  // says "shaved head"; with a face it is "Beard colour" / "Mustache colour" (its group named so) and the summary "shaved head · black beard"
  const SV = []; await tap(p, 'hairStyle', 'shaved');
  for (const f of ['none', 'stache', 'beard']) { await tap(p, 'face', f); await settle(p, 60); SV.push(await p.evaluate(() => { const l = document.getElementById('rdL-hair'), fd = l.closest('.rd-f'); return [l.textContent, document.getElementById('rdS-look').textContent, fd.getClientRects().length > 0, fd.querySelector('[role=group]').getAttribute('aria-labelledby'), window.__q99.riderNow().hair]; })); }
  const SVc = []; for (const h of await p.evaluate(() => FW.RIDER_OPTIONS.hair)) { await tap(p, 'hair', h); await settle(p, 60); SVc.push(await p.evaluate(() => document.getElementById('rdS-look').textContent)); }
  const SVw = await p.evaluate(() => FW.RIDER_OPTIONS.hair.map(h => 'Deep brown skin · shaved head · ' + FW.RIDER_NAMES.hair[h].toLowerCase() + ' beard'));
  await tap(p, 'hair', RIDER99.hair); await tap(p, 'hairStyle', RIDER99.hairStyle); await tap(p, 'face', RIDER99.face); await settle(p, 60);
  ok(SV.map(v => v[0]).join() === 'Hair colour,Mustache colour,Beard colour' && SV.map(v => v[1]).join('|') === 'Deep brown skin · shaved head|Deep brown skin · shaved head · black mustache|Deep brown skin · shaved head · black beard' && SV.map(v => v[2]).join() === 'false,true,true' && SV.every(v => v[3] === 'rdL-hair' && v[4] === RIDER99.hair) && SVc.join('|') === SVw.join('|') && J(await sumsOf(p, Object.assign({}, RIDER99, { hairStyle: 'shaved', face: 'none' }))) === J([SV[0][1], (await sumsOf(p, RIDER99))[1], (await sumsOf(p, RIDER99))[2]]),
    'sheet: with Shaved the colour field follows what the bundle draws: hidden with no face (the stored colour kept), "Mustache colour" / "Beard colour" with one; the Look summary "' + SV[0][1] + '", "' + SV[2][1] + '" (each colour named: ' + SVc.length + ')', { SV, SVc, SVw });
  // and in general: a field is shown exactly when its choices draw different riders (none whose taps change nothing on the rider, none
  // hidden that would), for the riders the sheet reaches (RIDER99, Shaved with no face and with a beard, Covered, the shield, no glasses)
  const DR = [];
  for (const st of PAIR_STATES) {
    for (const [k, v] of Object.entries(st)) await tap(p, k, v); await allOpen(p); await settle(p, 60);
    DR.push(...(await p.evaluate(st => { const r = window.__q99.riderNow(), nm = h => String(h).replace(/\b(fw-[a-z]+)\d+/g, '$1#');
      return [...document.querySelectorAll('#rdGroups .rd-f')].map(f => { const k = f.dataset.rdF, o = FW.RIDER_OPTIONS[k], L = Array.isArray(o) ? o : Object.keys(o), n = new Set(L.map(v => nm(FW.riderOutfit(Object.assign({}, r, { [k]: v }))))).size;
        return { st: JSON.stringify(st), k, shown: f.getClientRects().length > 0, n }; }); }, st)));
    for (const k of Object.keys(st)) await tap(p, k, RIDER99[k]); }
  await allOpen(p); const drBad = DR.filter(d => d.shown !== (d.n > 1));
  ok(DR.length >= 13 * 6 && !drBad.length, 'sheet: a field is shown exactly when its choices draw different riders (' + DR.filter(d => !d.shown).map(d => d.k + ' in ' + d.st).join(', ') + ' hidden; every other field\'s choices draw ' + Math.min(...DR.filter(d => d.shown).map(d => d.n)) + ' riders or more)', drBad);
  // and choice by choice (review round 6: a field drawing 3 riders or more passed with one choice drawing what another does: the chest band
  // on a Coral jersey is the jersey's own colour): in each field shown, every two choices draw different riders as painted (PAIR), for the
  // same six riders; allowed by name: "Same as jersey" (the fade, the sleeves) against the jersey's own colour (bundle v8: no pattern is
  // skipped any more; PAT_AWAIT's were until v8)
  const PB = [], PA = [], pairMin = {};
  for (const st of PAIR_STATES) { const r = Object.assign({}, RIDER99, st), shown = DR.filter(d => d.st === JSON.stringify(st) && d.shown).map(d => d.k);
    const G = await p.evaluate(([r, shown]) => shown.map(k => { const o = FW.RIDER_OPTIONS[k]; return { k, L: Array.isArray(o) ? o : Object.keys(o) }; }), [r, shown]);
    const D = await riderDiffs(p, G.map(g => ({ riders: g.L.map(v => Object.assign({}, r, { [g.k]: v })), all: true })));
    G.forEach((g, n) => D[n].forEach(([i, j, d8, d24, d48]) => { const a = g.L[i], b = g.L[j], tag = g.k + ' ' + JSON.stringify(a) + ' / ' + JSON.stringify(b) + ' in ' + JSON.stringify(st);
      const differ = d8 >= PAIR.d8 || d48 >= PAIR.d48;
      if (!differ && (g.k === 'kit2' || g.k === 'sleeve') && ((a === '' && b === r.kit) || (b === '' && a === r.kit))) { PA.push(tag + ': the jersey\'s own colour (by name)'); return; }
      if (!pairMin[g.k] || d8 < pairMin[g.k][0]) pairMin[g.k] = [d8, d48, tag]; /* the closest pairs judged */
      if (!differ) PB.push({ tag, d: [d8, d24, d48] }); })); }
  ok(!PB.length, 'sheet: in each field shown, every two choices draw different riders as painted (at least ' + PAIR.d8 + ' device px more than 8 apart, or ' + PAIR.d48 + ' more than 48; the closest: ' + Object.entries(pairMin).sort((a, b) => a[1][0] - b[1][0]).slice(0, 3).map(([k, v]) => v[2] + ' ' + v[0] + ' / ' + v[1]).join(', ') + ')' + (PA.length ? '; allowed: ' + PA.join('; ') : ''), PB.slice(0, 6));
  // every pattern reads on every jersey and fade (review round 6): against Plain at the sheet's size, for the default rider and RIDER99, at
  // least PAT_SHOW device px more than 48 apart (the v8 ask's measure); nothing held (bundle v8): v7's misses (PAT_WAS, held in PAT_AWAIT
  // until v8) are judged as every other and printed with their least, v7's beside it, and each must be judged
  const PM = [], PW = new Map(), [D0, PATS, KITS0, FADES0] = await p.evaluate(() => [FW.RIDER_DEFAULT, Object.keys(FW.RIDER_OPTIONS.pattern), FW.RIDER_OPTIONS.kit, FW.RIDER_OPTIONS.kit2]);
  for (const [who, base] of [['the default rider', D0], ['RIDER99', RIDER99]]) {
    const combos = KITS0.flatMap(kit => FADES0.map(kit2 => Object.assign({}, base, { kit, kit2 })));
    const D = await riderDiffs(p, combos.map(c => ({ riders: PATS.map(v => Object.assign({}, c, { pattern: v })), all: false })));
    combos.forEach((c, n) => D[n].forEach(([i, j, d8, d24, d48]) => { const v = PATS[j], key = v + ' ' + c.kit + ' ' + JSON.stringify(c.kit2), w = PAT_WAS.find(g => g.pattern === v && g.on.some(([k, f]) => k === c.kit && f === c.kit2));
      if (w) { const h = PW.get(w) || { n: 0, least: [Infinity, ''] }; h.n++; if (d48 < h.least[0]) h.least = [d48, key + ' (' + who + ')']; PW.set(w, h); }
      if (d48 < PAT_SHOW) PM.push(key + ' (' + who + '): ' + d48 + ' device px more than 48 apart (' + d24 + ' more than 24)'); })); }
  for (const w of PAT_WAS) { const h = PW.get(w); console.log('  note: held on v7 (PAT_AWAIT, FROM-APP-CHAT-6B point 8), judged on v8: pattern ' + w.pattern + ': ' + w.what + ' -> v8: judged ' + (h ? h.n + ' times, the least ' + h.least[0] + ' device px more than 48 apart (' + h.least[1] + ')' : '0 times')); }
  ok(!PM.length && PAT_WAS.every(w => PW.has(w)), 'sheet: every pattern reads on every jersey and fade (' + (PATS.length - 1) + ' patterns x ' + KITS0.length + ' jerseys x ' + FADES0.length + ' fades, both riders: at least ' + PAT_SHOW + ' device px more than 48 apart from Plain at the sheet\'s size), none held (v7\'s misses judged: ' + PAT_WAS.map(w => w.pattern + ' ' + (PW.has(w) ? PW.get(w).least[0] : 'never')).join(', ') + ')', { misses: PM.slice(0, 8) });
  // the accessibility tree (what VoiceOver reads): each group by its label, each swatch by its name, the chosen one pressed
  const snap = await p.locator('#rdGroups').ariaSnapshot();
  const ax = B.map(b => { const lab = LABELS[b.k], i = snap.indexOf('- group "' + lab + '"'); if (i < 0) return { k: b.k, group: false }; /* the decided label (review round 6: looked up by the page's own label, two swapped labels passed) */
    const seg = snap.slice(i).split('\n').slice(1).filter(l => /^\s+- button/.test(l)).slice(0, b.opts.length);
    return { k: b.k, group: true, names: seg.map(l => (/button "([^"]*)"/.exec(l) || [])[1]), pressed: seg.filter(l => /\[pressed\]/.test(l)).map(l => (/button "([^"]*)"/.exec(l) || [])[1]), want: b.want, wantP: b.want[b.opts.indexOf(RIDER99[b.k])] }; });
  const axBad = ax.filter(a => !a.group || a.names.join('|') !== a.want.join('|') || a.pressed.length !== 1 || a.pressed[0] !== a.wantP);
  ok(!axBad.length, 'QA: VoiceOver reads each swatch\'s name: the accessibility tree has every group by its decided label (LABELS), every button by its name and the chosen one pressed (' + ax.length + ' groups)', { axBad: axBad.slice(0, 3), snap: snap.slice(0, 400) });
  // lens and frame hide with no glasses, and come back
  await tap(p, 'glasses', 'none'); await settle(p, 100);
  const G0 = await p.evaluate(() => ['lens', 'frame'].map(k => document.querySelector(`[data-rd-f="${k}"]`).getClientRects().length));
  const GS = [await p.evaluate(() => document.getElementById('rdS-gear').textContent), (await sumsOf(p, Object.assign({}, RIDER99, { glasses: 'none' })))[1]];
  ok(GS[0] === GS[1] && GS[1] === 'Coral helmet · no glasses', 'sheet: with no glasses the Gear summary says so ("' + GS[0] + '": no glasses, no lens)', GS);
  await tap(p, 'glasses', 'pair'); await settle(p, 100);
  const G1 = await p.evaluate(() => ['lens', 'frame'].map(k => document.querySelector(`[data-rd-f="${k}"]`).getClientRects().length));
  ok(G0.every(n => !n) && G1.every(n => n > 0), 'sheet: lens and frame are hidden with no glasses (the drawing has none) and back with a pair', { G0, G1 });
  // keyboard: one Tab stop per group (the pressed one); the arrows move and choose within it
  const K0 = await p.evaluate(() => [...document.querySelectorAll('#rdGroups [role=group]')].filter(g => g.getClientRects().length).map(g => [...g.querySelectorAll('button')].filter(b => b.tabIndex === 0).map(b => b.getAttribute('aria-pressed'))));
  ok(K0.length >= 10 && K0.every(t => t.length === 1 && t[0] === 'true'), 'sheet: keyboard: one Tab stop per group, its pressed button (the others tabindex -1)', K0);
  // from the first jersey: ArrowLeft wraps to the last, ArrowRight wraps back to the first, ArrowDown / ArrowUp are next / previous; each
  // focused, pressed, stored and named
  const kitL = kitL0, NK = kitL.length; await tap(p, 'kit', kitL[0]); await settle(p, 60); await p.focus('#rdGroups [data-rd="kit"][aria-pressed="true"]');
  const KS = [];
  for (const [key, want] of [['ArrowLeft', kitL[NK - 1]], ['ArrowRight', kitL[0]], ['ArrowDown', kitL[1]], ['ArrowUp', kitL[0]], ['ArrowRight', kitL[1]]]) { await p.keyboard.press(key); await settle(p, 80);
    KS.push(Object.assign({ key, want }, await p.evaluate(w => ({ f: document.activeElement.dataset.v, k: document.activeElement.dataset.rd, p: document.activeElement.getAttribute('aria-pressed'), s: JSON.parse(localStorage.getItem('bluebird.settings.v2')).rider.kit, n: document.getElementById('rdN-kit').textContent, wn: FW.RIDER_NAMES.kit[w] }), want))); }
  await p.keyboard.press('Tab'); await settle(p, 50);
  const K3 = await p.evaluate(() => ({ k: document.activeElement.dataset.rd, p: document.activeElement.getAttribute('aria-pressed') }));
  ok(KS.every(x => x.k === 'kit' && x.f === x.want && x.p === 'true' && x.s === x.want && x.n === x.wn) && K3.k === 'pattern' && K3.p === 'true',
    'sheet: keyboard: from the first jersey ArrowLeft wraps to the last and ArrowRight back to the first, ArrowDown / ArrowUp choose the next / previous (focused, pressed, stored, named); Tab goes on to the next group\'s chosen button', { KS: KS.filter(x => x.f !== x.want || x.s !== x.want || x.p !== 'true'), K3 });
  // and in every other field (review round 7: only the jersey was pressed, so word groups whose arrows chose nothing passed): each field shown
  // (RIDER99 with a pair of glasses: all of them, More colours open), from its first choice the same five keys, each focused, pressed, stored and
  // named (the label's name as the bundle's, for the rider stored); then the rider's own choice again
  await allOpen(p); const KF = [];
  for (const b of B) { if (b.k === 'kit') continue; const L = b.opts, N = L.length;
    if (!(await p.evaluate(k => { const f = document.querySelector(`#rdGroups [data-rd-f="${k}"]`); return !!f && f.getClientRects().length > 0; }, b.k))) { KF.push({ k: b.k, shown: false }); continue; }
    await tap(p, b.k, L[0]); await settle(p, 60); await p.focus(`#rdGroups [data-rd="${b.k}"][aria-pressed="true"]`);
    for (const [key, want] of [['ArrowLeft', L[N - 1]], ['ArrowRight', L[0]], ['ArrowDown', L[1]], ['ArrowUp', L[0]], ['ArrowRight', L[1]]]) { await p.keyboard.press(key); await settle(p, 80);
      const v = await p.evaluate(k => { const a = document.activeElement, r = JSON.parse(localStorage.getItem('bluebird.settings.v2')).rider; return { f: a.dataset.v, k: a.dataset.rd, p: a.getAttribute('aria-pressed'), r, n: (document.getElementById('rdN-' + k) || {}).textContent }; }, b.k), wn = (await namesOf(p, v.r))[b.k];
      KF.push({ k: b.k, key, want, shown: true, good: v.k === b.k && v.f === want && v.p === 'true' && v.r[b.k] === want && v.n === wn, got: [v.k, v.f, v.p, v.r[b.k], v.n, wn] }); }
    await tap(p, b.k, RIDER99[b.k]); await settle(p, 60); }
  const KFbad = KF.filter(x => !x.shown || !x.good), KFn = new Set(KF.filter(x => x.shown).map(x => x.k)).size;
  ok(!KFbad.length && KFn === B.length - 1, 'sheet: keyboard: in every other field (' + KFn + ': the word groups, the colours, More colours\' fade and sleeves) from its first choice ArrowLeft wraps to the last and ArrowRight back to the first, ArrowDown / ArrowUp choose the next / previous (focused, pressed, stored, named)', KFbad.slice(0, 6));
  // the longest choices of each group (at 390 px: 372, 278 and 339 px of text in 299 px) wrap to a second line, never cut (no ellipsis,
  // nothing hidden), and the whole summary is the fold button's name (what VoiceOver reads)
  const LONG = Object.assign({}, RIDER99, { skin: 'deep', hairStyle: 'covered', hair: '#5A3B2A', face: 'stache', helmet: '#179BCC', glasses: 'shield', lens: '#F2763A', kit: '#179BCC', pattern: 'band', shorts: '#3048B4' });
  for (const k of FIELDS) await tap(p, k, LONG[k]);
  const LS1 = await p.evaluate(() => ['look', 'gear', 'kit'].map(g => { const s = document.getElementById('rdS-' + g), h = s.closest('.v-fold-h'); const c = getComputedStyle(s); return { t: s.textContent, lines: Math.round(s.getBoundingClientRect().height / parseFloat(c.lineHeight)), cut: c.textOverflow === 'ellipsis' || s.scrollWidth > s.clientWidth + 1 || s.scrollHeight > s.clientHeight + 1, name: h.textContent.replace(/\s+/g, ' ').trim() }; })), LW = await sumsOf(p, LONG);
  ok(LS1.every((s, i) => s.t === LW[i] && s.lines >= 1 && s.lines <= 2 && !s.cut && s.name.includes(LW[i])), 'sheet: the longest choices (' + LW.join(' / ') + ') take two lines at most at 390 px, never cut, the whole summary the fold button\'s name', LS1);
  await figView(p, '390 px', { size: [120, 180] });
  // the sheet's live rider is kept by its key (review round 4: only the strip and the avatars were checked): closed, reopened, the pressed
  // choice tapped again and riderApply (what every synced settings change runs) leave the same drawing, nothing redrawn
  await p.evaluate(() => { const f = document.getElementById('rdFig'); f.querySelector('svg').__q99 = 1; window.__q99fig = 0; new MutationObserver(r => { window.__q99fig += r.length; }).observe(f, { subtree: true, childList: true }); });
  await done(p); await sheet(p); await group(p, 'kit'); await p.click('#rdGroups [data-rd="kit"][aria-pressed="true"]'); await settle(p, 100); await p.evaluate(() => window.__q99.riderApply()); await settle(p, 100);
  const FK = await p.evaluate(() => { const s = document.querySelector('#rdFig svg'); return { same: !!s && s.__q99 === 1, muts: window.__q99fig }; });
  ok(FK.same && FK.muts === 0, 'sheet: the live rider is kept by its key: the sheet closed and reopened, the pressed choice tapped again and riderApply run leave the same drawing (nothing redrawn)', FK);
  await x.close();
  // the folds are remembered on this device: Look opened stays open (closed, reopened, after a reload), Gear and Kit stay closed
  { const y = await openH({ settings: { rider: RIDER99 } }), q = y.p, fo = () => q.evaluate(() => ['look', 'gear', 'kit'].map(g => document.querySelector(`#rdGroups [data-fold="rider-${g}"] .v-fold-h`).getAttribute('aria-expanded')).join());
    await sheet(q); await group(q, 'look'); const f0 = await fo(); await done(q); await sheet(q); const f1 = await fo(); await done(q);
    await reload(q); await settle(q, 400); await sheet(q); const f2 = await fo();
    ok(f0 === 'true,false,false' && f1 === f0 && f2 === f0, 'sheet: the folds are remembered on this device: Look opened stays open when the sheet is closed and reopened and after a reload, Gear and Kit stay closed', { f0, f1, f2 });
    await y.close(); }
});

section('build', async () => {
  const x = await openH(), p = x.p;
  const D = await p.evaluate(() => ({ def: 'rider' in window.__q99.DEFAULT_SETTINGS, mem: 'rider' in window.__q99.settings, ls: 'rider' in JSON.parse(localStorage.getItem('bluebird.settings.v2')) }));
  ok(!D.def && !D.mem && !D.ls, '99.2: settings.rider absent on a fresh page: no DEFAULT_SETTINGS entry, none in memory, none stored', D);
  await sheet(p); const S0 = await sheetOf(p);
  ok(S0.r && Object.keys(S0.r).every(k => S0.r[k] === S0.pressed[k][0]) && S0.figSame && (await p.evaluate(() => JSON.stringify(window.__q99.riderNow()) === JSON.stringify(FW.RIDER_DEFAULT))), 'build: not built, the sheet shows the bundle\'s default rider (FW.RIDER_DEFAULT)', S0);
  // and names it: each field's chosen name and the three summaries (the default's face none, plain jersey and shield glasses: the spec's
  // "Coral jersey · plain · black shorts" shape)
  const DEF0 = await p.evaluate(() => FW.RIDER_DEFAULT), N0 = await namesOf(p, DEF0), U0 = await sumsOf(p, DEF0);
  ok(FIELDS.every(k => S0.names[k] === N0[k] && !!N0[k]), 'build: not built, each field\'s label shows the default rider\'s chosen name (' + FIELDS.map(k => S0.names[k]).join(', ') + ')', { names: S0.names, want: N0 });
  const L0 = await p.evaluate(() => ['look', 'gear', 'kit'].map(g => { const s = document.getElementById('rdS-' + g); return Math.round(s.getBoundingClientRect().height / parseFloat(getComputedStyle(s).lineHeight)); }));
  ok(L0.every(n => n === 1), 'build: not built, each of the default rider\'s summaries is one line at 390 px', L0);
  ok(S0.sums.join('|') === U0.join('|') && U0.join('|') === 'Light skin · short dark brown hair|Black helmet · shield · purple lens|Bluebird blue jersey · plain · black shorts', 'build: not built, the summaries name the default rider\'s choices (' + S0.sums.join(' / ') + ': no face named, "plain", the shield)', { S: S0.sums, want: U0 });
  await allOpen(p); await done(p); await sheet(p); await done(p);
  const D1 = await p.evaluate(() => ({ mem: 'rider' in window.__q99.settings, ls: 'rider' in JSON.parse(localStorage.getItem('bluebird.settings.v2')), row: document.getElementById('prowV-rider').textContent }));
  ok(!D1.mem && !D1.ls && D1.row === 'Not set', '99.2: opening, unfolding and closing the sheet stores nothing (settings.rider still absent, the row "Not set")', D1);
  // build: a tap on each field (the order a rider would take)
  await sheet(p); await allOpen(p);
  await tap(p, 'skin', 'brown'); const one = (await stored(p)).rider;
  const DEF = await p.evaluate(() => FW.RIDER_DEFAULT);
  ok(!!one && Object.keys(one).join() === Object.keys(DEF).join() && one.skin === 'brown' && Object.keys(one).every(k => k === 'skin' || one[k] === DEF[k]), 'build: the first tap stores the whole rider (every bundle field: the tapped one, the rest the defaults)', one);
  const B = Object.assign({}, RIDER99, { skin: 'olive', hairStyle: 'braids', hair: '#C8743C', face: 'stache', helmet: '#179BCC', glasses: 'shield', lens: '#F2763A', frame: '#F26B5B', kit: '#2ABCBB', pattern: 'chevron', shorts: '#E06AAE', kit2: '#5F6A12', sleeve: '#BECC41' });
  for (const k of FIELDS) await tap(p, k, B[k]);
  const S1 = await sheetOf(p), want = await sumsOf(p, B), st1 = (await stored(p)).rider;
  ok(S1.figSame && J(S1.r) === J(Object.assign({}, await p.evaluate(() => FW.RIDER_DEFAULT), B)), '99.1: right after the taps, the sheet still open, the live rider is the rider built (FW.riderOutfit of it)', { figSame: S1.figSame, r: S1.r });
  ok(JSON.stringify(st1) === JSON.stringify(Object.assign({}, await p.evaluate(() => FW.RIDER_DEFAULT), B)), 'build: every tap is stored (settings.rider is the rider built)', st1);
  ok(S1.sums.join('|') === want.join('|'), 'QA: the summaries name the choices (' + S1.sums.join(' / ') + ')', { S: S1.sums, want });
  const NB = await namesOf(p, B); /* review round 4: after a change the names were compared only with each other */
  ok(FIELDS.every(k => S1.names[k] === NB[k] && !!NB[k]), 'build: right after the taps each field\'s label shows the bundle\'s name of the choice made (' + FIELDS.map(k => S1.names[k]).join(', ') + ')', { names: S1.names, want: NB });
  await done(p);
  const row = await p.evaluate(() => document.getElementById('prowV-rider').textContent);
  ok(row === 'Teal jersey', 'build: the row names the rider\'s jersey once built ("Teal jersey")', row);
  await sheet(p); const S2 = await sheetOf(p);
  const same = (a, b) => JSON.stringify(a.pressed) === JSON.stringify(b.pressed) && a.sums.join() === b.sums.join() && JSON.stringify(a.names) === JSON.stringify(b.names) && b.figSame;
  ok(same(S1, S2) && FIELDS.every(k => S2.pressed[k].length === 1 && S2.pressed[k][0] === B[k]), 'QA: a rider built, closed and reopened is the same (every pressed swatch, name, summary and the live rider)', { S1: S1.pressed, S2: S2.pressed });
  await reload(p); await settle(p, 400); await sheet(p); const S3 = await sheetOf(p);
  ok(same(S1, S3), 'build: and after a reload', S3.pressed);
  await x.close();
  // any tap stores the rider: tapping the choice already pressed (the default skin) on a fresh page builds the default rider
  { const y = await openH(), q = y.p; await sheet(q); await group(q, 'look'); await q.click('#rdGroups [data-rd="skin"][aria-pressed="true"]'); await settle(q, 150); await done(q);
    const A = await q.evaluate(() => ({ st: JSON.parse(localStorage.getItem('bluebird.settings.v2')).rider, mem: window.__q99.settings.rider, def: FW.RIDER_DEFAULT, row: document.getElementById('prowV-rider').textContent, name: FW.RIDER_NAMES.kit[FW.RIDER_DEFAULT.kit] }));
    ok(!!A.st && J(A.st) === J(A.def) && J(A.mem) === J(A.def) && A.row === A.name + ' jersey', 'build: tapping the choice already pressed builds the rider (the default rider stored; the row "' + A.row + '")', A);
    await y.close(); }
});

// a rider with every field tampered (each a different kind of bad value) and one field (helmet) set to a real choice: what riderNorm must give
const BAD_R = { skin: '__proto__', hairStyle: 7, hair: null, face: { beard: true }, helmet: '#F26B5B', glasses: 'constructor', lens: 'toString', frame: '#ffffff', kit: '#179bcc ', kit2: ['#0B7399'], sleeve: true, pattern: 'hasOwnProperty', shorts: 'valueOf', extra: 'x', html: '<img src=x onerror=alert(1)>' };
const wantNorm = p => p.evaluate(() => Object.assign({}, FW.RIDER_DEFAULT, { helmet: '#F26B5B' }));
const BAD_NOT = ['a rider', 42, true, ['#F26B5B']]; // not riders at all: the default rider
// a rider with every field but one (lens, a real choice) set to a value ANOTHER field offers (review round 4: the bad values above are offered
// by no field, so a riderNorm that took any field's value passed): a jersey colour for the skin, the helmet and the shorts, a sleeve colour
// for the frame and the fade, a fade colour for the sleeves, a shorts colour for the jersey, a hair style for the glasses, a face or glasses
// value for the hair style, the pattern and the face
const BAD_X = { skin: '#F26B5B', hairStyle: 'none', hair: '#F28C28', face: 'shield', helmet: '#F28C28', glasses: 'covered', lens: '#3FA66B', frame: '#E06AAE', kit: '#3048B4', kit2: '#E06AAE', sleeve: '#D94F92', pattern: 'beard', shorts: '#F26B5B' };
const wantX = p => p.evaluate(() => Object.assign({}, FW.RIDER_DEFAULT, { lens: '#3FA66B' }));
section('norm', async () => {
  const W = await (async () => { const x = await openH({ noErrs: true }); const w = await wantNorm(x.p); await x.close(); return w; })();
  const WX = await (async () => { const x = await openH({ noErrs: true }), p = x.p, w = await wantX(p);
    // the premise: each BAD_X value is offered by some other field and not by its own (lens: its own real choice)
    const P = await p.evaluate(X => Object.keys(X).filter(k => k !== 'lens').map(k => { const has = (f, v) => { const o = FW.RIDER_OPTIONS[f]; return Array.isArray(o) ? o.includes(v) : Object.prototype.hasOwnProperty.call(o, v); };
      return { k, v: X[k], own: has(k, X[k]), other: Object.keys(FW.RIDER_OPTIONS).filter(f => f !== k && has(f, X[k])) }; }), BAD_X);
    ok(P.length === 12 && P.every(x => !x.own && x.other.length), 'norm: each of BAD_X\'s values is offered by another field and not by its own (' + P.map(x => x.k + ' ' + x.v + ' from ' + x.other.join('/')).join(', ') + ')', P);
    await x.close(); return w; })();
  // on load: stored on the device
  { const x = await openH({ settings: { rider: BAD_R } }), p = x.p, mem = await p.evaluate(() => window.__q99.settings.rider);
    ok(JSON.stringify(mem) === JSON.stringify(W), '99.2: riderNorm on load: a stored rider with every field tampered (a number, null, an object, an array, true, a near-miss colour, \'__proto__\', \'constructor\', \'toString\', \'hasOwnProperty\', \'valueOf\') is each field\'s default, the real choice kept (helmet), the extra keys gone', mem);
    await sheet(p); const S = await sheetOf(p), NW = await namesOf(p, W);
    ok(FIELDS.every(k => S.pressed[k].length === 1 && S.pressed[k][0] === W[k] && S.names[k] === NW[k]) && S.figSame, 'norm: on load: the sheet and the live rider draw that rider (each field\'s label the bundle\'s name of it)', { pressed: S.pressed, names: S.names });
    await done(p); await sleep(300);
    const st = (await stored(p)).rider; ok(JSON.stringify(st) === JSON.stringify(W), 'norm: on load: the stored copy is the checked rider', st);
    await x.close(); }
  { const x = await openH({ settings: { rider: BAD_X } }), p = x.p, mem = await p.evaluate(() => window.__q99.settings.rider);
    ok(J(mem) === J(WX), '99.2: riderNorm on load: a stored rider whose fields hold values other fields offer (a jersey colour for the skin and the helmet, a sleeve colour for the frame, a hair style for the glasses, \'none\' for the hair style, \'beard\' for the pattern ...) is each field\'s default, the real choice kept (lens)', mem);
    await sheet(p); const S = await sheetOf(p), NX = await namesOf(p, WX);
    ok(FIELDS.every(k => S.pressed[k].length === 1 && S.pressed[k][0] === WX[k] && S.names[k] === NX[k]) && S.figSame && S.sums.join('|') === (await sumsOf(p, WX)).join('|'), 'norm: on load: the sheet draws that rider: one choice pressed in each field, its name and the summaries the default\'s (no "#F28C28 helmet")', { pressed: S.pressed, names: S.names, sums: S.sums });
    await x.close(); }
  for (const v of BAD_NOT) { const x = await openH({ settings: { rider: v } }), mem = await x.p.evaluate(() => window.__q99.settings.rider), D = await x.p.evaluate(() => FW.RIDER_DEFAULT);
    ok(JSON.stringify(mem) === JSON.stringify(D), 'norm: on load: a rider that is no rider (' + JSON.stringify(v) + ') is the default rider', mem); await x.close(); }
  { const x = await openH({ settings: { rider: null } }), mem = await x.p.evaluate(() => 'rider' in window.__q99.settings); ok(!mem, 'norm: on load: rider null is no rider (absent)', mem); await x.close(); }
  // a stored copy whose settings hold an own "__proto__" key with a rider in it (review round 5): the load makes it the settings' prototype
  // (Object.assign), and the rider is read as an own key only (riderOwn), so none is built: the row "Not set", the sheet the default's
  { const x = await openH(), p = x.p, D = await p.evaluate(() => FW.RIDER_DEFAULT);
    await p.evaluate(R => { const s = localStorage.getItem('bluebird.settings.v2') || '{}'; localStorage.setItem('bluebird.settings.v2', '{"__proto__":' + JSON.stringify({ rider: R }) + (s.length > 2 ? ',' + s.slice(1) : '}')); }, RIDER99);
    await reload(p); await settle(p, 500); await toSettings(p);
    const P = await p.evaluate(() => ({ inh: !!window.__q99.settings.rider, own: Object.prototype.hasOwnProperty.call(window.__q99.settings, 'rider'), row: document.getElementById('prowV-rider').textContent, now: window.__q99.riderNow() }));
    ok(!P.own && P.row === 'Not set' && J(P.now) === J(D), 'norm: on load: a stored copy with "__proto__": {"rider": ...} in its settings builds no rider (the rider read as an own key only: the row "Not set", the default drawn' + (P.inh ? '; the load still lends it through the prototype' : '') + ')', P);
    await x.close(); }
  // on restore: a backup file
  for (const [tag, r, want] of [['tampered', BAD_R, W], ['values other fields offer', BAD_X, WX], ['not a rider', 'x', null]]) {
    const x = await openH(), p = x.p, D = await p.evaluate(() => FW.RIDER_DEFAULT);
    const bk = await p.evaluate(r => { const d = JSON.parse(JSON.stringify(window.__q99.backupData())); d.settings.rider = r; return d; }, r);
    await restore(p, bk); const mem = await p.evaluate(() => window.__q99.settings.rider);
    ok(JSON.stringify(mem) === JSON.stringify(want || D), 'QA: a tampered rider value in a backup draws the default: riderNorm on restore (' + tag + ')', mem);
    await sheet(p); const S = await sheetOf(p), NR = await namesOf(p, want || D); ok(S.figSame && FIELDS.every(k => S.pressed[k].length === 1 && S.pressed[k][0] === (want || D)[k] && S.names[k] === NR[k]), 'norm: on restore (' + tag + '): the sheet draws it (each label the bundle\'s name of it)', { pressed: S.pressed, names: S.names });
    await x.close(); }
  // when synced settings arrive: the cloud's rider tampered (a newer stamp), pulled by a signed-in device
  { const be = new Backend(), A = await synced(be, { label: 'A' }); await ready(be, A);
    const now = Date.now() + 5000, d = JSON.parse(JSON.stringify(doc(be))); d.settings.rider = BAD_R; d.settings.updatedAt = now; d.settingsAt = Object.assign({}, d.settingsAt, { rider: now, _u: now }); be.fs.set('users/u1', d);
    const got = await nudge([A.p], () => A.p.evaluate(() => !!window.__q99.settings.rider));
    const mem = await A.p.evaluate(() => window.__q99.settings.rider), st = (await stored(A.p)).rider;
    ok(!!got && JSON.stringify(mem) === JSON.stringify(W) && JSON.stringify(st) === JSON.stringify(W), 'QA: a tampered rider value in the cloud draws the default: riderNorm when synced settings arrive (every tampered field its default, the real choice kept)', { mem, st });
    const av = await A.p.evaluate(() => { const h = document.querySelector('#syncHdr .hav'), nm = s => String(s).replace(/\b(fw-[a-z]+)\d+/g, '$1#'); return !!h && h.classList.contains('av-on') && nm(h.querySelector('.av-r').innerHTML) === nm(Object.assign(document.createElement('div'), { innerHTML: FW.riderAvatar(window.__q99.riderNow(), 32) }).innerHTML); });
    ok(av, 'norm: synced: the header avatar draws the checked rider', av);
    // the merge itself, run again on the cloud copy just pulled (review round 3: with the merge taking the cloud's rider unchecked, the stored
    // copy and the header still come out equal, as syncSetSettings checks it again, but every pull applies the raw rider anew)
    const M = await A.p.evaluate(d => { const H = window.__q99, out = { apply: {}, up: [], upData: {} }; H.sfDocMerge(d, out); const s = out.apply.settings;
      return { apply: !!s, data: !!(s && s.data), rider: s && s.data ? s.data.rider : null, mine: H.settings.rider, sUp: out.sUp || [] }; }, doc(be));
    ok((!M.data || J(M.rider) === J(M.mine)) && !M.sUp.includes('rider'), 'norm: synced: merging that cloud copy again brings nothing new for the rider (sfDocMerge: any settings it applies carry this device\'s checked rider; the rider is not a key to upload)', M);
    // a second pull changes nothing (the cloud keeps its value; the device does not apply it again on every pull)
    const before = JSON.stringify(await stored(A.p)); await A.p.evaluate(() => { window.__q99n = 0; const h = document.getElementById('rdGroups'); new MutationObserver(r => { window.__q99n += r.length; }).observe(document.getElementById('syncHdr'), { subtree: true, childList: true }); });
    await nudge([A.p], async () => false, 6000);
    const after = JSON.stringify(await stored(A.p)), n = await A.p.evaluate(() => window.__q99n);
    ok(before === after && n === 0, 'norm: synced: later pulls of the same cloud copy change nothing here (the rider kept as checked, the avatar not drawn again)', { same: before === after, n });
    // values other fields offer, arriving from the cloud (a newer stamp)
    const now2 = Date.now() + 9000, d2 = JSON.parse(JSON.stringify(doc(be))); d2.settings.rider = BAD_X; d2.settings.updatedAt = now2; d2.settingsAt = Object.assign({}, d2.settingsAt, { rider: now2, _u: now2 }); be.fs.set('users/u1', d2);
    const got2 = await nudge([A.p], () => A.p.evaluate(() => window.__q99.settings.rider && window.__q99.settings.rider.lens === '#3FA66B'));
    const mem2 = await A.p.evaluate(() => window.__q99.settings.rider), st2 = (await stored(A.p)).rider;
    ok(!!got2 && J(mem2) === J(WX) && J(st2) === J(WX), 'QA: a rider in the cloud whose fields hold values other fields offer draws the default for each (riderNorm when synced settings arrive; the real choice, lens, kept)', { mem2, st2 });
    await A.close(); }
  // the cloud's rider null, or its field deleted, under a newer stamp (review round 5: null erased the rider on the device; the app never
  // removes a rider, so either is a foreign value): with a rider built on A and B, it stands on both (stored, the row, the header circle),
  // through later pulls too, and nothing is drawn again
  for (const how of ['null', 'deleted']) {
    const be = new Backend(), A = await synced(be, { label: 'cn', settings: { rider: RIDER99 } }), B = await synced(be, { label: 'cm' }); await ready(be, A, B);
    await nudge([A.p, B.p], async () => J(await B.p.evaluate(() => window.__q99.settings.rider)) === J(RIDER99));
    const now = Date.now() + 5000, d = JSON.parse(JSON.stringify(doc(be))); if (how === 'null') d.settings.rider = null; else delete d.settings.rider;
    d.settings.updatedAt = now; d.settingsAt = Object.assign({}, d.settingsAt, { rider: now, _u: now }); be.fs.set('users/u1', d);
    const keep = q => q.evaluate(() => { const h = document.querySelector('#syncHdr .hav'); return { r: window.__q99.settings.rider, st: (JSON.parse(localStorage.getItem('bluebird.settings.v2')) || {}).rider, row: document.getElementById('prowV-rider').textContent, hdr: !!h && h.classList.contains('av-on') && !!h.querySelector('.av-r svg') }; });
    await nudge([A.p, B.p], async () => false, 7000);
    const kA = await keep(A.p), kB = await keep(B.p); await A.p.evaluate(() => { window.__q99n = 0; new MutationObserver(r => { window.__q99n += r.length; }).observe(document.getElementById('syncHdr'), { subtree: true, childList: true }); });
    await nudge([A.p], async () => false, 5000); const n = await A.p.evaluate(() => window.__q99n), kA2 = await keep(A.p);
    ok([kA, kB, kA2].every(k => J(k.r) === J(RIDER99) && J(k.st) === J(RIDER99) && k.row === 'Coral jersey' && k.hdr) && n === 0, 'QA: the cloud\'s rider ' + (how === 'null' ? 'null' : 'field deleted') + ' under a newer stamp is no rider to apply: the rider built stands on A and B (stored, the row, the header circle), and later pulls draw nothing again', { kA, kB, kA2, n });
    await A.close(); await B.close(); }
});
async function restore(p, d) {
  await toSettings(p); await p.click('#prowBtn-backup'); await until(() => p.evaluate(() => document.getElementById('setSheet').classList.contains('open')));
  await p.setInputFiles('#backupFile', { name: 'fred-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(d)) });
  await until(() => p.evaluate(() => { const t = document.getElementById('toast'); return !!t && /Restored/.test(t.textContent); }), 10000); await settle(p, 300);
  if (await p.evaluate(() => document.getElementById('setSheet').classList.contains('open'))) await done(p);
}

section('backup', async () => {
  // a backup made here (backupData, what the Backup sheet saves) carries the rider; restored on a fresh page with none, the rider arrives
  { const x = await openH({ settings: { rider: RIDER99 } }), ex = await x.p.evaluate(() => JSON.parse(JSON.stringify(window.__q99.backupData()))); await x.close();
    ok(!!ex.settings && J(ex.settings.rider) === J(RIDER99), '99.5: a backup made here carries the rider (backupData().settings.rider is the rider built)', ex.settings && ex.settings.rider);
    const y = await openH(), q = y.p; await restore(q, ex); const r = await q.evaluate(() => window.__q99.settings.rider);
    await sheet(q); const S = await sheetOf(q), N = await namesOf(q, RIDER99);
    ok(J(r) === J(RIDER99) && S.figSame && FIELDS.every(k => S.pressed[k][0] === RIDER99[k] && S.names[k] === N[k]) && S.r.kit === RIDER99.kit, 'backup: that export restored on a fresh page with no rider brings the rider (stored, the sheet, each label the bundle\'s name, and its live rider)', { r, names: S.names });
    await y.close(); }
  // a backup from before item 99: the backup format with no settings.rider (as main writes it)
  const x = await openH({ settings: { rider: RIDER99, birthday: '1980-05-04' } }), p = x.p;
  const old = await p.evaluate(() => { const d = JSON.parse(JSON.stringify(window.__q99.backupData())); delete d.settings.rider; delete d.settings.birthday; d.settings.units = 'metric'; return d; });
  await restore(p, old);
  const r = await p.evaluate(() => ({ rider: window.__q99.settings.rider, units: window.__q99.settings.units, bd: window.__q99.settings.birthday }));
  ok(J(r.rider) === J(RIDER99) && r.units === 'metric' && r.bd === '1980-05-04', 'QA: a backup from before this item (no rider) restores without losing this device\'s rider (as birthday): the rest of it restored (metric units)', r);
  ok(J((await stored(p)).rider) === J(RIDER99), 'backup: and the stored copy keeps it', null);
  const nr = Object.assign({}, RIDER99, { kit: '#F28C28', skin: 'fair' }), bk = await p.evaluate(r => { const d = JSON.parse(JSON.stringify(window.__q99.backupData())); d.settings.rider = r; return d; }, nr);
  await restore(p, bk); const r2 = await p.evaluate(() => window.__q99.settings.rider);
  ok(J(r2) === J(nr), '99.5: a backup with a rider brings its rider', r2);
  await sheet(p); const S = await sheetOf(p), NR = await namesOf(p, nr); ok(S.pressed.kit[0] === '#F28C28' && S.figSame && FIELDS.every(k => S.names[k] === NR[k]), 'backup: the sheet (each label the bundle\'s name) and the live rider show the restored rider', { pressed: S.pressed, names: S.names });
  await x.close();
  // a device with no rider and a backup with none: still none
  const y = await openH(), o = await y.p.evaluate(() => { const d = JSON.parse(JSON.stringify(window.__q99.backupData())); delete d.settings.rider; return d; });
  await restore(y.p, o); ok(!(await y.p.evaluate(() => 'rider' in window.__q99.settings)), 'backup: no rider here and none in the backup: still none (not built)'); await y.close();
  // a backup whose settings carry an own "__proto__" key with a rider in it (JSON.parse makes it an own key; review round 5: the restore made
  // it the settings' prototype, so a device with no rider showed one that was stored and synced nowhere and went at the next settings write):
  // on a signed-in device with no rider, no rider is built (the row "Not set", the header's initial, nothing stored, nothing in the cloud),
  // the settings' prototype is Object's, and the next settings write and a reload leave it so; the same for a tampered rider in it
  for (const [tag, pr] of [['a rider', RIDER99], ['a tampered rider', { kit: '<b>x</b>', skin: '__proto__', extra: 1 }]]) {
    const be = new Backend(), A = await synced(be, { label: 'pr' }); await ready(be, A);
    const base = await A.p.evaluate(() => JSON.parse(JSON.stringify(window.__q99.backupData())));
    const bk = JSON.parse(JSON.stringify(base).replace('"settings":{', '"settings":{"__proto__":' + JSON.stringify({ rider: pr }) + ','));
    ok(Object.prototype.hasOwnProperty.call(bk.settings, '__proto__') && JSON.stringify(bk).includes('"__proto__"'), 'backup: the file\'s settings hold an own "__proto__" key (' + tag + ')', null);
    await restore(A.p, bk); await settle(A.p, 300);
    const st = () => A.p.evaluate(() => { const H = window.__q99, h = document.querySelector('#syncHdr .hav'); return { own: Object.prototype.hasOwnProperty.call(H.settings, 'rider'), proto: Object.getPrototypeOf(H.settings) === Object.prototype, row: document.getElementById('prowV-rider').textContent, hdr: !!h && h.classList.contains('av-on'), ini: h ? (h.querySelector('.av-i') || h).textContent : null, stored: 'rider' in (JSON.parse(localStorage.getItem('bluebird.settings.v2')) || {}), now: H.riderNow() }; });
    const D = await A.p.evaluate(() => FW.RIDER_DEFAULT), P0 = await st(); await sleep(2500); const cl = (doc(be).settings || {}).rider;
    await toSettings(A.p); await A.p.click('#prowBtn-samerecipe'); await settle(A.p, 300); const P1 = await st();
    await reload(A.p); await settle(A.p, 800); const P2 = await st();
    ok([P0, P1, P2].every(v => !v.own && v.proto && v.row === 'Not set' && !v.hdr && v.ini === 'T' && !v.stored && J(v.now) === J(D)) && cl == null, 'backup: a file with "__proto__": {"rider": ...} in its settings (' + tag + ') builds no rider on a device with none: the row "Not set", the header\'s initial, nothing stored or in the cloud, the settings\' prototype Object\'s; and so after the next settings write and a reload', { P0, P1, P2, cloud: cl });
    await A.close(); }
  // a backup whose rider is null (riderNorm's "no rider"; review round 5: it erased the rider here, and the erasure synced to every device as a
  // newer change): restored on A with a rider built on A, B and in the cloud, the rider stands on both and in the cloud, its stamp unchanged
  { const be = new Backend(), A = await synced(be, { label: 'na', settings: { rider: RIDER99 } }), B = await synced(be, { label: 'nb' }); await ready(be, A, B);
    await nudge([A.p, B.p], async () => J(await B.p.evaluate(() => window.__q99.settings.rider)) === J(RIDER99) && J((doc(be).settings || {}).rider) === J(RIDER99));
    const at0 = (doc(be).settingsAt || {}).rider, bk = await A.p.evaluate(() => { const d = JSON.parse(JSON.stringify(window.__q99.backupData())); d.settings.rider = null; return d; });
    await restore(A.p, bk); const a0 = await A.p.evaluate(() => [window.__q99.settings.rider, document.getElementById('prowV-rider').textContent]);
    await nudge([A.p, B.p], async () => false, 7000);
    const v = { a: await A.p.evaluate(() => window.__q99.settings.rider), b: await B.p.evaluate(() => window.__q99.settings.rider), cloud: (doc(be).settings || {}).rider, at: (doc(be).settingsAt || {}).rider, at0 };
    ok(J(a0[0]) === J(RIDER99) && a0[1] === 'Coral jersey' && J(v.a) === J(RIDER99) && J(v.b) === J(RIDER99) && J(v.cloud) === J(RIDER99) && v.at === at0, 'QA: a backup whose rider is null (no rider) restores without losing this device\'s: after both sync the rider stands on A, on B and in the cloud, its stamp unchanged', Object.assign({ row: a0[1] }, v));
    await A.close(); await B.close(); }
});

section('sync', async () => {
  const be = new Backend(), A = await synced(be, { label: 'A' }), B = await synced(be, { label: 'B' });
  await ready(be, A, B);
  const sr0 = await B.p.evaluate(() => !!window.__q99.settings.sameRecipe);
  // A builds a rider in the sheet
  await sheet(A.p); await allOpen(A.p); for (const k of FIELDS) await tap(A.p, k, RIDER99[k]); await done(A.p);
  const up = await until(() => J((doc(be).settings || {}).rider) === J(RIDER99), 20000);
  ok(!!up, 'sync: A\'s rider reaches the cloud', (doc(be).settings || {}).rider);
  const D = doc(be), at = D.settingsAt || {};
  ok(!!up && typeof at.rider === 'number' && !Object.keys(at).some(k => /^rider\./.test(k)) && !Object.keys(D.settings || {}).some(k => /^rider\./.test(k)), '99.2: the rider syncs as one unit: users/u1.settings.rider whole, one settingsAt stamp (rider), no part of it on its own', { at: Object.keys(at) });
  // B, not pulled since, saves an unrelated setting (Same recipe in every bottle)
  ok(!(await B.p.evaluate(() => 'rider' in window.__q99.settings)), 'sync: B has not pulled A\'s rider yet');
  await toSettings(B.p); await B.p.click('#prowBtn-samerecipe'); await settle(B.p, 200);
  await until(() => (doc(be).settings || {}).sameRecipe === !sr0, 20000);
  const both = await nudge([A.p, B.p], async () => { const a = await A.p.evaluate(() => [window.__q99.settings.rider, window.__q99.settings.sameRecipe]), b = await B.p.evaluate(() => [window.__q99.settings.rider, window.__q99.settings.sameRecipe]);
    return J(a[0]) === J(RIDER99) && J(b[0]) === J(RIDER99) && a[1] === !sr0 && b[1] === !sr0 ? { a, b } : null; });
  ok(!!both && J(doc(be).settings.rider) === J(RIDER99) && doc(be).settings.sameRecipe === !sr0, 'QA: two devices: A builds a rider, B (not pulled yet) saves an unrelated setting, both sync: A\'s rider stands on both and in the cloud, B\'s setting too', { both, cloud: doc(be).settings && doc(be).settings.rider });
  const avB = await B.p.evaluate(() => { const h = document.querySelector('#syncHdr .hav'); return !!h && h.classList.contains('av-on') && !!h.querySelector('.av-r svg'); });
  ok(avB, 'sync: B\'s header avatar is A\'s rider now', avB);
  // then B changes the rider already built (two taps in its sheet): B's whole rider on both and in the cloud, one settingsAt stamp newer
  // than A's, and A's header circle redrawn in it (review round 3: only A building from nothing was synced before)
  const hdrIs = (q, r) => q.evaluate(r => { const a = document.querySelector('#syncHdr .hav.av-on>.av-r'), nm = s => String(s).replace(/\b(fw-[a-z]+)\d+/g, '$1#'); return !!a && nm(a.innerHTML) === nm(Object.assign(document.createElement('div'), { innerHTML: FW.riderAvatar(r, 32) }).innerHTML); }, r);
  const riders = async () => ({ a: await A.p.evaluate(() => window.__q99.settings.rider), b: await B.p.evaluate(() => window.__q99.settings.rider), cloud: (doc(be).settings || {}).rider, at: doc(be).settingsAt || {}, sr: [await A.p.evaluate(() => !!window.__q99.settings.sameRecipe), await B.p.evaluate(() => !!window.__q99.settings.sameRecipe), !!(doc(be).settings || {}).sameRecipe] });
  const atA = (doc(be).settingsAt || {}).rider, WB = Object.assign({}, RIDER99, { kit: '#F28C28', hairStyle: 'covered' });
  await watchStill(A.p, ['#syncHdr>.hav>.av-r']); /* A's header circle watched from before B's change (review round 7: a synced rider redrawn there must not move) */
  await sheet(B.p); await allOpen(B.p); await tap(B.p, 'kit', WB.kit); await tap(B.p, 'hairStyle', WB.hairStyle); await done(B.p);
  const bOk = await nudge([A.p, B.p], async () => { const v = await riders(); return J(v.a) === J(WB) && J(v.b) === J(WB) && J(v.cloud) === J(WB) ? v : null; });
  const vB = bOk || await riders(), hA = await hdrIs(A.p, WB), mvA = await stillRead(A.p);
  ok(stillOk(mvA, 1), 'sync: always still: A\'s header circle, redrawn in the rider B made (motion on), never moves (no .fwm-go, nothing running, the fwMount record still, every 100 ms until 4 s after)', mvA);
  ok(!!bOk && typeof vB.at.rider === 'number' && vB.at.rider > atA && !Object.keys(vB.at).some(k => /^rider\./.test(k)) && hA, 'QA: then B changes the rider (two taps: Orange jersey, a head covering): B\'s whole rider on A, on B and in users/u1.settings.rider, one settingsAt stamp newer than A\'s, and A\'s header circle is FW.riderAvatar of it', { a: vB.a, b: vB.b, cloud: vB.cloud, at: vB.at.rider, atA, hA });
  // A changes it again while B, not pulled since, saves an unrelated setting: A's rider stands on both
  const WA = Object.assign({}, WB, { skin: 'fair' });
  await sheet(A.p); await group(A.p, 'look'); await tap(A.p, 'skin', WA.skin); await done(A.p);
  await until(() => J((doc(be).settings || {}).rider) === J(WA), 20000);
  await toSettings(B.p); await B.p.click('#prowBtn-samerecipe'); await settle(B.p, 200);
  const aOk = await nudge([A.p, B.p], async () => { const v = await riders(); return J(v.a) === J(WA) && J(v.b) === J(WA) && J(v.cloud) === J(WA) && v.sr.every(x => x === sr0) ? v : null; });
  ok(!!aOk && await hdrIs(B.p, WA), 'sync: A changes it again while B (not pulled) saves an unrelated setting: A\'s rider stands on both and in the cloud (B\'s header circle too), B\'s setting too', aOk || await riders());
  await A.close(); await B.close();
  // the cloud's rider lost (review round 6: an older build's restore deletes it under a newer stamp, and the merge made the cloud look as if it
  // held this device's rider, so nothing went up, the device took the deletion's stamp and A, B and a new device kept different riders for
  // good): A holds an edit B missed (Orange; B not pulled since), the cloud's rider deleted or null under a newer stamp, a new device C signs
  // in. The first device to pull puts its rider back, stamped 1 ms past the deletion (so an older build takes it too); every device that
  // pulls later takes it: one rider on A, B, C and in the cloud. A first: A's newer edit; B first: B's (the deletion erased which was newer)
  for (const [how, first] of [['deleted', 'A'], ['null', 'A'], ['deleted', 'B']]) {
    const be = new Backend(), A = await synced(be, { label: 'gA', settings: { rider: RIDER99 } }), B = await synced(be, { label: 'gB' }); await ready(be, A, B);
    await nudge([A.p, B.p], async () => J(await B.p.evaluate(() => window.__q99.settings.rider)) === J(RIDER99) && J((doc(be).settings || {}).rider) === J(RIDER99));
    const WO = Object.assign({}, RIDER99, { kit: '#F28C28' }), want = first === 'A' ? WO : RIDER99;
    await sheet(A.p); await group(A.p, 'kit'); await tap(A.p, 'kit', WO.kit); await done(A.p);
    await until(() => J((doc(be).settings || {}).rider) === J(WO), 20000);
    const tD = Date.now() + 5000, d = JSON.parse(JSON.stringify(doc(be))); if (how === 'null') d.settings.rider = null; else delete d.settings.rider;
    d.settings.updatedAt = tD; d.settingsAt = Object.assign({}, d.settingsAt, { rider: tD, _u: tD }); be.fs.set('users/u1', d);
    const back = await nudge([(first === 'A' ? A : B).p], async () => { const c = doc(be); return J((c.settings || {}).rider) === J(want) && (c.settingsAt || {}).rider > tD; }, 20000);
    const C = await synced(be, { label: 'gC' }); await ready(be, C);
    const dev = q => q.evaluate(() => { const h = document.querySelector('#syncHdr .hav'); return { r: window.__q99.settings.rider, row: document.getElementById('prowV-rider').textContent, hdr: !!h && h.classList.contains('av-on') && !!h.querySelector('.av-r svg') }; });
    const all = async () => ({ a: await dev(A.p), b: await dev(B.p), c: await dev(C.p), cloud: (doc(be).settings || {}).rider, at: (doc(be).settingsAt || {}).rider });
    const one = v => [v.a, v.b, v.c].every(x => J(x.r) === J(want) && x.hdr) && J(v.cloud) === J(want) && v.at > tD;
    const v = await nudge([A.p, B.p, C.p], async () => { const v = await all(); return one(v) ? v : null; }, 40000) || await all();
    const rowW = (await namesOf(A.p, want)).kit + ' jersey';
    ok(!!back && one(v) && [v.a, v.b, v.c].every(x => x.row === rowW), 'QA: the cloud\'s rider ' + (how === 'null' ? 'null' : 'deleted') + ' under a newer stamp after an edit B missed, ' + first + ' pulling first: its rider goes back up stamped past the deletion, and after every device pulls, A, B, a new device C and the cloud hold one rider (' + rowW + ' on each row, each header circle drawn)', Object.assign({ back: !!back, tD }, v));
    await A.close(); await B.close(); await C.close(); }
});

section('private', async () => {
  const x = await openH({ settings: { rider: Object.assign({}, RIDER99, { hairStyle: 'braids', skin: 'olive' }) } }), p = x.p;
  await crunch(p); await toY(p, '#rWearCard');
  const T = await p.evaluate(() => { const H = window.__q99, d = H.dbgDump(); return { d, ai: Object.keys(H.AI_CARD).map(k => [k, H.aiFill(k)]) }; });
  const vals = ['"rider"', 'braids', 'olive', '#D94F92', '#3FA66B', '#212D69', 'riderOutfit', 'fw-person'];
  const inD = vals.filter(v => T.d.includes(v)), j = JSON.parse((/```json\n([\s\S]*?)\n```/.exec(T.d) || [])[1] || '{}');
  ok(!inD.length && j.settings && !('rider' in j.settings) && Object.keys(j.settings).length > 10, '99.5: the troubleshooting copy leaves the rider out (DBG_DROP_SET: no rider key in its settings, none of its values, nothing of the strip)', { inD, keys: j.settings && Object.keys(j.settings).length });
  const inA = T.ai.map(([k, t]) => [k, vals.filter(v => t.includes(v)), t.length]).filter(a => a[1].length || !a[2]);
  ok(T.ai.length >= 4 && !inA.length, '99.5: no AI prompt has the rider (every prompt kind: ' + T.ai.map(a => a[0]).join(', ') + ')', inA);
  // static: the AI prompt builder reads no settings.rider (and nothing that builds the troubleshooting copy does but to drop it)
  const ms = SRC.replace(/<script id="fwJs">[\s\S]*?<\/script>/, ''), body = n => { const i = ms.indexOf('\nfunction ' + n + '('); return i < 0 ? '' : ms.slice(i, ms.indexOf('\nfunction ', i + 10)); };
  ok(['aiFill', 'aiAthleteName', 'aiLatestWorkout'].every(n => body(n) && !/rider/i.test(body(n))) && !/settings\.rider|riderNow|riderNorm/.test(body('dbgDump')), 'private: the prompt builders (aiFill and its helpers) and dbgDump never read the rider', null);
  // the rider by its names (review round 4: the search above held ids and hex values only, case-sensitive, so a prompt carrying the Kit and
  // Gear summaries passed): for a rider of unusual names, every prompt kind with the rider and without it (the same page, settings.rider
  // taken out) must be the same, and none may hold a summary or a chosen name (case aside) that the prompt without the rider does not
  const RA = Object.assign({}, RIDER99, { skin: 'olive', hairStyle: 'braids', hair: '#E9C46A', face: 'stache', helmet: '#8D949A', glasses: 'pair', lens: '#F2763A', frame: '#179BCC', kit: '#F27FB4', pattern: 'splatter', shorts: '#3048B4', kit2: '#D94F92', sleeve: '#BECC41' });
  const NA = await namesOf(p, RA), SA = await sumsOf(p, RA);
  const AN = await p.evaluate(RA => { const H = window.__q99, s0 = H.settings, kinds = Object.keys(H.AI_CARD); H.settings = Object.assign({}, s0, { rider: RA }); const w = kinds.map(k => H.aiFill(k)); const o = Object.assign({}, s0); delete o.rider; H.settings = o; const wo = kinds.map(k => H.aiFill(k)); H.settings = s0; return { kinds, w, wo }; }, RA);
  const terms = [...new Set([...SA, ...SA.flatMap(s => s.split(' · ')), ...Object.values(NA)].filter(Boolean))], lo = s => s.toLowerCase();
  const inW = terms.filter(n => AN.w.some(s => lo(s).includes(lo(n)))), base = inW.filter(n => AN.wo.some(s => lo(s).includes(lo(n)))), named = inW.filter(n => !base.includes(n)), diff = AN.kinds.filter((k, i) => AN.w[i] !== AN.wo[i]);
  ok(AN.kinds.length >= 4 && !diff.length && !named.length, '99.5: no AI prompt has the rider by name: every prompt kind (' + AN.kinds.join(', ') + ') is the same with the rider as without it, and none holds its summaries or chosen names (' + SA.join(' / ') + ')' + (base.length ? '; in the prompts either way, so not the rider: ' + base.join(', ') : ''), { diff, named });
  // the troubleshooting copy by name too (review round 5: it was searched for ids, hex values and two words only, case-sensitive, so a copy
  // carrying the Settings rows' values, "Coral jersey", passed): the page's rider set to RA through the app (riderApply: the row, the sheet,
  // the strip and the avatars follow) and then taken out the same way; the two copies must be the same apart from 'when', and the one with
  // the rider must hold none of its summaries, their parts or its chosen names (case aside) unless the one without it has them too
  const DB = await p.evaluate(RA => { const H = window.__q99, s0 = H.settings, cut = t => t.replace(/"when": *"[^"]*"/g, '"when":""').replace(/^(fred · copy for troubleshooting · [^·\n]+ · ).*$/m, '$1'); /* when it was made: its "when" and the first line's time */
    H.settings = Object.assign({}, s0, { rider: RA }); H.riderApply(); const w = H.dbgDump(), row = document.getElementById('prowV-rider').textContent;
    const o = Object.assign({}, s0); delete o.rider; H.settings = o; H.riderApply(); const wo = H.dbgDump(), row0 = document.getElementById('prowV-rider').textContent;
    H.settings = s0; H.riderApply(); return { w, wo, same: cut(w) === cut(wo), row, row0 }; }, RA);
  const dIn = terms.filter(n => lo(DB.w).includes(lo(n))), dBase = dIn.filter(n => lo(DB.wo).includes(lo(n))), dNamed = dIn.filter(n => !dBase.includes(n));
  const dDiff = DB.same ? null : (() => { const a = DB.w.split('\n'), b = DB.wo.split('\n'); return a.map((l, i) => l !== b[i] && !/"when"/.test(l) && i > 0 ? [l.slice(0, 120), (b[i] || '').slice(0, 120)] : null).filter(Boolean).slice(0, 4); })();
  ok(DB.row === NA.kit + ' jersey' && DB.row0 === 'Not set' && DB.same && !dNamed.length, '99.5: the troubleshooting copy leaves the rider out by name too: with the rider ("' + DB.row + '" on its row) and without it ("' + DB.row0 + '") the copy is the same but for when it was made, and holds none of its summaries or chosen names' + (dBase.length ? '; in the copy either way, so not the rider: ' + dBase.join(', ') : ''), { dDiff, dNamed });
  // and in the source: outside the rider's own code (rider* and rd* functions), only these functions call into it or read settings.rider,
  // each for a reason the decisions name; any other (an AI helper, a copy, a share) fails. The comments are left out of the scan
  const RIDER_USERS = { vN: 'the load line after `let settings` (riderSetNorm)', setSheetOpen: 'opens the sheet (riderSheet)', renderProfileRows: 'the row\'s value (riderRowV)', renderWear: 'the strip (riderStrip)', restoreAll: 'restore keeps or checks the rider', sfDocMerge: 'the cloud copy checked (riderSetNorm)', syncSetSettings: 'synced settings checked (riderSetNorm)', syncRender: 'a synced rider redrawn (riderApply)', renderSyncStatus: 'the header circle (riderHdr)', sbAcctRender: '#sbAv (riderAv)' };
  const code = ms.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[\s;{}(),])\/\/[^\n]*/g, '$1'), RU = /\b(riderOwn|riderNow|riderNorm|riderSetNorm|rdSum|rdNm|rdName|riderBuilt|riderIds|riderRowV|riderAv|riderStrip|riderHdr|riderApply|riderPut|riderSheet|riderSheetSync|riderOutfit|riderAvatar|RIDER_[A-Z]+)\b|\.rider\b|\[['"]rider['"]\]/;
  const users = [...code.matchAll(/\nfunction ([A-Za-z0-9_$]+)\(/g)].map((m, i, L) => [m[1], code.slice(m.index, i + 1 < L.length ? L[i + 1].index : code.length)]).filter(([n, b]) => !/^(rider|rd)[A-Z]/.test(n) && RU.test(b)).map(([n]) => n);
  const stray = users.filter(n => !Object.prototype.hasOwnProperty.call(RIDER_USERS, n));
  ok(users.length >= 8 && !stray.length, 'private: outside the rider\'s own code only ' + Object.keys(RIDER_USERS).length + ' functions read the rider or call into it, each for its reason (' + users.join(', ') + '): no prompt or copy helper does', { stray, users });
  await x.close();
  // the privacy note's "What's stored" line
  const y = await openH(), pv = await y.p.evaluate(() => { const b = document.getElementById('privacyBody'), h = [...b.querySelectorAll('h3')].find(e => /What.s stored/.test(e.textContent)); return h && h.nextElementSibling ? h.nextElementSibling.textContent : null; });
  ok(!!pv && /your rider[’']s look/.test(pv), '99.5: the privacy note\'s "What\'s stored" line names "your rider\'s look"', pv);
  await y.close();
});

// the avatars: the header's circle, #sbAv, what each shows
const avOf = p => p.evaluate(() => { const vis = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden';
  const nm = s => String(s).replace(/\b(fw-[a-z]+)\d+/g, '$1#'), r = window.__q99 && window.__q99.riderNow();
  const one = (box, size) => { if (!box) return null; const i = box.querySelector(':scope>.av-i'), a = box.querySelector(':scope>.av-r'), s = a && a.querySelector('svg'), rc = s && s.getBoundingClientRect();
    return { shown: vis(box), ini: i ? i.textContent : box.textContent, iniVis: vis(i), art: vis(s), same: !!s && !!r && nm(a.innerHTML) === nm(Object.assign(document.createElement('div'), { innerHTML: FW.riderAvatar(r, size) }).innerHTML), w: rc ? Math.round(rc.width) : 0, h: rc ? Math.round(rc.height) : 0, hid: a && a.getAttribute('aria-hidden'),
      go: !!a && a.classList.contains('fwm-go'), run: a ? a.getAnimations({ subtree: true }).filter(x => x.playState === 'running').length : 0 }; };
  return { inBtn: vis(document.getElementById('syncHdrIn')), outline: vis(document.querySelector('#syncHdrIn svg')), hav: one(document.querySelector('#syncHdr .hav'), 32), sb: one(document.getElementById('sbAv'), 30), dk: document.documentElement.classList.contains('dk'), run: document.documentElement.classList.contains('run-theme') }; });
// a rider spot stays still when its rider changes (review round 7, 99.3 "Always still": stillness was read only on a first drawing, so an
// avatar mounted again without o.still moved for seconds and passed): an in-page watch every 100 ms from before the change; each spot drawn
// has no .fwm-go, nothing running and its fwMount record still (s true); it counts the drawings each spot showed (a change is a new svg) and
// the ticks motion was off (html.fw-anim: Reduce Motion off and the switch on, or nothing could move)
const watchStill = (p, sels) => p.evaluate(S => { const W = window.__q99mv = { bad: [], ticks: 0, off: 0, svgs: S.map(() => new Set()) };
  const tick = () => { W.ticks++; if (!document.documentElement.classList.contains('fw-anim')) W.off++;
    S.forEach((s, i) => { const e = document.querySelector(s), g = e && e.querySelector('svg'); if (!g) return; W.svgs[i].add(g); const rec = window.__q99.FWM.get(e), go = e.classList.contains('fwm-go'), run = e.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length;
      if (go || run || !rec || rec.s !== true) W.bad.push({ spot: s, tick: W.ticks, go, run, still: rec ? rec.s : null }); }); };
  tick(); W.id = setInterval(tick, 100); }, sels); /* the first tick now: a tap redraws within 100 ms */
const stillRead = async (p, ms = 4000) => { await sleep(ms); return p.evaluate(() => { const W = window.__q99mv; clearInterval(W.id); return { ticks: W.ticks, off: W.off, drawn: W.svgs.map(s => s.size), n: W.bad.length, bad: W.bad.slice(0, 6), kit: window.__q99.riderNow().kit }; }); };
const stillOk = (R, n) => R.ticks >= 30 && R.off === 0 && R.drawn.length === n && R.drawn.every(k => k >= 2) && !R.n;
section('avatar', async () => {
  // signed out (sync on, nobody signed in), built and not: the outline and the empty circle, never the rider
  for (const built of [false, true]) for (const desk of [false, true]) {
    const be = new Backend(), x = await openH({ file: SYNCED, route: be.handler('o'), settings: built ? { rider: RIDER99 } : {}, width: desk ? 1280 : 390, height: desk ? 800 : 844, settle: 1200 }), v = await avOf(x.p);
    ok(desk ? v.dk && !!v.sb && !v.sb.art && v.sb.ini === '' : v.inBtn && v.outline && !(v.hav && v.hav.shown), '99.3: signed out' + (built ? ', a rider built' : '') + (desk ? ': #sbAv the empty circle, no rider (computer layout)' : ': the header shows the outline, no rider'), v);
    await x.close(); }
  // signed in, not built: the initial at both places
  for (const desk of [false, true]) {
    const be = new Backend(), x = await synced(be, { label: 'n', width: desk ? 1280 : 390, height: desk ? 800 : 844 }); await until(() => x.p.evaluate(d => !!document.querySelector(d ? '#sbAv .av-i' : '#syncHdr .hav .av-i'), desk), 15000);
    const v = await avOf(x.p), b = desk ? v.sb : v.hav;
    ok(!!b && b.shown && b.ini === 'T' && b.iniVis && !b.art, '99.3: signed in, no rider built: the initial (' + (desk ? '#sbAv, computer layout' : 'the header') + '), as today', v);
    await x.close(); }
  // signed in and built: the rider, still, sized; the initial kept under it; on the run too
  for (const [desk, run] of [[false, false], [true, false], [false, true]]) {
    const be = new Backend(), x = await synced(be, { label: 'b', settings: { rider: RIDER99 }, width: desk ? 1280 : 390, height: desk ? 800 : 844, dpr: 2 }), p = x.p;
    if (run) { await p.click('#sportBtn'); await p.click('#sportMenu [data-sport=run]'); await until(() => p.evaluate(() => document.documentElement.classList.contains('run-theme'))); }
    await until(() => p.evaluate(d => !!document.querySelector(d ? '#sbAv.av-on svg' : '#syncHdr .hav.av-on svg'), desk), 15000); await sleep(1500);
    const v = await avOf(p), b = desk ? v.sb : v.hav, sz = desk ? 30 : 32, where = desk ? '#sbAv on the computer layout (30 px)' : 'the header circle (32 px)' + (run ? ' on the run (graphite)' : '');
    ok(!!b && b.art && b.same && b.w === sz && b.h === sz && b.hid === 'true' && b.ini === 'T' && !b.iniVis && (!run || v.run), '99.3: signed in and built: the rider replaces the initial in ' + where + ' (FW.riderAvatar of the rider, ids aside; aria-hidden; the initial kept under it)', v);
    ok(!!b && !b.go && !b.run, '99.3: the avatar is always still (' + where + ': no .fwm-go, nothing running)', b);
    painted(await paintOf(p, desk ? '#sbAv>.av-r>svg' : '#syncHdr .hav>.av-r>svg', sz), 'avatar: ' + where + ': the rider shows');
    if (desk) { // #sbAv is kept by its key: going offline and back and its own re-renders draw nothing again (the same svg, no child changed)
      await p.evaluate(() => { const a = document.querySelector('#sbAv>.av-r'); a.querySelector('svg').__q99 = 1; window.__q99sb = 0; new MutationObserver(r => { window.__q99sb += r.length; }).observe(a, { subtree: true, childList: true }); });
      await p.context().setOffline(true); await p.evaluate(() => window.dispatchEvent(new Event('offline'))); await sleep(1200);
      await p.context().setOffline(false); await p.evaluate(() => window.dispatchEvent(new Event('online'))); await sleep(2500);
      await p.evaluate(() => { for (let k = 0; k < 3; k++) window.__q99.sbAcctRender(); }); await sleep(300);
      const K = await p.evaluate(() => { const s = document.querySelector('#sbAv>.av-r svg'); return { same: !!s && s.__q99 === 1, muts: window.__q99sb }; });
      ok(K.same && K.muts === 0, 'avatar: #sbAv is kept by its key (offline, back online and three re-renders: the same drawing, nothing redrawn)', K); }
    await p.emulateMedia({ forcedColors: 'active' }); await settle(p, 100); const fc = await avOf(p), fb = desk ? fc.sb : fc.hav;
    await p.emulateMedia({ forcedColors: 'none', media: 'print' }); await settle(p, 100); const pr = await avOf(p), pb = desk ? pr.sb : pr.hav;
    await p.emulateMedia({ media: 'screen' });
    ok(!!fb && !fb.art && fb.iniVis && (!pb || (!pb.art && (pb.iniVis || !pb.shown))), 'avatar: forced colours (and print) show the initial, no art (' + where + ')', { fb, pb });
    await x.close(); }
  // the header's rider is drawn once on a signed-in load and kept (review round 3: .hav was rebuilt when the initial went from '?' to the
  // real one at sign-in): every drawing put in the header circle's .av-r is recorded from the app's first line; through sign-in, the first
  // pull and later pulls there is one, the one shown, with the real initial under it
  { const be = new Backend(), x = await synced(be, { file: AVW_SYNCED, label: 'hk', settings: { rider: RIDER99 } }), p = x.p; await ready(be, x); await nudge([p], async () => false, 4500);
    const K = await p.evaluate(() => { const L = window.__q99hav || [], s = document.querySelector('#syncHdr>.hav>.av-r>svg'); return { drawn: L.length, shown: !!s && L[0] === s, ini: (document.querySelector('#syncHdr>.hav>.av-i') || {}).textContent, st: document.getElementById('syncHdr').dataset.st }; });
    ok(K.drawn === 1 && K.shown && K.ini === 'T', 'avatar: the header\'s rider is drawn once on a signed-in load and kept by its key: one drawing from the first (before sign-in is known) through sign-in, the first pull and later pulls, the one shown, the initial "T" under it', K);
    await x.close(); }
  // signing out in the session and back in (review round 6: only pages already signed out or already signed in were opened, so #sbAv could
  // keep the rider, or the initial, after a sign-out and pass): at 390 px and on the computer layout, a rider built and none: Settings ›
  // Account › Sign out leaves the outline in the header and #sbAv the empty circle (no av-on, no drawing, no initial); signing in again (the
  // account card's Sign in: the stand-in's popup) brings back the rider, drawn once (the header's circle, hidden while signed out, may keep its
  // drawing by its key: at most once), or the initial
  for (const built of [true, false]) for (const desk of [false, true]) {
    const be = new Backend(), x = await synced(be, { file: AVW_SYNCED, label: 'so', settings: built ? { rider: RIDER99 } : {}, width: desk ? 1280 : 390, height: desk ? 800 : 844 }), p = x.p; await ready(be, x);
    const sel = desk ? '#sbAv' : '#syncHdr .hav', where = (desk ? 'the computer layout' : '390 px') + (built ? ', a rider built' : ', none built');
    const on = () => p.evaluate(([s, b]) => !!document.querySelector(b ? s + '.av-on>.av-r>svg' : s + '>.av-i') && (b || document.querySelector(s + '>.av-i').textContent === 'T'), [sel, built]);
    await until(on, 15000); await sleep(800);
    const sbOf = () => p.evaluate(() => { const b = document.getElementById('sbAv'); return b && { on: b.classList.contains('av-on'), svg: !!b.querySelector('svg'), ini: (b.querySelector(':scope>.av-i') || b).textContent }; });
    await toSettings(p); await p.click('#prowBtn-account'); await until(() => p.evaluate(() => document.getElementById('setSheet').classList.contains('open') && !document.getElementById('prowB-account').hidden)); await settle(p, 150);
    await p.click('#syncOutBtn'); await until(() => p.evaluate(() => { const g = document.getElementById('gSignIn'); return !!g && g.getClientRects().length > 0; }), 10000); await sleep(800);
    const v1 = await avOf(p), s1 = await sbOf();
    ok(!!s1 && !s1.on && !s1.svg && s1.ini === '' && (desk || (v1.inBtn && v1.outline && !(v1.hav && v1.hav.shown))), 'avatar: signed out in the session (' + where + '): ' + (desk ? '' : 'the header shows the outline, no rider; ') + '#sbAv is the empty circle (no rider, no initial)', { sb: s1, hdr: desk ? null : { inBtn: v1.inBtn, outline: v1.outline, hav: v1.hav } });
    await p.evaluate(() => { window.__q99sbd = 0; window.__q99h0 = (window.__q99hav || []).length; const b = document.getElementById('sbAv'); new MutationObserver(R => R.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1 && (n.matches('svg') || n.querySelector('svg'))) window.__q99sbd++; }))).observe(b, { subtree: true, childList: true }); });
    await p.click('#gSignIn'); const back = await until(on, 15000); await nudge([p], async () => false, 3000);
    const v2 = await avOf(p), s2 = await sbOf(), n2 = await p.evaluate(d => d ? window.__q99sbd : (window.__q99hav || []).length - window.__q99h0, desk), b2 = desk ? v2.sb : v2.hav;
    ok(!!back && !!b2 && b2.shown && (built ? b2.art && b2.same && (desk ? n2 === 1 : n2 <= 1) && b2.ini === 'T' : !b2.art && b2.iniVis && b2.ini === 'T' && n2 === 0), 'avatar: signed in again (' + where + '): ' + (built ? 'the rider is back in ' + (desk ? '#sbAv, drawn once (' : 'the header circle, drawn at most once (it is hidden while signed out and keeps its drawing by its key: ') + n2 + ')' : 'the initial "T" is back, no drawing'), { b2, n2, sb: s2 });
    await x.close(); }
  // the header's sync badge still follows the sync state with the rider in the circle (renderSyncStatus sets data-st without redrawing .hav)
  { const be = new Backend(), x = await synced(be, { label: 'st', settings: { rider: RIDER99 } }), p = x.p;
    await until(() => p.evaluate(() => !!document.querySelector('#syncHdr .hav.av-on svg')), 15000); await sleep(1500);
    const st = () => p.evaluate(() => { const h = document.getElementById('syncHdr'), a = getComputedStyle(h, '::after'); return { st: h.dataset.st, badge: a.content !== 'none' && a.display !== 'none', bg: a.backgroundColor, rider: !!h.querySelector('.hav.av-on .av-r svg') }; });
    const s0 = await st(); await p.context().setOffline(true); await p.evaluate(() => window.dispatchEvent(new Event('offline')));
    const s1 = (await until(async () => { const v = await st(); return v.st === 'offline' ? v : null; }, 8000)) || await st();
    await p.context().setOffline(false); await p.evaluate(() => window.dispatchEvent(new Event('online')));
    const s2 = (await until(async () => { const v = await st(); return v.st === s0.st ? v : null; }, 20000)) || await st();
    ok(s0.st === 'synced' && s0.rider && s1.st === 'offline' && s1.badge && s1.rider && s2.st === 'synced' && s2.rider, 'avatar: with the rider in the header circle, the sync badge follows the state: offline sets data-st offline and draws its badge, back online it is synced (the rider kept)', { s0, s1, s2 });
    await x.close(); }
  // still when the rider changes (review round 7): signed in, a rider built, motion on; on the computer layout a tap in the sheet (the sheet's
  // live rider and #sbAv beside it), then a restore that brings another rider (#sbAv); at 390 px a restore (the header circle). Each spot is
  // watched from before the change until 4 s after it (the sync section watches a synced rider reaching the header circle)
  for (const desk of [true, false]) {
    const be = new Backend(), x = await synced(be, { label: 'mv', settings: { rider: RIDER99 }, width: desk ? 1280 : 390, height: desk ? 800 : 844 }), p = x.p; await ready(be, x);
    const av = desk ? '#sbAv>.av-r' : '#syncHdr>.hav>.av-r', where = desk ? 'the computer layout' : '390 px';
    await until(() => p.evaluate(s => !!document.querySelector(s + '>svg'), av), 15000); await sleep(1500);
    if (desk) { await sheet(p); await group(p, 'kit'); await watchStill(p, ['#rdFig', av]); await tap(p, 'kit', '#F28C28');
      const R = await stillRead(p);
      ok(stillOk(R, 2), 'avatar: always still: a tap in the sheet (' + where + ', motion on: Orange jersey): the sheet\'s live rider and #sbAv beside it are drawn anew and never move (no .fwm-go, nothing running, the fwMount record still, every 100 ms for 4 s)', R);
      await done(p); }
    const bk = await p.evaluate(() => { const d = JSON.parse(JSON.stringify(window.__q99.backupData())); d.settings.rider = Object.assign({}, d.settings.rider, { kit: '#2ABCBB' }); return d; });
    await watchStill(p, [av]); await restore(p, bk); const R = await stillRead(p);
    ok(stillOk(R, 1) && await p.evaluate(() => window.__q99.riderNow().kit === '#2ABCBB'), 'avatar: always still: a restore that brings another rider (' + where + ', motion on): ' + (desk ? '#sbAv' : 'the header circle') + ' is drawn anew and never moves', R);
    await x.close(); }
});

// ---- the strip ----
// under-layers drawn by design as nothing (decision): the jerseys, bib shorts, base layers and summer socks; arm warmers and sun sleeves under
// sleeves of a thermal jersey or a jacket. New with v7 (FROM-APP-CHAT-6, "for the record"): wool socks under any foot cover (the shin has
// about 18 units between the shorts and the shoe, and a real cover hides the sock; with toe covers or bare shoes they show and are judged)
// only where that holds as measured (review round 5, probe99/r5/p/socks.mjs, the least over both riders and all 8 skins). On v8 (v8 check
// round 1, probe99/v8fix1/m.mjs socks, every cover and shin, both riders, all 8 skins): by design with knee warmers under any cover (0-28 px
// changed) and with leg wear under overshoes or boots (28 / 0, 16 / 0); judged everywhere else, as v8 draws them: over bare shins above shoe
// covers (332 / 300), overshoes (196 / 164; v7 0) and boots (156 / 136), and over leg wear above shoe covers (128 / 64; v7 96 / 32). On v9
// (item 100; fwcheck7/app probe/bydesign.mjs and probe100/main/legs.cjs) the rule holds as it is: the socks' own colour stays 0-12 there
// (2x and 3x, both engines); what changes is the knee warmer's band, which ends at y 263 over wool socks (else 266) and moves its ink line
// (164 px changed under shoe covers, 60 under overshoes, 0 under boots, the sock's own 0, 12 and 0); under leg wear with overshoes or boots
// the socks read 68 and 20 changed, own 0. v9 no longer draws the white base sock under boots and overshoes without wool socks: no check
// here expected it (its going lifts the leg wear above the cuff, ACCEPTED_V8 2 and 3's case; mut99's v9a2-basesock puts it back);
// everything under the rain jacket, now outermost (the vest, the windbreaker, the thermal and winter jackets, a thermal jersey); a thermal
// jersey under any sleeved outer piece (with the vest alone its sleeves show and are judged)
const UNDER = new Set(['jersey-light', 'jersey-med', 'bibs', 'base-ls', 'base-ss', 'base-sleeveless', 'base-thermal', 'socks-summer']);
const SLEEVED = ['jersey-heavy', 'windbreaker', 'jacket-thermal', 'jacket-winter', 'jacket-rain'], JACKETS = SLEEVED.slice(1);
const COVERS = ['shoes', 'overshoes', 'boots'], UNDER_RAIN = ['vest', 'windbreaker', 'jacket-thermal', 'jacket-winter', 'jersey-heavy'];
const SHIN = ['legs', 'tights-light', 'tights-heavy', 'knees'], LEG = SHIN.slice(0, 3);
const byDesign = (id, L) => UNDER.has(id) || ((id === 'arms' || id === 'sun-sleeves') && L.some(x => SLEEVED.includes(x)))
  || (id === 'socks-wool' && L.some(x => COVERS.includes(x)) && (L.includes('knees') || (L.some(x => x === 'overshoes' || x === 'boots') && L.some(x => LEG.includes(x))))) || (UNDER_RAIN.includes(id) && L.includes('jacket-rain'))
  || (id === 'jersey-heavy' && L.some(x => JACKETS.includes(x)));
// bundle v8: nothing is held (since bundle v8 accepted, nothing outside ACCEPTED_V8). Until v8 three lists held what v7 drew as nothing or without its own colour, each as wide as measured on v7:
// V7_GAPS (FROM-APP-CHAT-6 points 1-3: leg wear under overshoes, the shoe covers' own colour, dark gloves on deep brown skin), AWAIT (6B
// points 6-7: the dark jackets on Black and Navy jerseys, the thermal jersey in Black with arm warmers and the vest) and PAT_AWAIT (6B point
// 8: patterns that drew nothing on some jerseys). v8 answers each, so each case is judged in full as any other (FIXED_BY_V8 for the strip,
// PAT_WAS for the sheet's patterns), must be judged, and is printed with its least measurement beside v7's. A case that fails on v8 fails
// here: it is never held again (the app chat's decision), but for ACCEPTED_V8 below: the six cases Mark accepted on v8 (Bundle v8 accepted,
// Mark's decision), each as wide as measured on v8 and with its floor, of which v9 left one (the dark gloves; Item 100, Bundle v9); nothing
// held outside ACCEPTED_V8
const PAT_SHOW = 24; // a pattern reads: at least 24 device px (a fifth of SHOW.d48, as STRIP_APART) more than 48 apart from Plain (the v8 ask's measure)
// the patterns v7 drew as nothing on some jerseys (PAT_AWAIT until v8): the band in #F26B5B (the Coral jersey's own colour), the side stripe in
// #F0708A and splatter in #2F5FB5, none outlined; as measured on v7 for the default rider and RIDER99 alike (probe99/r6/plook/patr.mjs). v8 gives
// each an ink edge on the rider (o.patEdge) and moves the side stripe to x 118-130
const PAT_WAS = [
  { pattern: 'band', on: [['#F26B5B', ''], ['#F26B5B', '#D94F92'], ['#BECC41', '#D94F92'], ['#F28C28', '#D94F92']], what: 'the chest band on a Coral jersey with its fade Same as jersey or Berry, and on Lime or Orange with a Berry fade (v7: 0 device px more than 48 apart from Plain)' },
  { pattern: 'side', on: [['#F26B5B', ''], ['#F26B5B', '#D94F92'], ['#F27FB4', ''], ['#F27FB4', '#D94F92'], ['#BECC41', '#D94F92'], ['#E8E58A', '#D94F92'], ['#F28C28', '#D94F92']], what: 'the side stripe on a Coral or Pink jersey (fade Same as jersey or Berry) and on Lime, Pale yellow or Orange with a Berry fade (v7: 0-12 device px)' },
  { pattern: 'splatter', on: [['#179BCC', '#212D69']], what: 'splatter on a Bluebird blue jersey with a Navy fade (v7: 0 device px)' },
];
// two choices of a field draw different riders as painted (review round 6): at least 120 device px (an item's area, SHOW.d48) more than 8
// apart in a channel (a tone apart: the nearest skins, 13-19 a channel apart, change 1949 or more), or 24 more than 48 (a thin part in a
// colour of its own); as measured on v7 the pairs that draw nothing apart change at most 88 (probe99/r6/plook/pairs.mjs)
const PAIR = { d8: 120, d48: 24 };
// the six riders the sheet's field checks use (RIDER99, Shaved with no face and with a beard, Covered, the shield, no glasses)
const PAIR_STATES = [{}, { hairStyle: 'shaved', face: 'none' }, { hairStyle: 'shaved', face: 'beard' }, { hairStyle: 'covered', face: 'none' }, { glasses: 'shield' }, { glasses: 'none' }];
// in the page: riders drawn as the sheet's live rider (FW.riderOutfit, no items, FW.plain) at its size on a 2x canvas (240 x 360 device
// px); for each group, every pair of its riders (all) or each against the first: [i, j, px more than 8, 24, 48 apart in a channel]
const riderDiffs = (p, groups) => p.evaluate(async G => { const W = 240, H = 360, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d', { willReadFrequently: true });
  const px = async r => { const i = new Image(); i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(FW.plain(FW.riderOutfit(r)).replace('<svg ', `<svg width="${W}" height="${H}" `)); await i.decode(); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.drawImage(i, 0, 0, W, H); return x.getImageData(0, 0, W, H).data; };
  const out = []; for (const g of G) { const I = []; for (const r of g.riders) I.push(await px(r)); const D = [];
    for (let i = 0; i < I.length; i++) for (let j = i + 1; j < I.length; j++) { if (!g.all && i) break; const A = I[i], B = I[j]; let d8 = 0, d24 = 0, d48 = 0;
      for (let q = 0; q < A.length; q += 4) { const m = Math.max(Math.abs(A[q] - B[q]), Math.abs(A[q + 1] - B[q + 1]), Math.abs(A[q + 2] - B[q + 2])); if (m > 8) { d8++; if (m > 24) { d24++; if (m > 48) d48++; } } }
      D.push([i, j, d8, d24, d48]); } out.push(D); } return out; }, groups);
// each item's own colour (knee grey and the like): the bundle's OUTFIT_LOOK colours, v8's (the covers' COVER #4F6478, the thermal jacket
// #5B4E9E, the winter jacket #2F6B4F; v7's #1E1E24, #2F3B6E and #1E2A4A went: #1E2A4A was within 10 of the ink, so its count took outline
// pixels); v9's boots #B0343A (FROM-APP-CHAT-7 point 1: v8's #3A2F2A was within 48 of the leg wear, and v9 draws it nowhere, so boots counted
// in it read 0-12 own on v9 where they read 648 in #B0343A: Item 100, Bundle v9). The gloves keep their fill: v8's #C9D1DA cuff is drawn by all four gloves and the overshoes' hem, so it is no one item's own.
// The thermal jersey ('jersey-heavy', set where it is judged) is the jersey's colour ('kit': its sleeves) or #FFFFFF, the cuff only it draws
// (o.cuff, set by jersey-heavy alone when it sets the sleeves). An entry may list several colours: a pixel within 10 of any is the item's
const OWN = { toes: '#8E949A', knees: '#B9C2CF', skullcap: '#8FA7C4', 'socks-wool': '#8E949A', gaiter: '#2ABCBB', vest: '#BFE6E6', windbreaker: '#DCE1E8', 'jacket-thermal': '#5B4E9E', 'jacket-winter': '#2F6B4F', 'jacket-rain': '#F2D64B',
  boots: '#B0343A', 'tights-heavy': '#14141A', 'tights-light': '#1E1E24', legs: '#1E1E24', arms: '#1E1E24', 'sun-sleeves': '#FFFFFF', gloves: '#2A2A30', 'gloves-finger': '#2A2A30', 'gloves-thermal': '#1E1E24', 'gloves-lobster': '#1E1E24', balaclava: '#1E1E24', head: '#2ABCBB', shoes: '#4F6478', overshoes: '#4F6478' };
const OWN_HEAVY = { 'jersey-heavy': ['kit', '#FFFFFF'] }; // the thermal jersey's own, where the strip judges it
// shows: at the strip's size on a 2x screen (100 x 150 CSS px, 200 x 300 device px), at least 120 device px (30 CSS px) changed by more than 48 in
// a channel (the bundle check's "clearly visible"), and of them at least 40 (10 CSS px) in the item's own colour where it has one (2x: a thin
// part's own colour is lost to anti-aliasing at 1x)
const SHOW = { d48: 120, own: 40 };
// in the page: the rider at strip size on a canvas (FW.plain), whole and with each item left out; per item the pixels changed and those in its own colour
// (box: [x0, y0, x1, y1] in the drawing's units, 1:1 at 2x: also the changed pixels whose centres are inside it; only: the items measured, else all;
// sc: device px per CSS px, 2 unless given: v8 check round 2 measures 3x too)
const pxMany = (p, R, ids, own, box, only, sc = 2) => p.evaluate(async ([R, ids, own, box, only, sc]) => { const W = 100 * sc, H = 150 * sc, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d', { willReadFrequently: true });
  /* a blob URL, revoked once drawn: the page keeps no decoded image (thousands of data: URLs crashed the page in the wide sweep) */
  const draw = async s => { const img = new Image(), u = URL.createObjectURL(new Blob([s], { type: 'image/svg+xml' })); img.src = u; try { await img.decode(); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.drawImage(img, 0, 0, W, H); } finally { URL.revokeObjectURL(u); img.src = ''; } return x.getImageData(0, 0, W, H).data; };
  const hx = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)), res = [];
  for (const r of R) { const mk = L => FW.plain(FW.riderOutfit(r, L)).replace('<svg ', `<svg width="${W}" height="${H}" `), whole = await draw(mk(ids)), out = {};
    for (const id of new Set(only || ids)) { const minus = await draw(mk(ids.filter(x => x !== id))), oc = own[id] ? [].concat(own[id]).map(c => hx(c === 'kit' ? r.kit : c)) : null; let d48 = 0, o = 0, b = 0;
      for (let i = 0; i < whole.length; i += 4) { const d = Math.max(Math.abs(whole[i] - minus[i]), Math.abs(whole[i + 1] - minus[i + 1]), Math.abs(whole[i + 2] - minus[i + 2])); if (d > 48) { d48++; const q = i / 4, cx = q % W + 0.5, cy = Math.floor(q / W) + 0.5; if (box && cx >= box[0] && cx <= box[2] && cy >= box[1] && cy <= box[3]) b++; if (oc && oc.some(c => Math.max(Math.abs(whole[i] - c[0]), Math.abs(whole[i + 1] - c[1]), Math.abs(whole[i + 2] - c[2])) <= 10)) o++; } }
      out[id] = Object.assign({ d48, own: oc ? o : null }, box ? { box: b } : {}); }
    res.push(out); }
  return res; }, [R, ids, own, box || null, only || null, sc]);
const pxOf = (p, r, ids, own, box) => pxMany(p, [r], ids, own, box).then(a => a[0]); // one rider (pxMany: many riders on one list in one call, review round 7)
// the strip as shown: its ids (the app's own record), its drawing against FW.riderOutfit(rider, ids), and outfit()'s list for the ride shown
const stripOf = p => p.evaluate(() => { const H = window.__q99, el = document.getElementById('rRider'), i = H.lastResult && H.lastResult.i || H.readInputs(), minF = i.wxMinF != null ? i.wxMinF : i.tempF, maxF = i.wxMaxF != null ? i.wxMaxF : null;
  const o = H.outfit(minF, maxF, i.wxRain, i.intensity), list = o.wear.map(c => c && c.id), r = H.riderNow(), s = el && el.querySelector('svg'), rc = s && s.getBoundingClientRect(), card = document.getElementById('rWearCard').getBoundingClientRect(), wear = document.getElementById('rWear').getBoundingClientRect();
  // words the page paints by CSS (review round 5: textContent misses ::before / ::after): every pseudo-element's content in the strip, and
  // the strip's box no taller than its svg and padding (a caption laid out under it would grow it)
  const pz = el ? [el, ...el.querySelectorAll('*')].flatMap(e => ['::before', '::after', '::marker'].map(w => [e, w, getComputedStyle(e, w).content])).filter(([e, w, c]) => !['none', 'normal', '""', "''"].includes(c) && !(w === '::marker' && e.tagName !== 'LI')).map(([e, w, c]) => (e.id || e.tagName.toLowerCase()) + w + ' ' + c) : [];
  /* centred in its box (review round 6: the decision's 'centred' was never measured; a strip at the card's left edge passed): the drawing's middle less the box's */
  const mid = el && rc ? Math.round((rc.left + rc.width / 2 - (el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2)) * 10) / 10 : null;
  const ec = el && getComputedStyle(el), boxH = el && rc ? Math.round((el.getBoundingClientRect().height - rc.height - ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'].reduce((a, k) => a + parseFloat(ec[k]), 0)) * 10) / 10 : null;
  const nm = h => String(h).replace(/\b(fw-[a-z]+)\d+/g, '$1#'), ticks = [...document.querySelectorAll('#rWear [data-tick-items]')].flatMap(t => JSON.parse(t.dataset.tickItems)).map(k => k.slice(2));
  return { ids: el && el._ids, list, ticks, shed: o.shed.map(c => c.id), minF, maxF, rain: i.wxRain, r, svg: !!s, same: !!s && nm(el.innerHTML) === nm(Object.assign(document.createElement('div'), { innerHTML: FW.riderOutfit(r, el._ids || []) }).innerHTML), w: rc && Math.round(rc.width), h: rc && Math.round(rc.height),
    inCard: !!rc && rc.left >= card.left && rc.right <= card.right && rc.bottom <= wear.top + 1, above: !!rc && rc.bottom <= wear.top + 1, hid: el && el.getAttribute('aria-hidden'), text: el ? el.textContent.trim() : null, css: pz, boxH, mid, still: !!el && !el.classList.contains('fwm-go') && !el.getAnimations({ subtree: true }).some(a => a.playState === 'running'),
    rec: H.FWM.get(el) ? { s: H.FWM.get(el).s, k: H.FWM.get(el).k.slice(0, 40) } : null }; });
// the rides: [name, forecast, effort tapped before the Crunch (else the athlete's Steady)]. Hard and Recovery pick other items than Steady
// (the full closet: tights-heavy and overshoes on a Hard freezing and a Recovery cold ride); a cool dry ride (50-51 F at the ride's hour), where
// a closet without leg warmers gives knee warmers with wool socks and toe covers (v8 check round 2: its closets only, see closetsOf)
const RIDES = [['hot', { lo: 92, hi: 99 }], ['mild', { lo: 59, hi: 63 }], ['cold', { lo: 40, hi: 44 }], ['freezing', { lo: 24, hi: 29 }], ['wet', { lo: 53, hi: 57, rain: 80 }],
  ['hard freezing', { lo: 24, hi: 29 }, 'hard'], ['recovery cold', { lo: 40, hi: 44 }, 'recovery'], ['cool', { lo: 50, hi: 54 }]];
// a closet: 'starter', 'full' or 'noleg', then items added ('+id') or taken out ('~id'): 'full~socks-wool' is every catalog item but wool socks
async function setCloset(p, kind, extra) { await p.evaluate(([kind, extra]) => { const H = window.__q99, mk = id => H.closetItemFromCatalog(H.CLOSET_CATALOG.find(c => c.id === id)), [b, ...m] = kind.split(/(?=[+~])/);
  let L = b === 'full' ? H.CLOSET_CATALOG.map(c => c.id) : b === 'noleg' ? H.CLOSET_CATALOG.map(c => c.id).filter(id => !['legs', 'tights-light', 'tights-heavy', 'knees'].includes(id)) : H.CLOSET_STARTER.slice();
  for (const q of m) L = q[0] === '+' ? L.concat([q.slice(1)]) : L.filter(id => id !== q.slice(1));
  H.settings.closet = L.map(mk).concat(extra || []); H.save(H.KEYS.settings, H.settings); H.refreshResults(); }, [kind, extra || null]); await settle(p, 200); }
const closetName = k => k === 'noleg' ? 'full but no leg wear or knee warmers' : k.split(/(?=[+~])/).map((q, i) => i ? (q[0] === '+' ? 'plus ' : 'less ') + q.slice(1) : q).join(' ');
// the closets each ride is judged with: the starter and every catalog item; with no leg wear or knee warmers on the cold and colder rides (review
// round 5; Hard freezing and Recovery cold since v8 check round 1: wool socks over bare shins under overshoes); and on those two, where the full
// closet gives overshoes, each leg wear under them with and without wool socks (v8 check round 1: V7_GAPS point 1 was judged on tights-heavy with
// wool socks alone): legs from the starter closet plus overshoes, tights-heavy, tights-light and legs from the full closet less what the ride would
// pick first, each with and without wool socks. v8 check round 2 (FOUND): on the freezing ride, where the full closet gives boots, each leg wear
// above boots with no wool socks (the full closet less wool socks, and less tights-heavy, and less tights-light too; the starter closet plus
// boots); on the wet ride and the cool one, knee warmers with wool socks and toe covers or bare shoes (the full closet less leg warmers, and
// less toe covers too); the cool ride is judged with these two closets alone (it was added for them)
const LEGOVER = ['starter+overshoes', 'full~socks-wool', 'full~tights-heavy', 'full~tights-heavy~socks-wool', 'full~tights-heavy~tights-light', 'full~tights-heavy~tights-light~socks-wool'];
const LEGBOOT = ['full~socks-wool', 'full~tights-heavy~socks-wool', 'full~tights-heavy~tights-light~socks-wool', 'starter+boots'], KNEESOCK = ['full~legs', 'full~legs~toes'];
const closetsOf = n => n === 'cool' ? KNEESOCK : ['starter', 'full'].concat(['cold', 'freezing', 'hard freezing', 'recovery cold'].includes(n) ? ['noleg'] : [], ['hard freezing', 'recovery cold'].includes(n) ? LEGOVER : [],
  n === 'freezing' ? LEGBOOT : [], n === 'wet' ? KNEESOCK : []);
const FIXED_SEEN = new Map(), FIXED8_SEEN = new Map(), RIDELISTS = new Map(); // RIDELISTS: every list a ride gave (any closet, either rider) -> where
// the v6 gaps v7 fixed (V6_GAPS and SKIN_GAPS B until v7): each is judged as any item now, and each must be judged somewhere (a ride's
// list, or the direct lists below where no ride reaches it); the smallest measurement of each is printed
const FIXED_BY_V7 = [
  { ids: ['shoes'], when: L => L.some(x => LEG.includes(x)), point: 1, what: 'shoe covers with leg warmers or tights (their pixels changed; their own colour is v7 point 2)' },
  { ids: ['overshoes'], when: L => L.some(x => LEG.includes(x)), point: 1, what: 'overshoes with leg warmers or tights' },
  { ids: ['jacket-rain'], when: L => L.some(x => ['windbreaker', 'jacket-thermal', 'jacket-winter', 'vest'].includes(x)), point: 2, what: 'the rain jacket with a windbreaker, a jacket or the vest (now outermost, sleeves and body)' },
  { ids: ['windbreaker', 'jacket-thermal', 'jacket-winter'], when: L => L.includes('jersey-heavy'), point: 3, what: 'a windbreaker or a jacket over a thermal jersey (its sleeves and body)' },
  { ids: ['socks-wool'], when: L => L.some(x => LEG.includes(x)) && !L.some(x => COVERS.includes(x)), point: 4, what: 'wool socks under leg warmers or tights (with toe covers or bare shoes)' },
  { ids: ['knees'], when: () => true, point: 5, what: 'knee warmers' },
  { ids: ['skullcap'], when: (L, r) => r.glasses === 'none', point: 6, what: 'the skullcap with glasses none' },
  { ids: ['head'], when: (L, r) => r.glasses === 'shield', point: 7, what: 'the headband with the shield glasses' },
  { ids: ['legs'], when: (L, r) => ['tan', 'olive', 'brown', 'dark', 'deep'].includes(r.skin) && L.includes('shoes'), point: 'B', what: 'leg warmers with shoe covers on tan to deep brown skin (SKIN_GAPS B)' },
];
// the cases v7 held (V7_GAPS, AWAIT; see PAT_WAS), each answered by v8 and judged in full as any item now: each must be judged on a ride's
// list (the wide sweep's are rides' lists too), and the least measurement of each (pixels changed, and its own colour) is printed beside v7's.
// Each 'when' is the entry's width on v7, so the line reads the same cases v7 held. v8 check round 1: each item of an entry must be judged on a
// ride's list (any one did), and so must each of its parts (point 1: each leg wear with and without wool socks); an entry held by a rider's
// fields (AWAIT) lists that width's riders (width: the product of its fields, set on the default rider and RIDER99), each judged on every list a
// ride gave where the entry holds (the wide sweep varies one field at a time from two riders: the thermal jacket was judged on 3 riders, the
// winter jacket on 45, the thermal jersey on 44)
const prod = (fix, vary) => Object.entries(vary).reduce((R, [k, vs]) => R.flatMap(r => vs.map(v => Object.assign({}, r, { [k]: v }))), [fix]);
const DARK_WINTER = { '#1E1E24': ['', '#0B7399', '#212D69', '#1E1E24'], '#212D69': ['', '#212D69', '#5F6A12', '#1E1E24'] }, PLAINISH = ['', 'side'];
const FIXED_BY_V8 = [
  { ids: LEG, when: L => L.includes('overshoes'), parts: [['with wool socks', L => L.includes('socks-wool')], ['without wool socks', L => !L.includes('socks-wool')]], point: '6 point 1', v7: 'tights-heavy 0 px changed with wool socks (the Hard freezing and Recovery cold full lists); any leg wear with overshoes alone 28 / 0', what: 'leg warmers or tights under overshoes, with or without wool socks (V7_GAPS 1, held whole)' },
  { ids: ['shoes'], when: () => true, point: '6 point 2', v7: '202 px changed, 0 in #1E1E24 at the least', what: 'shoe covers, their own colour (V7_GAPS 2, own colour held; v8 #4F6478)' },
  { ids: ['gloves'], when: (L, r) => r.skin === 'deep', point: '6 point 3', v7: '0 px changed (the wet lists)', what: 'full-finger gloves on deep brown skin (V7_GAPS 3, held whole)' },
  { ids: ['gloves-finger'], when: (L, r) => r.skin === 'deep', point: '6 point 3', v7: '304 px changed, 8 in #2A2A30', what: 'fingerless gloves on deep brown skin (V7_GAPS 3, own colour held)' },
  { ids: ['jacket-winter'], when: (L, r) => (DARK_WINTER[r.kit] || []).includes(r.kit2) && ['#1E1E24', '#212D69'].includes(r.shorts) && PLAINISH.includes(r.pattern), width: O => Object.entries(DARK_WINTER).flatMap(([kit, fades]) => prod({ kit }, { kit2: fades, shorts: ['#1E1E24', '#212D69'], pattern: PLAINISH, sleeve: O.sleeve })), point: '6B point 6', v7: '240-276 px changed, 0-36 in #1E2A4A', what: 'the winter jacket on a Black jersey (fade Same, Deep blue, Navy, Black) or a Navy one (Same, Navy, Olive, Black), Black or Navy shorts, plain or the side stripe (AWAIT, own colour held; v8 #2F6B4F)' },
  { ids: ['jacket-thermal'], when: (L, r) => r.kit === '#212D69' && ['', '#0B7399', '#212D69', '#1E1E24'].includes(r.kit2) && r.shorts === '#212D69' && PLAINISH.includes(r.pattern), width: O => prod({ kit: '#212D69', shorts: '#212D69' }, { kit2: ['', '#0B7399', '#212D69', '#1E1E24'], pattern: PLAINISH, sleeve: O.sleeve }), point: '6B point 6', v7: '240-290 px changed, 0-29 in #2F3B6E', what: 'the thermal jacket on a Navy jersey with Navy shorts (fade Same, Deep blue, Navy, Black), plain or the side stripe (AWAIT, own colour held; v8 #5B4E9E)' },
  { ids: ['jersey-heavy'], when: (L, r) => r.kit === '#1E1E24' && L.includes('arms') && L.includes('vest'), width: O => prod({ kit: '#1E1E24' }, { kit2: O.kit2, sleeve: O.sleeve, shorts: O.shorts, pattern: O.pattern }), point: '6B point 7', v7: '0 px changed with any fade, sleeves, shorts and pattern', what: 'the thermal jersey in Black with arm warmers and the vest (AWAIT, held whole; v8 its white cuff)' },
];
// the by-design rules' edges the rides reach, judged as any item and printed with the least measurement; each must be judged on a ride's list
// (review round 5: wool socks over bare shins with shoe covers or boots, outside the rule, on the cold and freezing rides with a closet that has
// no leg wear or knee warmers)
const EDGES = [
  { ids: ['socks-wool'], when: L => L.some(x => x === 'shoes' || x === 'boots') && !L.includes('overshoes') && !L.some(x => SHIN.includes(x)), what: 'wool socks over bare shins with shoe covers or boots (outside the by-design rule: v7 draws them there)' },
  /* v8 check round 1: v8 draws the socks there, where v7's rule held them by design */
  { ids: ['socks-wool'], when: L => L.includes('overshoes') && !L.some(x => SHIN.includes(x)), what: 'wool socks over bare shins under overshoes (v8 draws them, v7 0: by design until v8)' },
  { ids: ['socks-wool'], when: L => L.includes('shoes') && !L.some(x => x === 'overshoes' || x === 'boots' || x === 'knees') && L.some(x => LEG.includes(x)), what: 'wool socks over leg wear or tights above shoe covers (v8 128 / 64, v7 96 / 32: by design until v8)' },
];
const EDGE_SEEN = new Map();
// cases found on v7 and recorded "not held" because no list the strip got had them (Bundle v7: boots with no wool socks under them, and the leg
// wear above them; review round 5: wool socks under knee warmers with toe covers or bare shoes). The app's strip gets each (v8 check round 2: a
// rider's own closet without wool socks on a freezing ride, without leg warmers on a wet or cool one), so each is judged as any item, must be
// judged on a ride's list (every item and part, as FIXED_BY_V8) and is printed with its least
const FOUND = [
  { ids: ['boots'], when: L => !L.includes('socks-wool'), what: 'boots with no wool socks (Bundle v7: found, not held)' },
  { ids: LEG, when: L => L.includes('boots') && !L.includes('socks-wool'), what: 'leg warmers or tights above boots with no wool socks (Bundle v7: found, not held)' },
  { ids: ['socks-wool'], when: L => L.includes('knees') && !L.some(x => COVERS.includes(x)), parts: [['with toe covers', L => L.includes('toes')], ['with bare shoes', L => !L.includes('toes')]], what: 'wool socks under knee warmers with toe covers or bare shoes (review round 5: found, not held)' },
];
const FOUND_SEEN = new Map();
// ACCEPTED_V8 (Bundle v8 accepted: Mark's decision after the v8 check rounds; FROM-APP-CHAT-7 asks the design chat for these as polish, a v9
// a later item takes, and item 99 ships on v8 without it). The cases q99 found reading under SHOW on v8, each tied to its FROM-APP-CHAT-7 point
// and exactly as wide as measured on v8 (Q99_ACCEPT_DUMP below): when (the lists) and width (each screen q99 measures it on -> each item -> the
// skins where it reads under SHOW there; every jersey, fade, sleeves, shorts and pattern and both riders read alike within a skin on v8). A
// reading inside an entry's width that is under SHOW passes only at or over its floor for that item on that screen: 90% of the item's least
// v8 reading there, pixels changed and own colour separately (own 0 where v8's least is 0); one that reaches SHOW prints "now shows" (a note, never a
// failure: a later item can drop it). Anything outside the list that reads under SHOW still fails; SHOW, PAT_SHOW, OWN and the by-design
// rules are unchanged. least: screen -> item -> [pixels changed, own], the least v8 reading of that item over the entry's width on that screen
// (per item, not per entry: an entry-wide floor is its weakest item's, and left room for another item to lose what it reads by: the fingerless
// gloves, 320 / 8 at Chromium 2x, could lose their cuff, 200 / 28, over the full-finger gloves' 184 / 0; skeptic, Bundle v8 accepted). As measured on v8
// (probe99/accept/dump1.jsonl, every reading of the entries' items on their lists, both riders, 8 skins, every jersey and what the sweeps vary,
// Chromium and WebKit at 2x and 3x; no cell mixed, the rest of each list at SHOW); entries 1-5 went with v9 (item 100: on a green run, OWN.boots
// #B0343A, each printed "now shows" and "never under SHOW" on every screen of its width; probe100/main/runs/q99-keep6.log; v9's least
// readings beside v8's in DECISIONS.md Item 100, Bundle v9), so their cases fail under SHOW as any item, and FORMER_V8 (below) keeps each
// width measured on every screen of it; as they were on v8:
//   1 boots over leg wear, no wool socks: every skin, every screen (192-193 / 18-19 at Chromium 2x; over bare shins 506 / 192, outside)
//   2 leg wear above boots, no wool socks: at 2x (both engines) leg warmers and light tights on tan to deep brown, heavy tights on olive to
//     deep brown (fair to ruddy read 126-130 / 44-50); at 3x (both engines) leg warmers and light tights on dark and deep brown, heavy tights
//     on deep brown
//   3 leg wear above overshoes, no wool socks: Chromium 2x leg warmers and light tights on brown to deep brown, heavy tights on brown and deep
//     brown (dark 120 / 50 reads); WebKit 2x leg warmers and light tights on tan to deep brown, heavy tights on brown to deep brown; at 3x it
//     reads (no width there); with wool socks it reads (192 / 144)
//   4 wool socks under knee warmers, no cover (toe covers 92 / 50, bare shoes 114 / 52 at Chromium 2x): every skin, every screen
//   5 wool socks over leg wear above shoe covers: Chromium and WebKit at 3x, every skin (260 and 264 / 148); at 2x they read (128 / 64)
// the one left:
//   6 dark gloves on deep brown skin (full-finger 204 / 0, fingerless 320 / 8 at Chromium 2x): every screen (dark brown 516 / 312 reads); on
//     v9 every reading as v8's (the art unchanged)
const SK8 = ['fair', 'light', 'ruddy', 'tan', 'olive', 'brown', 'dark', 'deep'], SCR = ['Chromium 2x', 'Chromium 3x', 'WebKit 2x', 'WebKit 3x'];
const SK_TAN = SK8.slice(3), SK_OLIVE = SK8.slice(4), SK_BROWN = SK8.slice(5), SK_DARK = SK8.slice(6), SK_DEEP = ['deep'], all4 = W => Object.fromEntries(SCR.map(s => [s, W]));
const per = (id, L) => Object.fromEntries(Object.entries(L).map(([s, v]) => [s, { [id]: v }])); // an entry of one item: screen -> that item -> its least
const ACCEPTED_V8 = [ /* entries 1-5 went with v9 (item 100); n keeps its number, as FROM-APP-CHAT-7 and the notes name it */
  { n: 6, point: '"for the record"', ids: ['gloves', 'gloves-finger'], when: () => true, what: 'full-finger and fingerless dark gloves on deep brown skin, which read by their #C9D1DA cuff',
    width: all4({ gloves: SK_DEEP, 'gloves-finger': SK_DEEP }), least: { 'Chromium 2x': { gloves: [204, 0], 'gloves-finger': [320, 8] }, 'Chromium 3x': { gloves: [400, 0], 'gloves-finger': [740, 56] },
      'WebKit 2x': { gloves: [212, 0], 'gloves-finger': [316, 8] }, 'WebKit 3x': { gloves: [396, 0], 'gloves-finger': [740, 56] } } },
];
// FORMER_V8: the entries v9 retired (item 100), as they were. No floor: each case is judged against SHOW as any item. But each case (its
// lists, every skin) is measured on every screen whatever Chromium at 2x reads, as item 99's q99 measured it on v8, where all of it read
// close to the line: v9 reads it well past the band, which alone would drop it from the other screens (the socks over leg wear above shoe
// covers read 196 / 128 at Chromium 2x, and mut99's v8c2-wksock, Safari alone drawing them as nothing, passed). The v8 widths alone were not
// enough (v9 check round 1): fair skin's leg wear above boots reads 126 / 44 on v8, inside the band and outside entry 2's width (tan and
// darker), and v9's 252 / 116 dropped it from Safari and 3x: v9c1-wkfair, Safari alone drawing it as nothing, passed. width and least stay
// v8's, printed beside v9's least inside the width (never a floor)
const FORMER_V8 = [
  { n: 1, point: 'point 1', ids: ['boots'], when: L => L.includes('boots') && !L.includes('socks-wool') && L.some(x => LEG.includes(x)), what: 'boots over leg warmers or tights with no wool socks: the boots\' own colour (#3A2F2A within 48 of the leg wear: they read by their outline)',
    width: all4({ boots: SK8 }), least: per('boots', { 'Chromium 2x': [192, 18], 'Chromium 3x': [353, 61], 'WebKit 2x': [194, 18], 'WebKit 3x': [334, 46] }) },
  { n: 2, point: 'point 2', ids: LEG, when: L => L.includes('boots') && !L.includes('socks-wool'), what: 'leg warmers or tights above boots with no wool socks, on the skins where they read under SHOW',
    width: { 'Chromium 2x': { legs: SK_TAN, 'tights-light': SK_TAN, 'tights-heavy': SK_OLIVE }, 'Chromium 3x': { legs: SK_DARK, 'tights-light': SK_DARK, 'tights-heavy': SK_DEEP },
      'WebKit 2x': { legs: SK_TAN, 'tights-light': SK_TAN, 'tights-heavy': SK_OLIVE }, 'WebKit 3x': { legs: SK_DARK, 'tights-light': SK_DARK, 'tights-heavy': SK_DEEP } },
    least: { 'Chromium 2x': { legs: [70, 26], 'tights-light': [70, 26], 'tights-heavy': [74, 28] }, 'Chromium 3x': { legs: [228, 82], 'tights-light': [228, 82], 'tights-heavy': [228, 84] },
      'WebKit 2x': { legs: [67, 23], 'tights-light': [67, 23], 'tights-heavy': [74, 29] }, 'WebKit 3x': { legs: [233, 84], 'tights-light': [233, 84], 'tights-heavy': [233, 88] } } },
  { n: 3, point: 'point 2', ids: LEG, when: L => L.includes('overshoes') && !L.includes('socks-wool'), what: 'leg warmers or tights above overshoes with no wool socks, on the skins and screens where they read under SHOW',
    width: { 'Chromium 2x': { legs: SK_BROWN, 'tights-light': SK_BROWN, 'tights-heavy': ['brown', 'deep'] }, 'WebKit 2x': { legs: SK_TAN, 'tights-light': SK_TAN, 'tights-heavy': SK_BROWN } },
    least: { 'Chromium 2x': { legs: [110, 42], 'tights-light': [110, 42], 'tights-heavy': [114, 44] }, 'WebKit 2x': { legs: [103, 39], 'tights-light': [103, 39], 'tights-heavy': [110, 45] } } },
  { n: 4, point: 'point 3', ids: ['socks-wool'], when: L => L.includes('knees') && !L.some(x => COVERS.includes(x)), what: 'wool socks under knee warmers with toe covers or bare shoes',
    width: all4({ 'socks-wool': SK8 }), least: per('socks-wool', { 'Chromium 2x': [92, 50], 'Chromium 3x': [196, 174], 'WebKit 2x': [90, 48], 'WebKit 3x': [202, 176] }) },
  { n: 5, point: 'point 4', ids: ['socks-wool'], when: L => L.includes('shoes') && !L.some(x => x === 'overshoes' || x === 'boots' || x === 'knees') && L.some(x => LEG.includes(x)), what: 'wool socks over leg warmers or tights above shoe covers, on the 3x screens',
    width: { 'Chromium 3x': { 'socks-wool': SK8 }, 'WebKit 3x': { 'socks-wool': SK8 } }, least: per('socks-wool', { 'Chromium 3x': [260, 148], 'WebKit 3x': [264, 148] }) },
];
const formerElsewhere = (id, L, r) => FORMER_V8.some(e => e.ids.includes(id) && e.when(L, r));
const FORMER_SEEN = new Map(); // entry|screen|item -> judged how often, the skins, the least changed and own; and the same inside its v8 width (q)
const lowest = (w, v, tag) => { w.n++; if (!w.d || v.d48 < w.d.v.d48) w.d = { v, tag }; if (v.own != null && (!w.o || v.own < w.o.v.own)) w.o = { v, tag }; };
function formerRec(id, L, r, v, scr, tag) { for (const e of FORMER_V8) { if (!e.ids.includes(id) || !e.when(L, r)) continue;
  const k = e.n + '|' + scr + '|' + id, w = FORMER_SEEN.get(k) || { n: 0, cells: new Set(), q: { n: 0 } }; lowest(w, v, tag); w.cells.add(r.skin);
  if (((e.width[scr] || {})[id] || []).includes(r.skin)) lowest(w.q, v, tag); FORMER_SEEN.set(k, w); } }
// Q99_ACCEPT_DUMP=<file>: measure the widths again (every entry taken as wide as its lists, on every skin and screen; no floors): each reading
// of an entry's items on its lists, on every screen, one JSON line each (the entries' widths and least readings come from such a run on v8).
// A measuring run, never a verdict: with it set the strip section fails its first check, so the run ends FAIL, and its accepted readings
// print "measured" rather than "at or over its floor" (skeptic, Bundle v8 accepted: a dump run on a page whose leg wear above boots drew
// nothing on deep brown skin ended OK, and the mutant runner hands its own environment on; mut99's v8a-dump)
const DUMP = process.env.Q99_ACCEPT_DUMP || null; if (DUMP) fs.writeFileSync(DUMP, '');
const accOf = (id, L, r, scr) => ACCEPTED_V8.find(e => e.ids.includes(id) && e.when(L, r) && (!!DUMP || ((e.width[scr] || {})[id] || []).includes(r.skin))) || null;
// an entry's case whose item and skin are inside its width on another screen: measured there whatever Chromium at 2x read (so a case that
// reads well past the band here, a later build's "now shows", still has every cell of its width judged)
const accElsewhere = (id, L, r) => !DUMP && ACCEPTED_V8.some(e => e.ids.includes(id) && e.when(L, r) && SCR.slice(1).some(s => ((e.width[s] || {})[id] || []).includes(r.skin)));
const floorOf = (e, scr, id) => ((e.least[scr] || {})[id] || [0, 0]).map(x => Math.ceil(x * 0.9)); // 90% of the item's least v8 reading on that screen, in whole device px
const floorOk = (e, scr, id, v) => !!DUMP || (v.d48 >= floorOf(e, scr, id)[0] && (v.own == null || v.own >= floorOf(e, scr, id)[1]));
const ACC_SEEN = new Map(); // entry|screen -> its readings: each item's under SHOW (count, least changed, least own, where), now shows (count, where), the width's cells judged
function accRec(e, scr, id, L, r, v, under, tag) { const k = e.n + '|' + scr, w = ACC_SEEN.get(k) || { e, scr, it: new Map(), now: [], cells: new Set() }; w.cells.add(id + '|' + r.skin);
  if (under) { const q = w.it.get(id) || { n: 0 }; q.n++; if (!q.d || v.d48 < q.d.v.d48) q.d = { v, tag }; if (v.own != null && (!q.o || v.own < q.o.v.own)) q.o = { v, tag }; w.it.set(id, q); } else w.now.push(id + ' ' + v.d48 + ' / ' + v.own + ' (' + tag + ')');
  ACC_SEEN.set(k, w); if (DUMP) fs.appendFileSync(DUMP, JSON.stringify({ e: e.n, scr, id, L: L.join(' '), skin: r.skin, r: J(r), d48: v.d48, own: v.own, under, tag }) + '\n'); }
// the items that show within half again of SHOW on Chromium at 2x (v8 check round 2: on WebKit, and at 3x, the thinnest fell on the other side
// of the line; the widest gap measured, leg warmers over overshoes on tan skin, 156 px here and 116 in WebKit at 2x, a quarter less): list and
// rider -> the items and their measurements here, measured again as other screens draw them at the end of the strip section
const NEAR = new Map(), NEAR_BAND = 1.5;
// the direct lists (the v6 gaps v7 fixed that no ride reaches, and the socks' edge); the outer layers and the rider's fields the wide sweep
// varies on every jersey (review round 7); each leg wear under overshoes with and without wool socks, and the socks over bare shins under
// overshoes and over leg wear above shoe covers (v8 check round 1); FOUND's cases (v8 check round 2), each in every jersey and every skin
const DIRECT = [['windbreaker', 'jacket-rain'], ['jacket-thermal', 'jacket-rain'], ['jacket-winter', 'jacket-rain'], ['jersey-heavy', 'vest', 'jacket-rain'], ['jersey-heavy', 'windbreaker'], ['socks-wool'], ['tights-heavy', 'socks-wool'], ['socks-wool', 'shoes'], ['socks-wool', 'boots'],
  ...LEG.flatMap(l => [[l, 'overshoes'], [l, 'socks-wool', 'overshoes']]), ['socks-wool', 'overshoes'], ['legs', 'socks-wool', 'shoes'],
  /* v8 check round 2 (FOUND): boots with no wool socks, alone and under each leg wear; wool socks under knee warmers with toe covers and bare shoes */
  ['boots'], ...LEG.map(l => [l, 'boots']), ['knees', 'socks-wool', 'toes'], ['knees', 'socks-wool']];
const OUTER = ['vest', 'windbreaker', 'jacket-thermal', 'jacket-winter', 'jacket-rain', 'jersey-heavy'], VARY = ['kit2', 'sleeve', 'shorts', 'pattern'];
// an entry's record (FIXED_BY_V8, FOUND), and each of its parts (the same record): judged how often, shows every time, on a ride's list, the
// least and the least own
function track(M, F, id, L, r, v, shows, ride, tag) { F.forEach((f, n) => { if (!f.ids.includes(id) || !f.when(L, r)) return; const k = n + ':' + id, w = M.get(k) || { f, id, n: 0, shows: true, ride: false, parts: {} };
  for (const q of [w, ...(f.parts || []).filter(([, pf]) => pf(L)).map(([pn]) => w.parts[pn] || (w.parts[pn] = { n: 0, shows: true, ride: false }))]) {
    q.n++; q.shows = q.shows && shows; q.ride = q.ride || ride; if (!q.v || v.d48 < q.v.d48) Object.assign(q, { v, tag }); if (v.own != null && (!q.o || v.own < q.o.v.own)) q.o = { v, tag }; }
  M.set(k, w); }); }
// every rider shown (the default and the built one) is judged, nothing held outside ACCEPTED_V8 (bundle v8, and bundle v8 accepted, Mark's
// decision; until v8 V7_GAPS and AWAIT held cases as measured on v7, FIXED_BY_V8). agg (the wide sweep): count and collect rather than one check per item
function judge(tag, S, px, agg, only) {
  const L = S.ids || [], chk = (c, name, d) => { if (!agg) return ok(c, name, d); agg.n++; if (!c) agg.bad.push(name); }, ride = / ride \(/.test(tag);
  for (const id of L) { if (byDesign(id, L) || (only && !only.includes(id))) continue; const v = px[id], d = !!v && v.d48 >= SHOW.d48, o = !!v && (v.own == null || v.own >= SHOW.own);
    /* ACCEPTED_V8: a reading inside an entry's v8 width (Chromium at 2x) passes under SHOW at or over its floor; at SHOW it prints "now shows" */
    const acc = v ? accOf(id, L, S.r, SCR[0]) : null, under = !(d && o); if (acc) accRec(acc, SCR[0], id, L, S.r, v, under, tag); if (v) formerRec(id, L, S.r, v, SCR[0], tag);
    if (acc && under) { const fl = floorOf(acc, SCR[0], id); chk(floorOk(acc, SCR[0], id, v), 'strip: ' + tag + ': ' + id + ' reads under SHOW (' + v.d48 + ' device px changed, ' + v.own + ' in its own colour), accepted on v8 (ACCEPTED_V8 ' + acc.n + ', FROM-APP-CHAT-7 ' + acc.point + ') ' + (DUMP ? 'measured on Chromium at 2x (Q99_ACCEPT_DUMP: no width or floor applied; ' + id + '\'s floor ' : 'at or over its floor on Chromium at 2x (' + id + '\'s, ') + fl[0] + ' / ' + fl[1] + ')', { v, L }); }
    else chk(d && o, 'strip: ' + tag + ': ' + id + ' shows on the rider (' + (v ? v.d48 + ' device px changed' + (v.own != null ? ', ' + v.own + ' in its own colour' : '') : 'not measured') + ')', { v, L });
    FIXED_BY_V7.forEach((f, n) => { if (!f.ids.includes(id) || !f.when(L, S.r)) return; const k = n + ':' + id, w = FIXED_SEEN.get(k);
      if (!w || v.d48 < w.v.d48) FIXED_SEEN.set(k, { f, id, v, tag, shows: d && o, n: (w ? w.n : 0) + 1 }); else w.n++; });
    /* the cases v7 held, and those found unjudged (FOUND): the least pixels changed and the least in its own colour, each with where; shows only if every judgement did */
    track(FIXED8_SEEN, FIXED_BY_V8, id, L, S.r, v, d && o, ride, tag); track(FOUND_SEEN, FOUND, id, L, S.r, v, d && o, ride, tag);
    /* close to the line: measured again on other screens (Chromium at 3x, WebKit at 2x and 3x) */
    /* (an accepted reading too: its floor holds on every screen q99 measures it on; acc marks it, out of the band's own check; and any reading of
       an entry's case inside its width on another screen) */
    if ((d && o && (v.d48 < SHOW.d48 * NEAR_BAND || (v.own != null && v.own < SHOW.own * NEAR_BAND))) || (acc && under) || accElsewhere(id, L, S.r) || (v && formerElsewhere(id, L, S.r))) { const k = L.join(' ') + '|' + J(S.r), w = NEAR.get(k) || { ids: L, r: S.r, items: new Map(), tag }; w.items.set(id, acc && under ? Object.assign({ acc: true }, v) : v); NEAR.set(k, w); }
    EDGES.forEach((f, n) => { if (!f.ids.includes(id) || !f.when(L, S.r)) return; const k = n + ':' + id, w = EDGE_SEEN.get(k), rd = ride || !!(w && w.ride);
      if (!w || v.d48 < w.v.d48) EDGE_SEEN.set(k, { f, id, v, tag, shows: d && o, n: (w ? w.n : 0) + 1, ride: rd }); else { w.n++; w.ride = rd; } }); }
}
section('strip', async () => {
  // Q99_ACCEPT_DUMP turns off ACCEPTED_V8's widths and floors (it measures them again): such a run is never a verdict, so it fails here first
  ok(!DUMP, 'strip: ACCEPTED_V8\'s widths and floors apply (Q99_ACCEPT_DUMP ' + (DUMP ? 'is set: ' + DUMP + ': a measuring run with no widths or floors, not a verdict' : 'not set') + ')', DUMP);
  const [SKINS, KITS, , VOPT] = await (async () => { const x = await openH({ noErrs: true }), v = await x.p.evaluate(V => [Object.keys(FW.SKIN), FW.RIDER_OPTIONS.kit.map(k => [k, FW.RIDER_NAMES.kit[k]]), +FW.version,
    Object.fromEntries(V.map(k => { const o = FW.RIDER_OPTIONS[k]; return [k, Array.isArray(o) ? o.map(v => [v, FW.RIDER_NAMES[k][v]]) : Object.entries(o)]; }))], VARY); await x.close(); return v; })();
  const WIDE = new Map(); // the lists a ride gives that carry an outer layer: list -> its ride and closet
  for (const [n, wx, eff] of RIDES) for (const rider of [null, RIDER99]) { // every ride, both closets, the default rider and the built one
    const x = await openH({ wx, settings: rider ? { rider } : {}, dpr: 2 }), p = x.p, who = rider ? 'RIDER99' : 'the default rider';
    if (eff) { await p.click('#intensity [data-int=' + eff + ']'); await settle(p, 150); ok(await p.evaluate(e => window.__q99.readInputs().intensity === e, eff), 'strip: ' + n + ' ride: the effort is ' + eff, eff); }
    await crunch(p); await toY(p, '#rWearCard'); await settle(p, 300);
    for (const kind of closetsOf(n)) {
      if (kind !== 'starter') await setCloset(p, kind);
      const S = await stripOf(p), tag = n + ' ride (' + Math.round(S.minF) + '-' + Math.round(S.maxF) + ' F' + (S.rain ? ', rain ' + S.rain + '%' : '') + '), ' + closetName(kind) + ' closet, ' + who;
      console.log('  info: ' + tag + ': ' + (S.ids || []).join(' '));
      ok(!!S.ids && JSON.stringify(S.ids) === JSON.stringify(S.list) && S.list.every(id => S.ticks.includes(id)) && S.ticks.every(id => S.list.includes(id)), '99.4: ' + tag + ': the strip gets exactly the items outfit() lists (o.wear: the list\'s rows), in its order', S);
      ok(S.svg && S.same, '99.4: ' + tag + ': the strip is FW.riderOutfit(the rider, those ids) (ids aside)', { same: S.same });
      ok(S.w === 100 && S.h === 150 && S.mid != null && Math.abs(S.mid) <= 1 && S.inCard && S.above && S.hid === 'true' && S.text === '' && !S.css.length && Math.abs(S.boxH) < 1, 'strip: ' + tag + ': 100 x 150 px, centred (' + S.mid + ' px off its box\'s middle), in the card above the list, aria-hidden, no text (none in its markup, none painted by CSS, its box only the drawing and its padding: items 73, 75, 76)', S);
      ok(S.still && !!S.rec && S.rec.s === true, 'strip: ' + tag + ': still (fwMount o.still: no .fwm-go, nothing running)', S.rec);
      painted(await paintOf(p, '#rRider svg', 'strip'), 'strip: ' + tag + ': the rider shows, whole');
      judge(tag, S, await pxOf(p, S.r, S.ids || [], Object.assign({}, OWN, OWN_HEAVY)));
      if (S.ids && S.ids.length && !RIDELISTS.has(S.ids.join(' '))) RIDELISTS.set(S.ids.join(' '), tag.replace(/, (the default rider|RIDER99)$/, '')); /* the widths' lists (below) */
      /* the wide sweep's lists (below): the starter, full and noleg closets' (the leg-wear closets change only the legs) */
      if (!/[+~]/.test(kind) && (S.ids || []).some(id => OUTER.includes(id)) && !WIDE.has((S.ids || []).join(' '))) WIDE.set(S.ids.join(' '), tag.replace(/, (the default rider|RIDER99)$/, ''));
      // the same list on every other skin (the default rider in that skin): a dark item on dark skin is judged wherever the list has it
      if (!rider) for (const sk of SKINS) { if (sk === S.r.skin) continue; const r = Object.assign({}, S.r, { skin: sk });
        judge(tag.replace('the default rider', 'the default rider in ' + sk + ' skin'), { ids: S.ids, r }, await pxOf(p, r, S.ids || [], Object.assign({}, OWN, OWN_HEAVY))); }
      // and in every jersey colour, both riders (review round 4: only Bluebird blue and Coral were judged, and the jersey is what the jackets,
      // the vest and the thermal jersey are drawn over and in)
      for (const [kit, kn] of KITS) { if (kit === S.r.kit) continue; const r = Object.assign({}, S.r, { kit });
        judge(tag + ' in a ' + kn + ' jersey', { ids: S.ids, r }, await pxOf(p, r, S.ids || [], Object.assign({}, OWN, OWN_HEAVY))); }
    }
    if (n === 'hot' && !rider) {
      // the strip is kept by its key: the results drawn again (the same ride, rider and items) leave its drawing as it is
      await p.evaluate(() => { const e = document.getElementById('rRider'); e.querySelector('svg').__q99 = 1; window.__q99st = 0; new MutationObserver(r => { window.__q99st += r.length; }).observe(e, { subtree: true, childList: true }); });
      await p.evaluate(() => { for (let k = 0; k < 3; k++) window.__q99.refreshResults(); }); await settle(p, 300);
      const K = await p.evaluate(() => { const s = document.querySelector('#rRider svg'); return { same: !!s && s.__q99 === 1, muts: window.__q99st }; });
      ok(K.same && K.muts === 0, 'strip: kept by its key: the results drawn again three times (the same rider and items) draw nothing again (the same svg, no child changed)', K);
    }
    if (n === 'cold' && !rider) {
      // a closet item of your own the ride lists, and tampered closet ids (an id '__proto__', 'constructor', a number): never on the strip, never break it
      const own = [{ id: 'k9own1', label: 'My winter vest', group: 'Custom', kind: 'cold', at: { recovery: 70, z2: 70, hard: 70 } }, { id: '__proto__', label: 'Odd', group: 'Custom', kind: 'cold', at: { recovery: 70, z2: 70, hard: 70 } },
        { id: 'constructor', label: 'Odd 2', group: 'Custom', kind: 'cold', at: { recovery: 70, z2: 70, hard: 70 } }, { id: 7, label: 'Odd 3', group: 'Custom', kind: 'cold', at: { recovery: 70, z2: 70, hard: 70 } }];
      await setCloset(p, 'starter', own); const S = await stripOf(p);
      const want = S.list.filter(id => typeof id === 'string' && !['k9own1', '__proto__', 'constructor'].includes(id));
      ok(S.list.includes('k9own1') && S.list.includes('__proto__') && JSON.stringify(S.ids) === JSON.stringify(want) && S.svg && S.same, '99.4: a closet item of your own (a uid id) and tampered ids (\'__proto__\', \'constructor\', a number) that the list names never reach the strip, and it still draws', { ids: S.ids, list: S.list });
    }
    await x.close();
  }
  // the strip as the app draws it for riders on which v7's dark jackets read poorly (review round 7: only the two riders were built in the app):
  // a Navy jersey with a Navy fade and a Black one with a Black fade and white sleeves on the freezing full list (the winter jacket), a Navy
  // jersey with Navy shorts on the cold full list (the thermal jacket): the strip gets every item the list names and draws them, as painted
  for (const [n, wx, r, jk] of [['freezing', { lo: 24, hi: 29 }, Object.assign({}, RIDER99, { kit: '#212D69', kit2: '#212D69', sleeve: '' }), 'jacket-winter'], ['freezing', { lo: 24, hi: 29 }, Object.assign({}, RIDER99, { kit: '#1E1E24', kit2: '#1E1E24', sleeve: '#FFFFFF' }), 'jacket-winter'],
    ['cold', { lo: 40, hi: 44 }, Object.assign({}, RIDER99, { kit: '#212D69', kit2: '', shorts: '#212D69' }), 'jacket-thermal']]) {
    const x = await openH({ wx, settings: { rider: r }, dpr: 2 }), p = x.p; await crunch(p); await toY(p, '#rWearCard'); await settle(p, 300); await setCloset(p, 'full');
    const S = await stripOf(p), tag = n + ' ride, full closet, a ' + KITS.find(k => k[0] === r.kit)[1] + ' jersey (fade ' + JSON.stringify(r.kit2) + ', sleeves ' + JSON.stringify(r.sleeve) + ', shorts ' + r.shorts + ')';
    ok(J(S.r) === J(r) && !!S.ids && J(S.ids) === J(S.list) && S.ids.includes(jk) && S.svg && S.same, '99.4: ' + tag + ': the strip gets exactly the items outfit() lists (' + jk + ' too) and is FW.riderOutfit of them', { ids: S.ids, list: S.list, same: S.same });
    painted(await paintOf(p, '#rRider svg', 'strip'), 'strip: ' + tag + ': the rider shows, whole');
    await x.close(); }
  // a rider changed while the results are up redraws the strip shown (riderApply): in the sheet, by a restore, and arriving by sync
  const stripNow = async (p, kit, how) => { await p.click('nav.tabs button[data-view=plan]:visible, #sbNav [data-view=plan]:visible').catch(() => {}); await settle(p, 300); await toY(p, '#rWearCard'); await settle(p, 200); const S = await stripOf(p);
    ok(S.svg && S.same && S.r.kit === kit && J(S.ids) === J(S.list), 'strip: a rider changed ' + how + ' while the results are up: the strip shown is redrawn in the new rider (' + kit + '), the list\'s items', { kit: S.r.kit, same: S.same }); };
  { const x = await openH({ wx: { lo: 40, hi: 44 }, settings: { rider: RIDER99 } }), p = x.p; await crunch(p); await toY(p, '#rWearCard'); await settle(p, 300);
    await sheet(p); await group(p, 'kit'); await tap(p, 'kit', '#BECC41'); await done(p); await stripNow(p, '#BECC41', 'in the sheet');
    const bk = await p.evaluate(() => { const d = JSON.parse(JSON.stringify(window.__q99.backupData())); d.settings.rider = Object.assign({}, d.settings.rider, { kit: '#F28C28' }); return d; });
    await restore(p, bk); await stripNow(p, '#F28C28', 'by a restore');
    await x.close(); }
  // by sync, with the sheet open (review round 4: only the strip and the header were looked at after a sync): the sheet follows too, each
  // field's pressed choice and name, the three summaries and its live rider (drawn and painted), and the row names the new jersey
  { const be = new Backend(), A = await synced(be, { label: 'ap', dpr: 2, wx: { lo: 40, hi: 44 }, settings: { rider: RIDER99 } }), p = A.p; await ready(be, A); await crunch(p); await toY(p, '#rWearCard'); await settle(p, 300);
    await sheet(p); await allOpen(p);
    const NR = Object.assign({}, RIDER99, { kit: '#2ABCBB', skin: 'tan', face: 'stache', glasses: 'shield', pattern: 'band', shorts: '#3048B4' });
    const now = Date.now() + 5000, d = JSON.parse(JSON.stringify(doc(be))); d.settings.rider = NR; d.settings.updatedAt = now; d.settingsAt = Object.assign({}, d.settingsAt, { rider: now, _u: now }); be.fs.set('users/u1', d);
    await nudge([p], () => p.evaluate(() => window.__q99.settings.rider && window.__q99.settings.rider.kit === '#2ABCBB')); await settle(p, 200);
    const S = await sheetOf(p), N = await namesOf(p, NR), U = await sumsOf(p, NR), row = await p.evaluate(() => document.getElementById('prowV-rider').textContent);
    ok(J(S.r) === J(NR) && FIELDS.every(k => S.pressed[k].length === 1 && S.pressed[k][0] === NR[k] && S.names[k] === N[k]) && S.sums.join('|') === U.join('|') && S.figSame && row === 'Teal jersey', 'strip: a rider arriving by sync with the sheet open: the sheet follows (each field\'s pressed choice and name, the summaries "' + S.sums.join(' / ') + '", its live rider) and the row names the new jersey ("' + row + '")', { pressed: S.pressed, names: S.names, sums: S.sums, figSame: S.figSame, row });
    painted(await paintOf(p, '#rdFig svg', 'fig'), 'strip: by sync with the sheet open: the sheet\'s live rider shows');
    await done(p); await stripNow(p, '#2ABCBB', 'by sync');
    await A.close(); }
  // a ride that warms (items shed on the way): the strip lists every item the list does, the shed ones too
  { const x = await openH({ wx: { lo: 40, hi: 80 } }), p = x.p; await crunch(p); await toY(p, '#rWearCard'); await settle(p, 300); const S = await stripOf(p);
    ok(S.shed.length > 0 && JSON.stringify(S.ids) === JSON.stringify(S.list) && S.shed.every(id => S.ids.includes(id)), '99.4: a ride that warms (' + Math.round(S.minF) + ' to ' + Math.round(S.maxF) + ' F): the strip wears every item the list names, the ones shed on the way too (' + S.shed.join(', ') + ')', S);
    await x.close(); }
  // the Clothing-only results (Plan for Clothing, no gel or drink mix in the library: the Crunch falls back to renderClothingOnly): the strip
  // there as in the full plan, and following a closet change (refreshResults' wear-only branch) (review round 3: never opened before)
  { const x = await openH({ athlete: null, dpr: 2, wx: { lo: 40, hi: 44 }, settings: { planMode: 'clothing', rider: RIDER99 }, storage: { 'bluebird.library.v5': { gels: [], powders: [] } } }), p = x.p;
    await crunch(p); await toY(p, '#rWearCard'); await settle(p, 300); let first = null;
    for (const kind of ['starter', 'full']) { if (kind === 'full') await setCloset(p, 'full');
      const S = await stripOf(p), w = await p.evaluate(() => document.getElementById('results').dataset.wearOnly || null), tag = 'the Clothing-only results (#results data-wear-only ' + w + '), ' + kind + ' closet, RIDER99';
      console.log('  info: ' + tag + ': ' + (S.ids || []).join(' '));
      ok(w === '1' && S.list.length > 0 && !!S.ids && J(S.ids) === J(S.list) && S.list.every(id => S.ticks.includes(id)) && S.ticks.every(id => S.list.includes(id)) && S.svg && S.same, '99.4: ' + tag + ': the strip gets exactly the items outfit() lists (the list\'s rows) and is FW.riderOutfit of them', S);
      ok(S.w === 100 && S.h === 150 && S.mid != null && Math.abs(S.mid) <= 1 && S.inCard && S.above && S.hid === 'true' && S.text === '' && !S.css.length && Math.abs(S.boxH) < 1 && S.still && !!S.rec && S.rec.s === true, 'strip: ' + tag + ': 100 x 150 px, centred, in the card above the list, aria-hidden, no text (markup or CSS), still', S);
      painted(await paintOf(p, '#rRider svg', 'strip'), 'strip: ' + tag + ': the rider shows, whole');
      if (kind === 'starter') first = S.list; else ok(!!S.ids && J(S.list) !== J(first), 'strip: the Clothing-only results follow a closet change (the full closet lists other items, and the strip wears them)', { first, now: S.ids }); }
    await x.close(); }
  // the computer layout: the strip in the results column
  { const x = await openH({ wx: { lo: 53, hi: 57, rain: 80 }, width: 1440, height: 900, dpr: 2, settings: { rider: RIDER99 } }), p = x.p; await crunch(p); await toY(p, '#rWearCard'); await settle(p, 300); const S = await stripOf(p), dk = await p.evaluate(() => document.documentElement.classList.contains('dk'));
    ok(dk && S.svg && S.same && S.w === 100 && S.mid != null && Math.abs(S.mid) <= 1 && S.inCard && JSON.stringify(S.ids) === JSON.stringify(S.list), 'strip: the computer layout (1440 x 900): the strip in the Closet card of the results column, centred (' + S.mid + ' px off), the list\'s items', S);
    painted(await paintOf(p, '#rRider svg', 'strip'), 'strip: the computer layout (1440 x 900): the rider shows, whole'); /* review round 4: only the 390 px path was looked at as painted */
    await x.close(); }
  // the v6 gaps v7 fixed that no ride reaches, judged on lists that name them (the default rider and RIDER99): the rain jacket over a
  // windbreaker, a thermal or a winter jacket, and over the vest with a thermal jersey (point 2, 2+3); a windbreaker over a thermal jersey
  // (point 3); the skullcap with glasses none (point 6), which also leaves the eyes alone (v6's band changed 445 px in x 73.5-126.5, y 97-115).
  // And the by-design rule's edge no ride reaches: wool socks with bare shoes (no cover, no toe covers), alone and under tights, must show,
  // and over bare shins with shoe covers or boots (review round 5)
  { const x = await openH({ noErrs: true }), p = x.p, D = await p.evaluate(() => FW.RIDER_DEFAULT), own = Object.assign({}, OWN, OWN_HEAVY);
    for (const [who, base] of [['the default rider', D], ['RIDER99', RIDER99]]) {
      for (const ids of DIRECT) { /* every jersey colour (review round 4) and every skin (v8 check round 1) */
        const R = [[base, ''], ...KITS.filter(k => k[0] !== base.kit).map(([kit, kn]) => [Object.assign({}, base, { kit }), ' in a ' + kn + ' jersey']), ...SKINS.filter(sk => sk !== base.skin).map(sk => [Object.assign({}, base, { skin: sk }), ' in ' + sk + ' skin'])], P = await pxMany(p, R.map(x => x[0]), ids, own);
        R.forEach(([r, kn], i) => judge('the list ' + ids.join(' ') + ', ' + who + kn, { ids, r }, P[i])); }
      const r = Object.assign({}, base, { glasses: 'none' }), px = await pxOf(p, r, ['skullcap'], own, [73.5, 97, 126.5, 115]);
      judge('the list skullcap, glasses none, ' + who, { ids: ['skullcap'], r }, px);
      ok(px.skullcap.box === 0, 'strip: the skullcap with glasses none leaves the eyes alone (' + who + ': ' + px.skullcap.box + ' device px changed in x 73.5-126.5, y 97-115)', px.skullcap); }
    await x.close(); }
  // every fade, sleeves, shorts and pattern on every jersey (review round 7: only each rider's own fade and sleeves were judged, Deep blue and
  // Berry, the two fades on which the dark jackets show, so a strip that left the winter jacket off a Navy jersey with a Navy fade passed): on
  // each list a ride gives that carries an outer layer, and each direct list that does, both riders in each jersey with each other value of
  // one of those fields; every item judged as on the rides (by design only: nothing held outside ACCEPTED_V8), one check per list and rider
  { const own = Object.assign({}, OWN, OWN_HEAVY), lists = [...WIDE].concat(DIRECT.filter(L => L.some(id => OUTER.includes(id))).map(L => [L.join(' '), 'the list ' + L.join(' ')]));
    for (const [ls, where] of lists) for (const who of ['the default rider', 'RIDER99']) { const x = await openH({ noErrs: true }), p = x.p, base = who === 'RIDER99' ? RIDER99 : await p.evaluate(() => FW.RIDER_DEFAULT), ids = ls.split(' '), R = []; /* a page each */
      for (const [kit, kn] of KITS) for (const f of VARY) for (const [v, vn] of VOPT[f]) if (v !== base[f]) R.push([Object.assign({}, base, { kit, [f]: v }), kn + ' jersey, ' + f + ' ' + vn]);
      const P = [], agg = { n: 0, bad: [] }; for (let c = 0; c < R.length; c += 40) P.push(...await pxMany(p, R.slice(c, c + 40).map(r => r[0]), ids, own)); /* 40 riders a call (one call for all grew the renderer past 16 GB) */
      R.forEach(([r, what], i) => judge(where + ', ' + who + ' in a ' + what, { ids, r }, P[i], agg));
      ok(!agg.bad.length, 'strip: ' + where + ', ' + who + ': every item shows on every jersey with every other ' + VARY.map(f => ({ kit2: 'fade', sleeve: 'sleeves', shorts: 'shorts', pattern: 'pattern' })[f]).join(', ') + ' (' + R.length + ' riders, ' + agg.n + ' judgements; by design as on the rides, nothing held outside ACCEPTED_V8)', agg.bad.slice(0, 6)); await x.close(); } }
  // the cases v7 held by a rider's fields (AWAIT), over their whole v7 width (v8 check round 1): every rider of the width on every list a ride
  // gave where the entry holds, the entry's items judged (pixels changed and own colour), one check per list and rider; every rider of the width
  // must be judged on a ride's list
  { const own = Object.assign({}, OWN, OWN_HEAVY), O = Object.fromEntries(VARY.map(f => [f, VOPT[f].map(v => v[0])]));
    for (const f of FIXED_BY_V8) { if (!f.width) continue; const Wd = f.width(O), miss = [];
      for (const who of ['the default rider', 'RIDER99']) { const x = await openH({ noErrs: true }), p = x.p, base = who === 'RIDER99' ? RIDER99 : await p.evaluate(() => FW.RIDER_DEFAULT), R = Wd.map(v => Object.assign({}, base, v)), seen = new Set();
        for (const [ls, where] of RIDELISTS) { const ids = ls.split(' '); if (!f.ids.some(id => ids.includes(id)) || !R.every(r => f.when(ids, r))) continue;
          const P = [], agg = { n: 0, bad: [] }; for (let c = 0; c < R.length; c += 40) P.push(...await pxMany(p, R.slice(c, c + 40), ids, own, null, f.ids));
          R.forEach((r, i) => { judge(where + ', ' + who + ' with ' + J(Wd[i]), { ids, r }, P[i], agg, f.ids); seen.add(i); });
          ok(agg.n > 0 && !agg.bad.length, 'strip: ' + where + ', ' + who + ': ' + f.ids.join(', ') + ' shows on every rider of its v7 width (FROM-APP-CHAT-' + f.point + ': ' + R.length + ' riders, ' + agg.n + ' judgements)', agg.bad.slice(0, 6)); }
        if (seen.size < R.length) miss.push(who + ': ' + (R.length - seen.size) + ' of ' + R.length + ' riders on no ride\'s list'); await x.close(); }
      ok(!miss.length, 'strip: FROM-APP-CHAT-' + f.point + ' ' + f.ids.join(', ') + ': every rider of its v7 width (' + Wd.length + ' on each of the default rider and RIDER99) is judged on a ride\'s list', miss); } }
  // other screens (v8 check round 2: the acceptance check painted v8 on Safari and an iPhone): SHOW is 30 CSS px changed and 10 in the item's own
  // colour (120 / 40 device px at 2x), so at 3x it is 270 / 90. Every item that showed here within half again of SHOW (Chromium at 2x, every
  // judgement: rides, skins, jerseys, direct lists, the sweeps) is measured again in Chromium at 3x (most Android phones) and in WebKit at 2x
  // (Safari on a Mac or iPad) and 3x (an iPhone), the same rider and list; one check per screen, list and item, its riders and the least; and
  // the band is wide enough: no item reads a third less on another screen than here (by area), or one outside the band could fall under SHOW
  { const own = Object.assign({}, OWN, OWN_HEAVY), G = [...NEAR.values()], wkb = await webkit.launch(), byList = new Map(); let gap = null;
    for (const g of G) for (const [id, v] of g.items) { const k = g.ids.join(' ') + '|' + id; if (!byList.has(k)) byList.set(k, { ids: g.ids, id, tag: g.tag, R: [], V: [] }); byList.get(k).R.push(g.r); byList.get(k).V.push(v); }
    console.log('  note: other screens: ' + G.length + ' riders and lists, ' + byList.size + ' lists and items within half again of SHOW on Chromium at 2x');
    ok(byList.size > 0, 'strip: other screens: the items close to the line on Chromium at 2x are found (' + byList.size + ' lists and items)', null);
    for (const [eng, sc] of [['Chromium', 3], ['WebKit', 2], ['WebKit', 3]]) { const A = (sc / 2) ** 2, sh = { d48: Math.round(SHOW.d48 * A), own: Math.round(SHOW.own * A) };
      const x = await openH({ noErrs: true, browser: eng === 'WebKit' ? wkb : browser }), p = x.p;
      for (const [, e] of byList) { const P = []; for (let c = 0; c < e.R.length; c += 40) P.push(...await pxMany(p, e.R.slice(c, c + 40), e.ids, own, null, [e.id], sc));
        const bad = [], lo = P.reduce((m, q, i) => !m || q[e.id].d48 < m.v.d48 ? { v: q[e.id], r: e.R[i] } : m, null), scr = eng + ' ' + sc + 'x'; let na = 0;
        P.forEach((q, i) => { const v = q[e.id], h = e.V[i], under = !(v.d48 >= sh.d48 && (v.own == null || v.own >= sh.own)), acc = accOf(e.id, e.ids, e.R[i], scr);
          /* ACCEPTED_V8: inside an entry's width on this screen, under SHOW at or over its floor here; at SHOW, "now shows" */
          if (acc) accRec(acc, scr, e.id, e.ids, e.R[i], v, under, e.R[i].skin + ' skin, ' + e.R[i].kit + ' jersey, the list ' + e.ids.join(' '));
          formerRec(e.id, e.ids, e.R[i], v, scr, e.R[i].skin + ' skin, ' + e.R[i].kit + ' jersey, the list ' + e.ids.join(' '));
          if (under && acc) na++;
          if (under && (!acc || !floorOk(acc, scr, e.id, v))) bad.push(e.R[i].skin + ' skin, ' + e.R[i].kit + ' jersey: ' + v.d48 + (v.own != null ? ' / ' + v.own : '') + (acc ? ' (under ACCEPTED_V8 ' + acc.n + '\'s floor here for ' + e.id + ', ' + floorOf(acc, scr, e.id).join(' / ') + ')' : ''));
          /* the widest gap: this screen's reading by area against Chromium at 2x's, pixels changed and own colour (an item that showed there: the band's
             own check; a reading accepted there is held by its floor) */
          if (!h.acc) for (const [a, b] of [[v.d48, h.d48], [v.own, h.own]]) if (a != null && b) { const f = a / A / b; if (!gap || f < gap.f) gap = { f, eng, sc, list: e.ids.join(' '), id: e.id, skin: e.R[i].skin, here: b, there: a }; } });
        ok(!bad.length, 'strip: ' + eng + ' at ' + sc + 'x (limit ' + sh.d48 + ' / ' + sh.own + ' device px): the list ' + e.ids.join(' ') + ': ' + e.id + ' shows on every rider it was close to the line for, or reads within ACCEPTED_V8\'s width here ' + (DUMP ? 'as measured (Q99_ACCEPT_DUMP: no width or floor applied)' : 'at or over its floor') + ' (' + e.R.length + ' riders, ' + na + ' accepted; the least ' + lo.v.d48 + (lo.v.own != null ? ' / ' + lo.v.own : '') + ', ' + lo.r.skin + ' skin; first ' + e.tag + ')', bad.slice(0, 6)); }
      await x.close(); }
    await wkb.close();
    ok(!!gap && gap.f > 1 / NEAR_BAND, 'strip: other screens: the band is wide enough: the widest gap reads ' + (gap ? Math.round(gap.f * 100) + '% of Chromium at 2x by area (' + gap.eng + ' at ' + gap.sc + 'x, ' + gap.id + ' on ' + gap.skin + ' skin: ' + gap.here + ' -> ' + gap.there + ', the list ' + gap.list + ')' : 'not measured') + ', over the ' + Math.round(100 / NEAR_BAND) + '% the band allows', gap); }
  // the cases v7 held, judged in full on v8: each printed with its least (pixels changed; and in its own colour) beside v7's, and each part's;
  // every item of each entry, and each of its parts, judged on a ride's list (v8 check round 1: any one item did; point 1's legs and
  // tights-light were never on one, and its leg wear without wool socks never judged)
  const lst = q => 'judged ' + q.n + ' times, ' + (q.shows ? 'shows every time' : 'DOES NOT SHOW') + ', the least ' + q.v.d48 + ' px changed (' + q.tag + ')' + (q.o ? ', the least in its own colour ' + q.o.v.own + ' (' + q.o.v.d48 + ' changed; ' + q.o.tag + ')' : '');
  for (const [, w] of FIXED8_SEEN) { console.log('  note: held on v7, judged on v8 (FROM-APP-CHAT-' + w.f.point + ') ' + w.id + ': ' + w.f.what + ': v7 ' + w.f.v7 + '; v8 ' + lst(w));
    for (const [pn, q] of Object.entries(w.parts)) console.log('  note:   ' + w.id + ' ' + pn + ': v8 ' + lst(q)); }
  const unmet = (M, F) => F.flatMap((f, n) => f.ids.flatMap(id => { const w = M.get(n + ':' + id), at = (f.point ? f.point + ' ' : '') + id;
    return !w || !w.ride ? [at + ': ' + f.what] : (f.parts || []).filter(([pn]) => !(w.parts[pn] || {}).ride).map(([pn]) => at + ' ' + pn + ': ' + f.what); }));
  const v8unmet = unmet(FIXED8_SEEN, FIXED_BY_V8);
  ok(!v8unmet.length, 'strip: each case v7 held (' + FIXED_BY_V8.length + ' entries) is judged in full on a ride\'s list, every item of each and each part (nothing held outside ACCEPTED_V8, Bundle v8 accepted, Mark\'s decision)', v8unmet);
  for (const [, w] of FOUND_SEEN) { console.log('  note: found unjudged, judged now: ' + w.id + ': ' + w.f.what + ': ' + lst(w));
    for (const [pn, q] of Object.entries(w.parts)) console.log('  note:   ' + w.id + ' ' + pn + ': ' + lst(q)); }
  const fdUnmet = unmet(FOUND_SEEN, FOUND);
  ok(!fdUnmet.length, 'strip: each case found unjudged (' + FOUND.length + ' entries: boots with no wool socks, the leg wear above them, wool socks under knee warmers) is judged on a ride\'s list, every item of each and each part (v8 check round 2)', fdUnmet);
  for (const [, w] of FIXED_SEEN) console.log('  note: v6 gap v7 fixed, FROM-APP-CHAT-5 ' + (w.f.point === 'B' ? 'dark-skin note point B' : 'point ' + w.f.point) + ' ' + w.id + ': judged ' + w.n + ' times, ' + (w.shows ? 'shows' : 'does not show') + ', the least ' + JSON.stringify(w.v) + ' (' + w.tag + ')');
  for (const [, w] of EDGE_SEEN) console.log('  note: by-design rule\'s edge, ' + w.f.what + ': judged ' + w.n + ' times, ' + (w.shows ? 'shows' : 'does not show') + ', the least ' + JSON.stringify(w.v) + ' (' + w.tag + ')');
  const noEdge = EDGES.flatMap((f, n) => f.ids.filter(id => !(EDGE_SEEN.get(n + ':' + id) || {}).ride).map(id => id + ': ' + f.what));
  ok(!noEdge.length, 'strip: each by-design rule\'s edge the rides reach (' + EDGES.length + ') is judged on a ride\'s list', noEdge);
  // ACCEPTED_V8: each entry's readings on each screen of its width (a note: the least under SHOW, its floor, and "now shows" for a case that
  // reaches SHOW), and every cell of its width (screen, item, skin) judged, so the floor holds wherever it was measured
  for (const e of ACCEPTED_V8) { const miss = [];
    for (const scr of SCR) { const w = ACC_SEEN.get(e.n + '|' + scr), W = e.width[scr] || {};
      for (const id of e.ids) { const q = w && w.it.get(id); if (!q && !W[id]) continue;
        console.log('  note: accepted on v8, ACCEPTED_V8 ' + e.n + ' (FROM-APP-CHAT-7 ' + e.point + '), ' + e.what + ': ' + scr + ': ' + id + ' ' + (q ? 'reads under SHOW ' + q.n + ' times, the least ' + q.d.v.d48 + ' px changed (' + q.d.tag + '), the least in its own colour ' + (q.o ? q.o.v.own + ' (' + q.o.tag + ')' : 'none') : 'never under SHOW') + '; v8\'s least ' + ((e.least[scr] || {})[id] || ['-', '-']).join(' / ') + ', its floor ' + floorOf(e, scr, id).join(' / ') + (DUMP ? ' (Q99_ACCEPT_DUMP: not applied)' : '')); }
      if (w && w.now.length) console.log('  note: ACCEPTED_V8 ' + e.n + ' now shows on ' + scr + ' (' + w.now.length + ' readings at SHOW inside its width; a later item can drop it, on a run that is otherwise green: a build that loses what an item reads by can reach SHOW on one screen and fall under its floor on another): ' + w.now.slice(0, 3).join('; '));
      for (const [id, sks] of Object.entries(W)) for (const sk of sks) if (!(w && w.cells.has(id + '|' + sk))) miss.push(scr + ': ' + id + ' on ' + sk + ' skin'); }
    ok(!miss.length, 'strip: ACCEPTED_V8 ' + e.n + ' (FROM-APP-CHAT-7 ' + e.point + '): every screen, item and skin of its v8 width is judged (' + (Object.entries(e.width).map(([s, W]) => s + ' ' + Object.values(W).reduce((a, x) => a + x.length, 0)).join(', ') || 'none') + ')' + (DUMP ? ' (Q99_ACCEPT_DUMP: every reading counts, no width applied)' : ''), miss); }
  // FORMER_V8: each retired entry's case judged on every screen, item and skin (against SHOW, as any item); its least, and inside its v8 width beside v8's
  const lq = w => 'judged ' + w.n + ' times, the least ' + w.d.v.d48 + ' px changed (' + w.d.tag + '), the least in its own colour ' + (w.o ? w.o.v.own + ' (' + w.o.tag + ')' : 'none');
  for (const e of FORMER_V8) { const miss = [];
    for (const scr of SCR) for (const id of e.ids) { const w = FORMER_SEEN.get(e.n + '|' + scr + '|' + id), W = (e.width[scr] || {})[id];
      console.log('  note: retired with v9, ACCEPTED_V8 ' + e.n + ' (FROM-APP-CHAT-7 ' + e.point + '), ' + e.what + ': ' + scr + ': ' + id + ' ' + (w ? lq(w) + ' (' + w.cells.size + ' skins)' : 'not judged') + '; ' + (W ? 'in its v8 width (' + W.join(' ') + ') ' + (w && w.q.n ? lq(w.q) : 'not judged') + ', v8\'s least ' + ((e.least[scr] || {})[id] || ['-', '-']).join(' / ') : 'no v8 width here'));
      for (const sk of SK8) if (!(w && w.cells.has(sk))) miss.push(scr + ': ' + id + ' on ' + sk + ' skin'); }
    ok(!miss.length, 'strip: ACCEPTED_V8 ' + e.n + ' (FROM-APP-CHAT-7 ' + e.point + ', retired with v9): its case is still judged on every screen, item and skin, against SHOW (' + SCR.length + ' screens, ' + e.ids.join(' ') + ', ' + SK8.length + ' skins; v8 width ' + Object.entries(e.width).map(([s, W]) => s + ' ' + Object.values(W).reduce((a, x) => a + x.length, 0)).join(', ') + ')', miss); }
  const unseen = FIXED_BY_V7.flatMap((f, n) => f.ids.filter(id => !FIXED_SEEN.has(n + ':' + id)).map(id => f.point + ' ' + id));
  ok(!unseen.length, 'strip: each v6 gap v7 fixed (' + FIXED_BY_V7.length + ' entries, every item of each) is judged on v7, on a ride or a direct list', unseen);
  // the detector itself: an item that draws nothing in every version (bib shorts: the rider's default look) is judged as not showing; the
  // leg warmers and toe covers show, in their own colours
  { const x = await openH({ noErrs: true }), p = x.p, D = await p.evaluate(() => FW.RIDER_DEFAULT), a = await pxOf(p, D, ['legs', 'bibs'], OWN), b = await pxOf(p, D, ['shoes', 'knees', 'toes'], OWN);
    ok(a.bibs.d48 < SHOW.d48 && a.legs.d48 >= SHOW.d48 && a.legs.own >= SHOW.own && b.toes.d48 >= SHOW.d48 && b.toes.own >= SHOW.own, 'strip: self-test: the pixel check sees bib shorts (drawn as nothing in every version) as not showing and the leg warmers and toe covers as showing', { a, b });
    await x.close(); }
});

section('still', async () => {
  // the strip, the sheet's rider and the avatars: with Reduce Motion, the switch off and on (motion on): never .fwm-go, nothing running
  for (const [tag, o] of [['Reduce Motion', { motion: false }], ['Animate the world off', { motion: true, settings: { worldMotion: false } }], ['Animate the world on', { motion: true }]]) {
    const be = new Backend(), x = await synced(be, Object.assign({ label: 's', wx: { lo: 40, hi: 44 } }, o, { settings: Object.assign({ rider: RIDER99 }, o.settings || {}) })), p = x.p;
    await crunch(p); await toY(p, '#rWearCard');
    const spots = () => p.evaluate(() => ['#rRider', '#syncHdr .av-r', '#rdFig'].map(s => { const e = document.querySelector(s); return e && { s, fwm: e.classList.contains('fwm'), go: e.classList.contains('fwm-go'), run: e.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length, svg: !!e.querySelector('svg') }; }));
    const seen = []; for (let k = 0; k < 8; k++) { seen.push(await spots()); await sleep(250); }
    await sheet(p); for (let k = 0; k < 6; k++) { seen.push(await spots()); await sleep(250); } await done(p);
    await p.evaluate(() => { const D = Date.now; Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); Date.now = () => D() + 31 * 60e3; Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
    await toY(p, '#rWearCard'); for (let k = 0; k < 6; k++) { seen.push(await spots()); await sleep(250); }
    const flat = seen.flat().filter(Boolean), bad = flat.filter(s => s.go || s.run);
    ok(flat.filter(s => s.svg).length >= 20 && !bad.length, 'still: ' + tag + ': the strip, the avatar and the sheet\'s rider never move (no .fwm-go, nothing running: seen, scrolled to, in the sheet, after a new app open)', { bad: bad.slice(0, 3), n: flat.length });
    await x.close(); }
});

section('media', async () => {
  const x = await openH({ settings: { rider: RIDER99 } }), p = x.p;
  await crunch(p); await toY(p, '#rWearCard');
  const st = () => p.evaluate(() => { const e = document.getElementById('rRider'); return { disp: getComputedStyle(e).display, svg: !!e.querySelector('svg') && getComputedStyle(e.querySelector('svg')).display !== 'none' && e.getClientRects().length > 0, list: document.getElementById('rWear').getClientRects().length > 0 }; });
  const S0 = await st(); await p.emulateMedia({ media: 'print' }); const S1 = await st(); await p.emulateMedia({ media: 'screen', forcedColors: 'active' }); const S2 = await st(); await p.emulateMedia({ forcedColors: 'none' });
  ok(S0.svg && S1.disp === 'none' && S1.list && S2.disp === 'none' && S2.list, 'media: print and forced colours: no strip (no art; no empty band), the list stays', { S0, S1, S2 });
  await sheet(p); await allOpen(p);
  const fig = () => p.evaluate(() => { const s = document.querySelector('#rdFig svg'); return !!s && s.getClientRects().length > 0 && getComputedStyle(s).display !== 'none' && getComputedStyle(document.getElementById('rdFig')).display !== 'none'; });
  const G0 = await fig(); await p.emulateMedia({ forcedColors: 'active' }); await settle(p, 100); const G1 = await fig(); await p.emulateMedia({ forcedColors: 'none', media: 'print' }); await settle(p, 100); const G2 = await fig(); await p.emulateMedia({ media: 'screen' }); await settle(p, 100);
  ok(G0 && !G1 && !G2, 'media: the sheet\'s live rider shows on screen, not in forced colours or print (art: the round\'s rule)', { screen: G0, forced: G1, print: G2 });
  for (const cs of ['dark', 'light']) { await p.emulateMedia({ forcedColors: 'active', colorScheme: cs }); await settle(p, 100);
  const F = await p.evaluate(() => { const sys = c => { const e = document.createElement('i'); e.style.cssText = 'forced-color-adjust:none;color:' + c; document.body.append(e); const v = getComputedStyle(e).color; e.remove(); return v; }, CT = sys('CanvasText'), HL = sys('Highlight'), sw = [...document.querySelectorAll('#rdGroups .rd-c')].filter(b => b.getClientRects().length), t = [...document.querySelectorAll('#rdGroups .rd-t[aria-pressed="true"]')];
    return { n: sw.length, kept: sw.filter(b => { const h = b.style.getPropertyValue('--sw').trim(), m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h); return !!m && getComputedStyle(b).backgroundColor === 'rgb(' + [m[1], m[2], m[3]].map(x => parseInt(x, 16)).join(', ') + ')'; }).length,
      edge: sw.filter(b => parseFloat(getComputedStyle(b).borderTopWidth) >= 1 && getComputedStyle(b).borderTopStyle !== 'none' && getComputedStyle(b).borderTopColor === CT).length, CT, HL, ringHL: sw.filter(b => b.getAttribute('aria-pressed') === 'true').every(b => getComputedStyle(b).boxShadow.includes(HL)), ring: sw.filter(b => b.getAttribute('aria-pressed') === 'true').map(b => getComputedStyle(b).boxShadow), word: t.map(b => [getComputedStyle(b).backgroundColor, getComputedStyle(b).color]),
      wordOff: [...document.querySelectorAll('#rdGroups .rd-t[aria-pressed="false"]')].slice(0, 1).map(b => [getComputedStyle(b).backgroundColor]), same: [...document.querySelectorAll('#rdGroups .rd-c.rd-same, #rdGroups .rd-c[data-v=""]')].map(b => getComputedStyle(b).backgroundImage), names: ['kit', 'skin', 'shorts'].map(k => document.getElementById('rdN-' + k).textContent) }; });
  await p.emulateMedia({ forcedColors: 'none', colorScheme: 'light' });
  ok(F.n >= 40 && F.kept === F.n && F.edge === F.n && F.ringHL && F.CT !== F.HL && F.ring.length >= 8 && F.ring.every(s => s && s !== 'none') && F.word.length >= 4 && F.word.every(w => w[0] !== F.wordOff[0][0]) && F.names.every(Boolean) && F.same.length === 2 && F.same.every(b => /gradient/.test(b)), 'media: forced colours (' + cs + '): every swatch keeps its colour with a CanvasText edge (' + F.CT + '), "Same as jersey" its ring, the pressed ones ringed in Highlight (' + F.HL + '), the pressed word buttons marked, the chosen names shown', F); }
  await x.close();
});

section('fit', async () => {
  for (const [w, sc] of [[320, 1], [320, 2], [390, 2], [390, 1.5]]) {
    const x = await openH({ width: w, scale: sc, dpr: 2, settings: { rider: RIDER99 } }), p = x.p; await sheet(p); await allOpen(p); await settle(p, 200);
    const F = await p.evaluate(() => { const sh = document.querySelector('#setSheet .set-sheet'), b = sh.getBoundingClientRect(), bad = [...document.querySelectorAll('#prowB-rider *')].filter(e => e.getClientRects().length).map(e => [e, e.getBoundingClientRect()]).filter(([e, r]) => r.right > b.right + 0.5 || r.left < b.left - 0.5).map(([e]) => e.className || e.tagName);
      const small = [...document.querySelectorAll('#prowB-rider button')].filter(e => e.getClientRects().length).map(e => e.getBoundingClientRect()).filter(r => r.width < 44 || r.height < 44).length;
      const sum = ['look', 'gear', 'kit'].map(g => { const s = document.getElementById('rdS-' + g), c = getComputedStyle(s); return c.textOverflow === 'ellipsis' || s.scrollWidth > s.clientWidth + 1 || s.scrollHeight > s.clientHeight + 1 ? 'cut' : 'whole'; });
      return { sx: document.documentElement.scrollWidth > innerWidth, shx: sh.scrollWidth > sh.clientWidth + 1, bad: bad.slice(0, 5), small, sum }; });
    ok(!F.sx && !F.shx && !F.bad.length && !F.small && F.sum.every(n => n === 'whole'), 'fit: ' + w + ' px, ' + (sc * 100) + '% text: the sheet (every group open, More colours) fits: no sideways scroll, nothing past the sheet, every button 44 px or more, no summary cut', F);
    painted(await paintOf(p, '#rdFig svg', 'fig'), 'fit: ' + w + ' px, ' + (sc * 100) + '% text: the sheet\'s live rider shows');
    if (w === 320 && sc === 2) await figView(p, '320 px, 200% text', { size: [120, 180] });
    await done(p); await p.click('nav.tabs button[data-view=plan]'); await settle(p, 200); await crunch(p); await toY(p, '#rWearCard');
    const S = await stripOf(p); ok(S.svg && S.inCard && S.w === 100 && S.mid != null && Math.abs(S.mid) <= 1 && !(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'fit: ' + w + ' px, ' + (sc * 100) + '% text: the strip inside its card, centred (' + S.mid + ' px off its middle), no sideways scroll', S);
    painted(await paintOf(p, '#rRider svg', 'strip'), 'fit: ' + w + ' px, ' + (sc * 100) + '% text: the strip\'s rider shows, whole');
    await x.close(); }
  // the computer layout: the sheet is the pane beside the settings list
  const x = await openH({ width: 1280, height: 800, dpr: 2, settings: { rider: RIDER99 } }), p = x.p; await sheet(p); await allOpen(p);
  const D = await p.evaluate(() => { const l = document.getElementById('setList').getBoundingClientRect(), s = document.querySelector('#setSheet .set-sheet').getBoundingClientRect(); return { dk: document.documentElement.classList.contains('dk'), side: s.left >= l.right - 1, list: !document.getElementById('setList').inert }; });
  ok(D.dk && D.side && D.list, 'fit: the computer layout: the sheet is the pane beside the settings list (the list stays usable)', D);
  painted(await paintOf(p, '#rdFig svg', 'fig'), 'fit: the computer layout: the sheet\'s live rider shows');
  await figView(p, 'the computer layout (1280 x 800)', { size: [120, 180] });
  await x.close();
  // short screens (review round 5: none was run, so the 80 x 120 rule could go and pass, and a phone held sideways left one field's label
  // and no row under the stuck rider): a short phone (375 x 667) and phones held sideways (667 x 375, 844 x 390 at 100% and 200% text):
  // the rider 80 x 120, wholly in view after each tap, room for a whole field beside or under it, the keyboard never under it, as painted
  // review round 6: windows too short for a stuck rider and too narrow for the side column (a computer browser zoomed in: 1280 x 1024 at 400% is
  // 320 x 256, 1280 x 800 at 300% is 427 x 267) and a short computer layout (1280 x 400): the rider scrolls with the choices (stuck false);
  // and just past each edge it is stuck again (390 x 400 at 200% text, 1280 x 440). 320 x 200 (400% of 1280 x 800) is left out: its bars
  // leave 66 px of view, under any field's 71 with nothing stuck
  for (const [w, h, sc, stuck] of [[375, 667, 1], [667, 375, 1], [844, 390, 1], [844, 390, 2], [320, 256, 1, false], [320, 256, 2, false], [427, 267, 1, false], [1280, 400, 1, false], [390, 400, 2], [1280, 440, 1]]) {
    const y = await openH({ width: w, height: h, scale: sc, dpr: 2, settings: { rider: RIDER99 } }), q = y.p; await sheet(q); await allOpen(q); await settle(q, 200);
    await figView(q, w + ' x ' + h + ', ' + (sc * 100) + '% text', { size: [80, 120], stuck: stuck !== false });
    const G = await q.evaluate(() => { const sh = document.querySelector('#setSheet .set-sheet'), b = sh.getBoundingClientRect(); return { shx: sh.scrollWidth > sh.clientWidth + 1, sx: document.documentElement.scrollWidth > innerWidth, past: [...document.querySelectorAll('#prowB-rider *')].filter(e => e.getClientRects().length && !(e.parentElement && e.parentElement.closest('svg'))).map(e => [e, e.getBoundingClientRect()]).filter(([e, r]) => r.right > b.right + 0.5 || r.left < b.left - 0.5).map(([e]) => e.id || String(e.getAttribute('class')) || e.tagName).slice(0, 5) }; }); /* inside the rider's svg, Chromium's boxes of a resized drawing's parts run past it (clipped: the painted check sees what shows) */
    ok(!G.shx && !G.sx && !G.past.length, 'fit: ' + w + ' x ' + h + ', ' + (sc * 100) + '% text: the sheet fits (no sideways scroll, nothing past the sheet)', G);
    painted(await paintOf(q, '#rdFig svg', 'fig'), 'fit: ' + w + ' x ' + h + ', ' + (sc * 100) + '% text: the sheet\'s live rider shows');
    await y.close(); }
});

section('main', async () => {
  if (!MAIN) { console.log('  note: no main page given: the main checks are skipped'); return; }
  /* item 100: main has item 99 since 8c66750, so a main without the row and strip is gone; as q97's and q98's main sections skip once main has
     their item. The check stands for a main from before item 99 (it bites: main's page with that marker hidden, 'function riderStrip (', fails it: Item 100, Bundle v9) */
  const MS = fs.readFileSync(MAIN, 'utf8'), mb = (/window\.FW = \{[^\n]*built: '([^']+)'/.exec(MS) || [])[1];
  if (/\nfunction riderStrip\(/.test(MS)) { console.log('  note: the main page already has item 99 (function riderStrip): the main check (it needs a main from before it) is skipped' + (BUILDS[mb] ? '' : '; its bundle (built ' + mb + ') is not one BUILDS names, so the cache section fails on it as the item page')); return; }
  const x = await open(MAIN, { athlete: 'A', browser, motion: true, now: NOW, route: weatherRouteFor({ lo: 40, hi: 44 }) }), p = x.p;
  const m = await p.evaluate(() => ({ row: !!document.getElementById('prowBtn-rider'), strip: !!document.getElementById('rRider') }));
  ok(!m.row && !m.strip, 'main: no Your rider row and no strip on main (the row and strip checks fail there)', m);
  await x.close();
});

for (const [n, f] of sections) {
  if (ONLY.length && !ONLY.includes(n)) continue;
  console.log('-- ' + n);
  try { await f(); } catch (e) { ok(false, n + ': threw', String(e && e.stack || e).split('\n').slice(0, 3).join(' | ')); }
}
const errs = ERRS.flat().filter(e => !/net::ERR|Failed to load resource/.test(e));
ok(!errs.length, 'no page errors or console errors', errs.slice(0, 8));
await browser.close();
for (const f of MADE) fs.rmSync(f, { force: true });
C.done('item 99: Your rider, and the rider on the Closet card');
