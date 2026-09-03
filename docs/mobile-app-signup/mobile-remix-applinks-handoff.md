# Handoff: add Associated Domains (universal links) to the mobile-remix iOS build

> **Status 2026-09-03: PARKED.** The web side is shipping the custom scheme instead; no
> mobile-remix action is needed unless the universal-link experiment resumes (it's preserved,
> complete through step 1, on blip's `universal-link-prototype` branch). The entitlements described
> below were added and validated on a dev build during step 1 — keep or drop them freely; they are
> developer-mode-only and inert in TestFlight/App Store builds either way.

**Audience**: the agent/developer working in the `mobile-remix` repo (branch `improve-signup-flow`).
**Written**: 2026-09-01. Companion docs live in the blip repo: `blip-signup-return-handoff.md`
(original feature spec) and `blip-universal-link-next-steps.md` (the experiment this build supports).

## Context in three sentences

Blip's post-signup Welcome page has an "Open the Tidepool Mobile app" button. On iOS it currently
uses the custom scheme `org.tidepool.mobile://signup-complete`, which shows Safari's "address is
invalid" alert when the app isn't installed. We are testing whether an iOS **universal link** can
replace it (open the app when installed, land on a real web page when not) — the web half is done
and will be deployed to two QA hosts; the missing piece is the app claiming those hosts, and as of
2026-09-01 the project has **no `applinks` entries anywhere in the code**.

## The change

Add the **Associated Domains** capability to the iOS app target with exactly these two entries:

```
applinks:qa3.development.tidepool.org?mode=developer
applinks:qa2.development.tidepool.org?mode=developer
```

> **Update 2026-09-03**: blip is deployed to **qa3** (AASA verified live there), so `qa3` replaced
> `qa1` in the list above. If an earlier build used qa1/qa2, it will silently never match on qa3 —
> rebuild with the corrected list.

Both hosts now, even though the first test only uses one — it costs nothing and avoids a rebuild
when the cross-subdomain test (the one that actually matters) runs.

Where to make it:

- **Plain Xcode project**: target → *Signing & Capabilities* → *+ Capability* → *Associated
  Domains* → add both entries. This writes a `com.apple.developer.associated-domains` array into
  the target's `.entitlements` file; commit that file.
- **If entitlements are generated** (Expo config plugin, React Native config, fastlane templates,
  XcodeGen/Tuist project generation…): make the change at the generating source instead, then
  verify the generated `.entitlements` contains both strings verbatim — including the
  `?mode=developer` suffix, which some tooling mangles.

Do **not** touch:

- The existing `CFBundleURLTypes` registration of `org.tidepool.mobile` — it is the shipped
  behaviour and the experiment's control (`?iosLink=scheme` on the web side).
- `org.tidepool.mobile.auth://` OAuth handling.
- Anything on Android — the Android path is verified working and out of scope.

## No URL-handling code is needed

The desired behaviour when the link fires is simply that the app opens/foregrounds (signed-out
users land on Sign In — that's the destination we want). Universal links arrive as an
`NSUserActivity` of type `NSUserActivityTypeBrowsingWeb` (via
`application(_:continue:restorationHandler:)` / the scene equivalent), **not** via `openURL`, and
an unhandled activity still opens the app. So: add no routing.

One check worth doing: if the app already implements a user-activity/scene handler (e.g. for
OAuth or Handoff), make sure an incoming `https://qa*.development.tidepool.org/mobile-app` URL
falls through harmlessly rather than hitting an assertion or being misparsed as an OAuth callback.

## Signing constraints — read before building

- `?mode=developer` domains are honoured **only in development-signed builds**. TestFlight, Ad Hoc,
  and App Store builds ignore them completely. Build to the device from Xcode with *Run*; do not
  bother producing a TestFlight build for this experiment — it cannot work.
- The build must sign under team **`75U4X84TEG`** with bundle ID **`org.tidepool.blipnotes`**. The
  server-side association file declares the appID `75U4X84TEG.org.tidepool.blipnotes`; a build
  signed by any other team (e.g. a personal team) will fail **silently** — no error, links just
  never match. Note that Associated Domains is a capability a free personal team can't sign anyway.
- Physical iPhone, and turn on **Settings → Developer → Associated Domains Development** on it.
  (Developer mode makes the device fetch the association file directly from the QA host instead of
  through Apple's caching CDN, so server-side edits take effect immediately.)

## Verifying your half works (before any end-to-end test)

1. Confirm the built product's entitlements:
   ```bash
   codesign -d --entitlements - <path-to-built .app>
   ```
   Expect `com.apple.developer.associated-domains` with both `applinks:` strings.

2. From the Mac, prove the server file matches the app (this needs the blip branch deployed to the
   QA host first — coordinate with Gerrit):
   ```bash
   swcutil verify -d qa3.development.tidepool.org \
     -u https://qa3.development.tidepool.org/mobile-app
   ```
   The association file is served at
   `https://qa3.development.tidepool.org/.well-known/apple-app-site-association`
   (must be HTTP 200, `application/json`, no redirects). The only path it claims is `/mobile-app`.

3. On the device, install the build, then in Safari **long-press** a link to
   `https://qa3.development.tidepool.org/mobile-app`. If the context menu offers **"Open in
   Tidepool Mobile"**, your half is done — everything beyond that (whether a plain tap opens the
   app from various pages) is the blip-side experiment, scripted in
   `blip-universal-link-next-steps.md`.

If the long-press menu shows nothing: recheck, in order — signing team is `75U4X84TEG`, the device
toggle is on, the entitlement survived into the built product (step 1), and the AASA is reachable
(step 2). Don't conclude anything from a plain tap until the long-press control passes.

## What comes later (not now)

If the experiment succeeds, production would need a real entry **without** `?mode=developer`
(normal mode goes through Apple's CDN and works in TestFlight/App Store builds) pointing at
whatever host the final design lands on — possibly `link.tidepool.org`, possibly the app's own
host, depending on what the experiment shows about same-host suppression. **Don't add any
production `applinks` entry yet**; the host is undecided.
