# Next steps: iOS universal link prototype

**Companion to** `blip-signup-return-handoff.md` (the original spec for the "return to the app"
button). That doc's design decision — custom URL scheme, universal links rejected — is the thing
being re-examined here. Read it first for background.

**Branch**: `mobile-signup-workflow`
**Repo**: blip. The iOS half lives in `mobile-remix` (branch `improve-signup-flow`).

> ## Status 2026-09-03: PARKED — shipping the custom scheme instead
>
> Decision: ship step 3, option 1 (custom scheme, unchanged from what's committed on
> `mobile-signup-workflow`). The iOS not-installed case keeps the "address is invalid" alert, with
> the App Store badge directly below the button as the recovery path. Rationale: step 1 confirmed
> same-host suppression, so universal links require a dedicated link host + a mobile entitlement
> release + cross-team host coordination — real infrastructure for a marginal UX gain on a rare
> path.
>
> The prototype is **complete through step 1** and preserved on the `universal-link-prototype`
> branch (this doc travels with it). Step 1's result (suppression confirmed, setup validated by
> the Notes control) means resuming is cheap: the only open question left is step 2
> (cross-subdomain), blocked on a second deploy host — see the step 2 section and the host-choice
> caveat (sibling `qa*` host preferred over `dev1.dev.tidepool.org`).

---

## Where things stand

### Shipped and working (committed in `1bc1d4157`)

The "Open the Tidepool Mobile app" button on the Welcome page.

| Piece | Location |
|---|---|
| Component | `app/components/mobileapplink/MobileAppLink.js` |
| Render gate | `app/pages/patientdata/patientdata.js:342` — `{isUserPatient && <MobileAppLink … />}` |
| UA detection | `app/core/utils.js` — `utils.getMobilePlatform()` returns `'ios' \| 'android' \| null` |
| Tests | `__tests__/unit/app/components/mobileapplink/MobileAppLink.test.js` |

The page is `/patients/:userid/data`, rendered by `renderNoData` (`patientdata.js:261`) when the
patient has no device data. It requires all three of: viewing your *own* record (`isUserPatient`),
no device data, and an iOS/Android user agent.

**Verified on real hardware:**
- ✅ Android Chrome, app installed → `intent://` opens the app
- ✅ Android Chrome, app uninstalled → falls through to the Play Store
- ✅ iOS Safari, app installed (dev build from Xcode), custom scheme → `Open in "Tidepool Mobile"?`
  dialog → app opens to Sign In (2026-09-03, full signup flow walked end-to-end)
- ✅ iOS Safari, app **removed**, custom scheme → *"Safari cannot open the page because the address
  is invalid."* (2026-09-03) — the degradation this experiment exists to fix, now reproduced
  first-hand rather than assumed

**Not yet tested:** the universal link **cross-subdomain** (step 2 — the case the final design
depends on), the App Store badge rendering/working on a real device, Gmail in-app browser. Step 1
(same-host) is done: suppression confirmed, see the step 1 result below.

### Uncommitted — the universal link prototype

All changes are in the working tree, unstaged.

```
 M __tests__/unit/app/components/mobileapplink/MobileAppLink.test.js
 M app/components/mobileapplink/MobileAppLink.js
 M app/routes.js
 M server.js
 M webpack.config.js
?? __tests__/unit/app/pages/mobileapp/
?? app/pages/mobileapp/
?? static/.well-known/
```

