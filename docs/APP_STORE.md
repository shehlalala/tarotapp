# App Store: build setup and submission checklist

Everything needed to get the iOS app from this repo onto the App Store. Tick items as you go.
**You** marks steps that need your accounts or decisions; **Claude** marks steps I'm doing in the
repo in parallel.

Apple's requirements change, so double-check sizes and limits in App Store Connect when you get
there. The numbers below were current when this was written.

---

## 0. What is already set up in the repo

- `apps/mobile/eas.json`: EAS Build profiles
  - `simulator`: an iOS Simulator build, for trying the app on a Mac without a device.
  - `preview`: an internal-distribution build for registered test devices.
  - `production`: the App Store build. Build numbers are managed by EAS (`appVersionSource: remote`)
    and incremented on each build.
  - `submit.production`: uploads to App Store Connect / TestFlight.
- `apps/mobile/app.config.ts`:
  - App identity comes from `packages/content/brand.json`.
  - Version 1.0.0, iPhone only (`supportsTablet: false`), dark UI.
  - App icon and splash screen.
  - `ITSAppUsesNonExemptEncryption = false`, so no export-compliance prompt on each build.
  - Privacy manifest (`PrivacyInfo.xcprivacy`): no tracking, no collected data types, and the
    UserDefaults reason code `CA92.1` for on-device storage.
- `apps/mobile/assets/icon.png`: a 1024×1024 opaque icon of original art. Regenerate it with
  `pnpm --filter @tarot/mobile icons`.
- Scripts, run from the repo root:
  ```sh
  pnpm --filter @tarot/mobile build:ios             # production build on EAS
  pnpm --filter @tarot/mobile build:ios:simulator   # simulator build
  pnpm --filter @tarot/mobile submit:ios            # upload the latest build to App Store Connect
  ```
- Verified in this repo: `expo prebuild` generates the iOS project cleanly. The project has the
  privacy manifest, the encryption flag, iPhone-only device family and the 1024 px icon.
  Generated `ios/` and `android/` folders are git-ignored because EAS regenerates them on every
  build.

---

## 1. Accounts and identity (You)

- [ ] **Apple Developer Program** membership ($99/year) at developer.apple.com/programs.
  Enrolling as an individual is fastest. An organization needs a D-U-N-S number and can take
  longer. The seller name shown on the App Store is your legal name or your organization's name.
- [ ] **Expo account** (free) at expo.dev. EAS Build's free tier is enough to start.
- [ ] **Decide the final identity** and put it in `packages/content/brand.json`, the only place it
  needs to change:
  - [ ] `appName`: what appears under the icon and on the store (store name max 30 characters).
    Check the name is not already taken on the App Store.
  - [ ] `iosBundleId`: reverse-domain, for example `com.yourdomain.tarot`. It **cannot change
    after the first upload**.
  - [ ] `domain` / `siteUrl`: the website domain (needed for the privacy policy URL).
  - [ ] `developerName`, `contactEmail`.
  - [ ] Optional: `slug` (Expo project slug) and `urlScheme` (deep-link scheme).

## 2. Connect the repo to EAS (You, about 10 minutes)

From `apps/mobile`:

```sh
npx eas-cli@latest login
npx eas-cli@latest init        # creates the EAS project
```

- [ ] `eas init` prints a project ID (and may say it cannot edit a dynamic config). Copy that ID
  into `packages/content/brand.json` → `easProjectId`, and commit it.
- [ ] Check: `npx eas-cli@latest config --platform ios --profile production` shows your name and
  bundle ID.

## 3. First build and TestFlight (You)

- [ ] `pnpm --filter @tarot/mobile build:ios`
  - On the first run, sign in with your Apple ID when asked. Let EAS **create the bundle
    identifier, distribution certificate and provisioning profile** for you (answer yes).
  - The build runs in Expo's cloud and takes about 15–30 minutes. You get a link when it's done.
