# Handoff: "Return to the Tidepool Mobile app" button after web signup

**Audience**: the agent/developer implementing the web (blip) half of this feature.
**Mobile half**: already implemented in `mobile-remix` (branch `improve-signup-flow`) — see *What the mobile app already does* below. The two halves are independently shippable; the button is useless-but-harmless until the mobile release with the scheme registration is in the field (the store-badge fallback covers those users).

## Goal

Mobile-app signup currently dead-ends in the browser: the app opens `https://{env}/signup` externally, the user verifies their email (which continues signup in whatever browser the email client opens), walks the signup steps (data donation → "connect a device account" / "share your data"), and is then stranded on the web with no path back to the app. Add a **"Open the Tidepool Mobile app"** button to the final signup page that returns the user to the app.

**Repo scoping note**: the onboarding pages (data donation, "connect a device account" / "share your data") are blip, and the button lives on a blip page — all changes in this doc are blip changes. But Tidepool auth is Keycloak-based, so the credential-creation form and quite possibly the verification email + its link target may be served by Keycloak, not blip. Nothing in this doc requires touching those — but if anything about the verification email needs changing, look in Keycloak config/themes first, not blip.

## Design decision (already settled — do not redesign)

**Custom URL scheme**, not iOS universal links / Android app links. Reasons, for context:

- Universal links don't fire when tapped from a page on the same domain they point to — and this button lives on a Tidepool page. They also don't fire from most email-client in-app browsers, which is exactly where post-email-verification traffic lands.
- App links need domain verification files (`apple-app-site-association` / `assetlinks.json`) served on **every** environment host (prod + QA/dev) plus per-domain app entitlements; the custom scheme works identically on all environments with zero server config.
- The link carries nothing sensitive (it only foregrounds the app), so the classic custom-scheme weakness (any app can claim a scheme) has no payload to leak.

## The link

```
org.tidepool.mobile://signup-complete
```

- **Do not add query parameters** — the app ignores them (and its OAuth intent handling is scheme-guarded), but nothing reads them, so they'd be dead weight.
- **Never put this link in an email.** Email clients strip or refuse custom-scheme links. It belongs on the final signup web page only.

## What the mobile app already does

- **iOS** registers the `org.tidepool.mobile` scheme (`CFBundleURLTypes` in `Info.plist`). Tapping the link launches/foregrounds the app. There is deliberately no URL routing — a signed-out app lands on its Sign In screen, which is the desired destination (the user's web session does not transfer; they authenticate in-app via OAuth).
- **Android** registers an intent filter for `org.tidepool.mobile://signup-complete` on `MainActivity` (`io.tidepool.urchin`). Same behavior: foreground only, no routing. `MainActivity.onNewIntent` only treats `org.tidepool.mobile.auth://` URIs as OAuth callbacks, so this link can't be misparsed.
- The existing `org.tidepool.mobile.auth://redirect` scheme is the OAuth callback — **do not use it for this button.**

## What to build on blip

On the final signup page (the "connect a device account" / "share your data" step), add a **user-agent-gated** section:

1. **Gate by mobile UA.** Render the section only for iOS/Android user agents. Desktop users (common after the email-verification hop — many people open the verification link on a laptop) must not see a button that can't work; show them nothing, or just the store badges.

2. **The button, per platform:**
   - **Android UAs** — use Chrome's `intent://` syntax so "app not installed" falls through to the Play Store instead of failing silently:
     ```
     intent://signup-complete#Intent;scheme=org.tidepool.mobile;package=io.tidepool.urchin;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dio.tidepool.urchin;end
     ```
   - **iOS UAs** — a plain link to `org.tidepool.mobile://signup-complete`. iOS has no fallback mechanism: if the app isn't installed, Safari shows an "address is invalid" alert, which is why the store badges below must be visually adjacent. Do **not** use the old JS trick of racing the scheme against a `setTimeout` App Store redirect — it's unreliable on modern iOS and the error alert fires anyway.

3. **Store badges** (both platforms, below the button) as the not-installed fallback:
   - Play Store: `https://play.google.com/store/apps/details?id=io.tidepool.urchin`
   - App Store: link to the **Tidepool Mobile** listing (iOS bundle `org.tidepool.blipnotes`). ⚠️ **Verify the numeric App Store ID yourself** — it was not resolvable from the mobile repo or its network sandbox. Look it up with:
     ```
     curl "https://itunes.apple.com/lookup?bundleId=org.tidepool.blipnotes"
     ```
     and use `trackId`/`trackViewUrl` from the response. Do not guess the ID. (It's also visible in App Store Connect → the app → App Information → "Apple ID". Note it is NOT any ID found in the mobile repo's CI config: `ASC_KEY_ID` there is an App Store Connect API-key credential and `app_identifier` is the bundle ID — the Smart App Banner needs the numeric store ID, e.g. the `id123456789` in the listing URL.)

4. **Smart App Banner** (iOS, optional but recommended): add to the page `<head>`:
   ```html
   <meta name="apple-itunes-app" content="app-id=<VERIFIED_APP_STORE_ID>">
   ```
   Safari renders a native banner — "Open" when the app is installed, "View" (→ App Store) when not. Safari-only (it won't render in Chrome-on-iOS or email in-app browsers), so it complements the button rather than replacing it.

## Environments

Nothing environment-specific: the same scheme link works against prod and every QA/dev host. No server config, no per-domain files.

## Known imperfections (accepted in the design)

- Some email-client in-app webviews block unknown schemes silently; the store badges are the recovery path.
- iOS user without the app who taps the button gets the "address is invalid" alert before noticing the badges. Rare: the page is the tail of signup, and mobile signups almost always originate from the app.
- A user who started in the app but opens the verification email on another phone (without the app) hits the fallback path — expected.

## Test checklist

- [x] iOS Safari, app installed → tap opens Tidepool Mobile (foregrounds; Sign In if signed out) — verified 2026-09-03 on a dev build; Safari shows its `Open in "Tidepool Mobile"?` confirmation first, which is standard for custom schemes
- [x] iOS Safari, app NOT installed → **confirmed 2026-09-03**: "Safari cannot open the page because the address is invalid." alert, as predicted. (Store badge adjacency/function and Smart App Banner not yet verified; the banner was never implemented — see step 3 options in `blip-universal-link-next-steps.md`)
- [x] Android Chrome, app installed → `intent://` link opens the app — verified on real hardware
- [x] Android Chrome, app NOT installed → `intent://` link lands on the Play Store listing — verified on real hardware
- [ ] Gmail in-app browser (both platforms) after tapping a verification email → button visible and functional (or store badge path works)
- [ ] Desktop browser → no dead button rendered
- [ ] Works identically on a QA environment host (no prod-only assumptions)