| File | Purpose |
|---|---|
| `static/.well-known/apple-app-site-association` | The association file. `.well-known/` is **required** for developer mode |
| `server.js:128-139` | Production route forcing `application/json` (the file is extensionless, so `express.static` can't infer the type). Serves from memory — read once at startup — after a CodeQL alert about unratelimited per-request filesystem access |
| `webpack.config.js` → `devServer.setupMiddlewares` | Same for dev; also stops `historyApiFallback` swallowing the path |
| `app/pages/mobileapp/MobileApp.js` | Landing page the universal link resolves to when the app isn't installed |
| `app/routes.js:468` | Unauthenticated route `/mobile-app` |
| `MobileAppLink.js:25`, `:31`, `:43` | `IOS_UNIVERSAL_LINK_HOST`, `IOS_LINK_STRATEGY`, `getIosAppUrl()` |

Status: 20 tests passing, lint clean. AASA verified served locally over a real dev server —
`HTTP 200`, `Content-Type: application/json; charset=utf-8`, `num_redirects=0`.

**Default behaviour is unchanged.** iOS still gets the custom scheme. The universal link only
activates via an explicit query param, so none of this regresses the working Android path.

---

## Why we're doing this

iOS currently degrades badly. With the app not installed, `org.tidepool.mobile://signup-complete`
makes Safari show an **"address is invalid" alert** — whereas Android falls through cleanly to the
Play Store via `S.browser_fallback_url`. The goal is iOS parity: open the app, or land somewhere
useful, but never error.

A universal link would fix this — it resolves to a real page when the app is missing. The blocker
in the original doc is that **iOS suppresses universal links pointing at the current page's own
host**, opening them in Safari instead. Apple documents this in the App Search Programming Guide.
Sibling subdomains reportedly count as different hosts, so `app.tidepool.org` → `link.tidepool.org`
should work.

**That suppression claim is the premise of the entire design, and it has not been verified for our
setup. Verifying it is step 1.**

---

## Step 1 — Does same-host suppression actually happen?

If it doesn't, no link subdomain is needed, the design collapses to a single host, and most of the
complexity disappears. Worth knowing before building anything else.

### The trap

A bare negative test is worthless. "The app didn't open" is equally consistent with suppression, a
malformed AASA, a wrong Team ID, a bundle-ID mismatch, or the device toggle being off. **You need a
positive control.** Two work on a single host:

1. **`swcutil verify`** — proves the file is fetched and the path pattern matches:
   ```bash
   swcutil verify -d qa3.development.tidepool.org \
     -j <path-to-aasa> \
     -u https://qa3.development.tidepool.org/mobile-app
   ```

2. **Long-press the link** (the decisive one). If the context menu offers **"Open in Tidepool
   Mobile"**, iOS has recognised it as a valid universal link — so a plain tap staying in Safari is
   deliberate suppression, not broken config.

### Setup

> **Update 2026-09-03**: the branch is actually deployed to **`qa3`**, not qa1 — substitute
> `qa3.development.tidepool.org` for `qa1` throughout this doc. The AASA on qa3 is verified in
> full: `status=200 redirects=0 type=application/json`, and the body carries the real appID
> `75U4X84TEG.org.tidepool.blipnotes` claiming `/mobile-app`. The server half needs nothing more.

1. ✅ Placeholders filled: the AASA carries `75U4X84TEG.org.tidepool.blipnotes`.

2. ✅ Deployed to `qa3` and verified:
   ```bash
   curl -i https://qa3.development.tidepool.org/.well-known/apple-app-site-association
   ```
   `200`, `application/json`, **no redirects** — Apple rejects redirects.

3. In `mobile-remix`, add **both** hosts to the associated-domains entitlement now, even though
   step 1 only uses one. Costs nothing and avoids a rebuild for step 2 (full instructions for the
   mobile side: `mobile-remix-applinks-handoff.md`). ⚠️ Earlier drafts said qa1/qa2 — a build
   carrying only those will silently never match on qa3:
   ```
   applinks:qa3.development.tidepool.org?mode=developer
   applinks:qa2.development.tidepool.org?mode=developer
   ```
   (`qa2` stays as the second host because blip's `IOS_UNIVERSAL_LINK_HOST` defaults to it; if the
   step 2 deploy lands on a different host instead, update both the constant and the entitlement.)

4. Build to a physical device from Xcode. `?mode=developer` requires a **development-signed** build
   — TestFlight and Ad Hoc cannot use it. Enable **Settings → Developer → Associated Domains
   Development** on the device.

   `?mode=developer` isn't strictly required for a public QA host, but Apple's CDN caches AASA
   files; developer mode fetches direct from the host so edits take effect immediately.

### Run it

Load the Welcome page on `qa3` as a patient with no data, then:

```
/patients/<userid>/data?iosLink=universal&linkHost=same
```

`linkHost=same` points the link at `window.location.origin`.

**The override is sticky (added 2026-09-03, needs the redeploy).** Typing query params on a phone
is painful, so an `?iosLink` override persists on the device (localStorage) and keeps applying on
every later visit until replaced or cleared with `?iosLink=reset`. While one is active, a caption
under the button says so (e.g. *"Link override active: universal (same host)"*), so the device's
mode is never a mystery. Practical upshot: prepare the full URLs once on the Mac and get them to
the phone without typing — AirDrop/iMessage the link, or make a QR code
(`qrencode -o mode.png 'https://qa3.development.tidepool.org/patients/<userid>/data?iosLink=universal&linkHost=same'`)
and scan it with the camera. After that one tap, plain navigation stays in that mode. One constraint: the
override only persists when the button actually renders — so the override URL must be the Welcome
page itself (mobile UA, own record, no data), which the protocol's URL already is.

### Findings from the first device run (2026-09-03)

- **Bug found and fixed: the landing page bounced authenticated users.** Tapping the button
  navigated to `/mobile-app`, which rendered — then the page redirected back to the Welcome page.
  Cause: `keycloak.js` `onAuthSuccess` dispatches `async.login(api)` on every authenticated page
  load, and that action always ends in a `push()` to the user's home route. Fixed by excluding
  `/mobile-app` from the login trigger, the same carve-out the oauth landing pages already use
  (`app/keycloak.js`, tested in `test/unit/keycloak.test.js`). **Needs a redeploy to qa3** before
  the landing page can be evaluated again. This mattered beyond the test: real post-signup users
  are authenticated too.
- **Long-pressing the button produces no callout menu at all** — not even the standard link
  preview. Likely the markup: the anchor wraps a `<button>` (theme-ui `Button` inside `Link`), and
  the button appears to swallow the gesture. So the button itself can't serve as the long-press
  positive control. Use Apple Notes instead: paste
  `https://qa3.development.tidepool.org/mobile-app` into a note, long-press it there — "Open in
  Tidepool Mobile" in that menu is the same signal.
- **The tap itself navigated to `/mobile-app` (no error alert).** Interpretation blocked on two
  facts about the run: whether the app was installed at the time, and whether the build's
  entitlements actually contain `applinks:qa3…?mode=developer` (`codesign -d --entitlements -`).
  If the app was absent, this is simply the desired not-installed behaviour and says nothing about
  suppression. If it was present with valid entitlements, this is same-host suppression confirmed.

### Interpreting the result

| Observation | Conclusion | Next |
|---|---|---|
| Long-press shows "Open in…", tap stays in Safari | **Suppression confirmed** | Go to step 2 |
| Tap opens the app | **Premise is wrong** — no link subdomain needed | Skip step 2. Simplify: point the universal link at the page's own host and drop the two-host design |
| Long-press shows nothing | Setup problem, not suppression | Fix AASA / Team ID / bundle ID / device toggle. Conclude nothing yet |

The middle row is the good outcome — it would mean universal links are implementable with no new
infrastructure.

### ✅ Step 1 result (2026-09-03): same-host suppression CONFIRMED

- **Positive control passed**: the URL `https://qa3.development.tidepool.org/mobile-app` pasted
  into Apple Notes **opens the app on tap**. That proves the entire chain — AASA on qa3, the
  build's entitlement, signing team, device toggle — is valid. (The on-page long-press control
  turned out unusable: the anchor wraps a `<button>` that swallows the gesture; Notes is the
  reliable control.)