- [ ] **Create the app record** in App Store Connect → Apps → "+" → New App:
  - Platform iOS, name = `appName`, primary language English (U.S.), bundle ID = the one EAS
    registered, SKU = anything unique (for example `tarot-ios-001`), user access Full.
  - Note the **Apple ID** of the app (a number, under App Information). Add it to
    `apps/mobile/eas.json` → `submit.production.ios.ascAppId` so `submit` stops asking.
- [ ] `pnpm --filter @tarot/mobile submit:ios`. This uploads the build, and it appears in
  TestFlight after processing (about 10–30 minutes).
- [ ] **TestFlight internal testing:** add yourself as an internal tester and install via the
  TestFlight app.
- [ ] Smoke test on a real iPhone:
  - [ ] The app opens straight into the reading, the shuffle plays, and three picks enable Reveal.
  - [ ] Cards flip one at a time; reversed cards appear upside down with the right text.
  - [ ] The detail view, Share sheet, History (it survives an app restart) and About all work.
  - [ ] With Settings → Accessibility → Reduce Motion on, the shuffle and flight are skipped and
    flips cross-fade.
  - [ ] VoiceOver reads the cards and slots sensibly.
  - [ ] Nothing shows `[APP_NAME]`, `[DOMAIN]` or `[PLACEHOLDER]`.

## 4. Blockers before submitting for review

Apple rejects apps with placeholder content or a privacy policy link that doesn't work
(guidelines 2.1 and 5.1.1). These must be done first:

- [ ] **Privacy policy page** live at `https://<domain>/privacy`. **Claude** is building it as
  part of the website. Until then, any static host works with the policy text from the website
  phase.
- [ ] **Support URL** that works, for example `https://<domain>/support` or a contact page.
  **Claude** is building it.
- [ ] **Real app name and domain** in `brand.json` (step 1), so no `[APP_NAME]` or `[DOMAIN]`
  shows in the app.
- [ ] **Your review of the card meanings.** All 78 are `draft`; skim them and change anything you
  disagree with (`packages/content/data/locales/en/*.json`). You don't need to edit the `status`
  field. **Claude** can mark them `reviewed` once you approve.
- [ ] **Recommended: Minor Arcana art.** The 56 Minor Arcana currently use typographic faces.
  Fortune-telling is a category Apple names under guideline 4.3 ("spam") as saturated, so it only
  accepts apps that are clearly unique and high quality. Consistent artwork across all 78 cards
  makes that case much stronger. You can run `pnpm fetch-art` for the 1909 scans, or ask Claude
  to extend the original illustrations.

## 5. App Store Connect listing (You)

Draft copy below; edit freely. Replace `<App Name>` with your name.

- [ ] **Name** (max 30): `<App Name>`
- [ ] **Subtitle** (max 30): `Past, Present, Future Tarot` (27 characters)
- [ ] **Category:** Primary **Entertainment** (it matches the "for entertainment purposes" stance).
  Secondary **Lifestyle**.
- [ ] **Promotional text** (max 170, can be edited without review):
  > Draw three cards for your past, present and future. Free, private and beautifully simple: no
  > account, no ads, nothing leaves your phone.
- [ ] **Description** (max 4000):
  > <App Name> is a calm, beautifully designed tarot app for three-card Past, Present, Future readings.
  >
  > Open the app and your reading begins. Watch the deck shuffle, choose three cards from the
  > full 78-card deck and reveal them one by one. Each card shows a clear, plain-language meaning
  > written for its position, whether it lands upright or reversed. Tap any card to read more.
  >
  > • Full 78-card deck: the 22 Major Arcana and 56 Minor Arcana
  > • Meanings written for each position (Past, Present, Future) and each orientation
  > • Original artwork for the Major Arcana
  > • Reading history saved privately on your device
  > • Share your reading with friends
  > • No account, no sign-up, no ads, no tracking
  >
  > Your privacy: <App Name> collects no data. Your readings stay on your device, and you can delete
  > them at any time.
  >
  > Tarot is a tool for reflection. Readings are for entertainment purposes only and are not a
  > substitute for professional advice.