- **Same-host tap in Safari stays in the browser**: on the qa3 Welcome page with
  `?iosLink=universal&linkHost=same`, tapping the button navigated to `/mobile-app` instead of
  opening the installed app.
- Conclusion: iOS suppresses universal links pointing at the current page's own host, exactly as
  the original handoff claimed. **The single-host simplification is dead; a separate link host is
  required. Proceed to step 2** (sibling subdomain, qa3 page → qa2 link).
- Also verified along the way, app **not** installed: the same tap lands on `/mobile-app` with
  **no error alert** — the iOS degradation this design set out to fix, working.

---

## Step 2 — Cross-subdomain (only if step 1 confirms suppression)

Deploy blip to a **second** QA host (`qa2`). Since blip serves the AASA from `static/`, that host
gets the file automatically.

Load the Welcome page on **`qa3`**, tap with:

```
/patients/<userid>/data?iosLink=universal
```

This defaults to `IOS_UNIVERSAL_LINK_HOST` (`MobileAppLink.js:25`, currently `qa2.development.tidepool.org`).

Expected: the app opens. This tests **sibling subdomains**, which is the genuinely uncertain case
and the one the eventual `app.tidepool.org` → `link.tidepool.org` design depends on. A cross-domain
test would prove less.

Then delete the app and repeat — should land on `/mobile-app` showing the App Store badge, **with no
error alert**. That is the entire point of the exercise.

Control: `?iosLink=scheme` reproduces current shipped behaviour for comparison. Both strategies work
on one build, no rebuild needed to switch.

---

## Step 3 — If it works, decide what to ship

Options, roughly increasing cost:

- **Keep the custom scheme.** Android already works; iOS keeps the error alert. ← **CHOSEN
  2026-09-03**, see status note at the top.
- **Point the iOS button at the App Store listing** (`apps.apple.com/...`, Apple's own URL —
  no AASA/entitlement/link host needed). The store page is the switch: "Open" when installed,
  "Get" when not. Installed users pay a detour through the store but the tap count equals the
  scheme's confirmation dialog (two), the not-installed case never errors, and it works in email
  in-app browsers. What Apple does **not** offer is a hosted URL that opens a third-party app
  directly and falls back to the store — that always requires domain association (universal
  links) or a third-party service like Branch (Firebase Dynamic Links was discontinued 2025).
  Considered and **rejected** 2026-09-03: the button's primary audience is users who already have
  the app (they started signup in it), and "Open the Tidepool Mobile app" routing them through a
  store page first is wrong — the store detour optimises the rare case at the expense of the
  common one. Kept here only so it isn't re-proposed.
- **Universal link on iOS, `intent://` on Android.** Needs a real link host and an entitlement change
  (therefore a mobile release). The two halves stop being independently shippable.
- **Add the Smart App Banner.** Skipped earlier, and cheap-ish. Safari-only, Apple-sanctioned, gives
  "Open" when installed and "View" when not. Blocked on blip having no react-helmet — head content
  comes from a single `index.ejs` (`webpack.config.js:177`), so a `<meta name="apple-itunes-app">`
  there applies app-wide, not just to the Welcome page.

Whatever ships, the **Android side should not change** — `intent://` with `browser_fallback_url` is
verified working and is the right mechanism there.

---

## Open questions — blockers

### 1. Apple Team ID and bundle ID

✅ **Resolved 2026-09-01**: `static/.well-known/apple-app-site-association` now carries the real
appID `75U4X84TEG.org.tidepool.blipnotes`.

- **Bundle ID** — confirmed: `mobile-remix` uses `org.tidepool.blipnotes`, same as the 2020 listing.
- **Team ID** — confirmed: `75U4X84TEG`.