- [ ] **Keywords** (max 100 characters, comma-separated, don't repeat words from the name):
  `tarot,tarot reading,tarot cards,major arcana,card meanings,daily reading,spread,reversed,no account`
  (99 characters)
- [ ] **Support URL:** `https://<domain>/support`
- [ ] **Marketing URL** (optional): `https://<domain>`
- [ ] **Privacy Policy URL:** `https://<domain>/privacy`
- [ ] **Copyright:** `2026 <your name or company>`
- [ ] **Screenshots:** iPhone 6.9-inch display, 1320 × 2868 portrait (1290 × 2796 is also
  accepted), 3 to 10 images. App Store Connect scales them down for smaller iPhones. No iPad
  screenshots are needed because the app is iPhone-only.
  - **Claude** will generate a set from the app (the deck after the shuffle, cards flying into
    slots, the reveal, a card's detail view, and History) and drop them in
    `apps/mobile/store/screenshots/`. Replace any you like with real-device captures from
    TestFlight.
- [ ] **App icon:** taken from the build automatically.

## 6. App Privacy, age rating, pricing (You)

- [ ] **App Privacy** → Data Collection → "No, we do not collect data from this app". The label
  then reads **Data Not Collected**. This is accurate: there's no backend, analytics or tracking,
  and history lives in on-device storage.
- [ ] **Age rating questionnaire:** answer **None/No** to every content question (no violence,
  gambling, mature themes, user-generated content, web access or messaging). The expected result
  is the lowest age rating.
- [ ] **Pricing:** Free. Availability: all countries, or choose a list.
- [ ] **Content rights:** "Does your app contain, show, or access third-party content?" Answer
  **No**. The Major Arcana artwork and the icon are original to this project, and the card text is
  original. If you later add the 1909 Rider-Waite-Smith scans, they are public domain; keep
  `packages/content/images/SOURCES.md` as the record.
- [ ] **Export compliance:** already answered in the build (no non-exempt encryption).

## 7. Submit for review (You)

- [ ] In the version page, select the TestFlight build.
- [ ] **App Review Information:**
  - Sign-in required: **No**.
  - Contact name, phone and email.
  - Notes (paste):
    > No account or sign-in is needed: the app opens directly into a three-card reading. To test,
    > tap any three face-down cards, then tap "Reveal Cards". Tap a revealed card for its full
    > meaning. History and About are in the top bar. The app collects no data; readings are
    > stored only on the device. Tarot readings are presented for entertainment and reflection,
    > as stated in the About screen. All artwork and text are original to this app.
- [ ] **Version release:** "Manually release this version", so you control launch day.
- [ ] **Submit for Review.** Typical review time is 24–48 hours.

### If it's rejected

- **4.3 (spam / saturated category):** reply in Resolution Center with what is unique. That
  includes the original artwork, position- and orientation-specific meanings for all 78 cards, no
  account and no data collection, and the animation and accessibility work (Reduce Motion,
  VoiceOver). Attaching a short screen recording helps.
- **2.1 (incomplete):** usually placeholder text or a dead link. Check section 4.
- **5.1.1 (privacy):** usually the privacy policy URL. Make sure it loads and matches the
  "Data Not Collected" label.

## 8. After approval

- [ ] Put the App Store ID in `brand.json` → `appStoreId` and `appStoreUrl`. The website then
  shows the Smart App Banner and App Store buttons (website phase).
- [ ] Universal links from the website (`<domain>/reading` opens the app). This needs the Apple
  Team ID for the site's `apple-app-site-association` file and `associatedDomains` in
  `app.config.ts`. **Claude** will wire it up once the domain and Team ID exist.
- [ ] For each later release: bump `version` in `apps/mobile/app.config.ts` (for example 1.0.1),
  then build and submit. Build numbers increment on their own.