(A wrong appID fails silently, so if universal links mysteriously don't match, re-check this value
against the build's actual signing team before concluding anything.)

### 2. App Store listing

✅ **Confirmed 2026-09-01**: `mobile-remix` ships under the same listing the badge points at
(`https://apps.apple.com/us/app/tidepool-mobile/id1026395200`, bundle `org.tidepool.blipnotes`).
The badge URL is correct as-is.

### 3. Badge artwork

`appstore-badge.svg` and `google-play-badge.png` sat unreferenced in the repo since May 2024 (moved
from `app/components/browserwarning/images/` — nothing imported them). The Play Store badge has now
been seen rendering on a real device. The App Store one has never been displayed; check it against
Apple's current brand guidelines during the iOS pass.

### 4. How to deploy to QA

✅ **Resolved 2026-09-01**: Gerrit deploys the branch to a QA host after pushing. For the record,
the mechanism explored earlier: there is **no `.github/` directory in blip and never has been**, so no workflow here
could respond to a `/deploy` PR comment. CI is Travis (`.travis.yml`) building a Docker image and
publishing a versioned artifact. The live convention in `git log` is branch-named prerelease version
bumps in `package.json` (`v1.101.0-feat-blip-2fa.1`, `v1.100.0-web-4275-landing-c2c.1`). The README's
table of contents links to a "Build and deployment" section that doesn't exist in the file.

Ask whoever last cut a release — Clint made the `v1.101.0-feat-blip-2fa.1` bump.

---

## Local dev gotchas (hard-won)

- **`API_HOST` must be set**, or it silently falls back to the page origin (`config.app.js:51`), so
  `/info` hits the dev server, `historyApiFallback` returns `index.html` with a `200`, Keycloak never
  initialises, and you get `Cannot read properties of null (reading 'createLoginUrl')`.
  ```bash
  API_HOST=http://localhost:31500 UPLOAD_API=http://localhost:31500 yarn start
  ```
  It's a build-time `DefinePlugin` constant — **restart the dev server** after changing it.

- **Local cluster port is 31500** (`config/local.example.js:31`), not 8009. `config/local.sh` says
  8009 but is dead — untouched since 2018 and referenced by nothing. Worth deleting upstream.

- **Testing from a phone needs every port reversed**, not just 3000, because `API_HOST` is an
  absolute URL baked into the bundle:
  ```bash
  adb reverse tcp:3000  tcp:3000     # blip
  adb reverse tcp:31500 tcp:31500    # gateway/API
  ```
  Plus Keycloak's port — find it from `curl -s http://localhost:31500/info | grep -A4 '"auth"'`.
  `adb reverse` also keeps the origin at `localhost:3000`, which is what QA CORS allowlists expect.

- **Chrome's "Desktop site" toggle** strips `Android` from the UA, so `getMobilePlatform()` returns
  null and the button vanishes. Most likely cause of a "missing" button.

- **`package=io.tidepool.urchin`** is pinned in the intent URL. A debug build with an
  `applicationIdSuffix` won't match and silently falls through to the Play Store. Check with
  `adb shell pm list packages | grep -i tidepool`.

- **Isolate the app half first**, before involving the browser:
  ```bash
  adb shell am start -a android.intent.action.VIEW -d "org.tidepool.mobile://signup-complete"
  ```

- **`node_modules` may be in an npm-resolved state.** Jest wasn't installed in the devcontainer, and
  corepack can't reach `repo.yarnpkg.com` from behind the egress firewall, so test deps were
  installed with `npm install --no-save`. Run a real `yarn install` outside the container before
  trusting the checkout. (`package.json` and `yarn.lock` are unmodified — npm rewrote `yarn.lock`
  once and it was reverted.)

- **Cluster startup failures seen so far**, both fixed:
  - auth service: *"big data donation project data recipient user id is required"* → set
    `BigDataDonationProjectSharingDisabled: "true"` in the `auth` configmap (the chart default;
    `Disabled` short-circuits before the user-id check).
  - clinic service: `IndexKeySpecsConflict` on `PatientDeletion` → upstream bug.
    `patients/repository/repository.go:48` passes `[]string{"clinicId,userId"}` (one string with a
    comma) instead of `[]string{"clinicId", "userId"}`, producing a malformed single-field index.
    Drop all indexes on `*_deletions` collections and restart. The one-line upstream fix is worth
    reporting.

---

## Test commands

```bash
# targeted (AGENTS.md: never run the full suite)
TZ=UTC NODE_ENV=test yarn test:jest --testPathPattern="mobileapplink|mobileapp"
TZ=UTC NODE_ENV=test yarn test:jest --testPathPattern="patientdata"
NODE_ENV=development yarn lint
```

## Conventions

- `AGENTS.md` restricts agents to **read-only git commands**. Leave everything unstaged; the user
  commits.
- New tests go in `__tests__/` as Jest. Existing Karma files in `test/` get extended in place.
- Never read `config/local.js` or any `.env` file.
