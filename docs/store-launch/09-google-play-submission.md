# KindBridge Google Play submission checklist

Prepared 22 October 2026. This is the Android-specific handoff; the shared policies and data worksheet in this folder also apply. **No Android build has been produced or submitted as part of this documentation work.**

## 1. Set up the developer account

- [ ] Register the correct personal or organization account in Play Console under the actual operator's ownership.
- [ ] Pay the standard US$25 one-time registration fee, subject to local payment/tax treatment.
- [ ] Complete identity, public contact, payment-profile and any requested device verification. Organizations should prepare their business records and D-U-N-S number where required.
- [ ] Enable account security, retain owner access and invite collaborators through roles.

Sources: [Google registration](https://support.google.com/googleplay/android-developer/answer/6112435), [account types](https://support.google.com/googleplay/android-developer/answer/13634885).

## 2. Produce the Android release

- [ ] Create the Android application project; this checkout currently contains the web app.
- [ ] Choose a permanent, unique application ID under your control and create the KindBridge app record in Play Console.
- [ ] Set the production backend, version name and increasing version code.
- [ ] Target Android 16 / API 36 or later for a standard phone submission under the requirement effective 31 August 2026; check the current Console requirement when uploading.
- [ ] Build a signed Android App Bundle (`.aab`), configure Play App Signing and protect the upload key.
- [ ] Validate native libraries, architecture and memory page-size compatibility through the current build and Console checks.
- [ ] Review every requested permission and SDK. Remove unnecessary permissions and verify release traffic before completing Data safety.
- [ ] Test startup, login, keyboard, back navigation, sharing, external links, session expiry and poor connectivity on real Android devices.

Source: [Google target API requirements](https://support.google.com/googleplay/android-developer/answer/11926878).

## 3. Publish the required web pages

Complete the placeholders in the drafts and implement their stated behavior before publishing:

| Public route to build | Draft |
|---|---|
| `/privacy-policy` | [Privacy Policy](02-privacy-policy.md) |
| `/terms` | [Terms of Use](03-terms-of-use.md) |
| `/community-guidelines` | [Community and child-safety standards](04-community-safety.md) |
| `/delete-account` | [Deletion page and workflow](05-deletion-and-support.md) |
| `/support` | [Support page](05-deletion-and-support.md) |

- [ ] Pages work without signing in and identify the operator and working contact channels.
- [ ] Privacy policy is public HTML, not merely a downloadable PDF or this repository's draft file.
- [ ] Account deletion can be initiated inside the app and through the external URL supplied to Play Console.
- [ ] Deletion actually removes unnecessary personal records and content; the existing account pseudonymization requires further work.
- [ ] Clearly explain justified retained data, its purpose and retention period.

Sources: [Google user-data policy](https://support.google.com/googleplay/android-developer/answer/18258653), [account-deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111).

## 4. Complete App content and access declarations

- [ ] Data safety: use [the data worksheet](06-data-disclosures.md), then reconcile all answers with the final Android build and providers.
- [ ] App access: supply working, preverified reviewer accounts with approved memberships, sample content, coins and clear steps. Include both sides of an exchange and a deletion test account.
- [ ] Ads: no advertising found in the reviewed web code; verify the actual release before answering.
- [ ] Target audience: adults 18+ for this pilot. Complete the content rating questionnaire separately and disclose messaging and user-generated content accurately.
- [ ] Category: assess Social against the actual app. Complete applicable child-safety declarations, publish standards and designate a reachable contact if classified as Social.
- [ ] Complete any other declaration requested by the Console truthfully, including applicable financial, health or government questions. Explain that help coins are non-purchasable, non-cash community units where relevant.
- [ ] Demonstrate working reporting, blocking, moderation and terms acceptance before user-generated content is submitted.

Sources: [Data safety](https://support.google.com/googleplay/android-developer/answer/10787469), [policy declarations](https://developers.google.com/android-publisher/app-store-review/policy-declarations), [UGC policy](https://support.google.com/googleplay/android-developer/answer/9876937).

## 5. Prepare the store listing

Use [the listing copy and reviewer handoff](07-store-listings.md).

| Field/asset | Prepared copy or requirement |
|---|---|
| Name | KindBridge |
| Short description | Share skills, help neighbours and exchange help coins in your community. |
| Full description | Shared full description in file 07; replace support details and verify all feature claims |
| Store icon | 512 × 512 PNG |
| Feature graphic | 1024 × 500, JPEG or PNG without alpha |
| Screenshots | At least two accepted screenshots; plan 6–8 images of the real Android release |
| Contacts and links | Verified operator details, support email and live privacy/deletion URLs |
| Availability | Only countries the operator can support; free for the described pilot |

Source: [Google preview assets](https://support.google.com/googleplay/android-developer/answer/9866151). Artwork remains to be created and exported; the drafts are not completed assets.

## 6. Test, apply and release

1. Upload the signed bundle to an internal test track and inspect Console warnings and pre-launch results.
2. Run the release acceptance script in [operations](08-operations.md), especially exchanges, coin consistency, privacy controls, abuse handling and deletion.
3. If using a personal developer account created after 13 November 2023, run a closed test with at least 12 testers opted in continuously for 14 days, then apply for production access. Keep evidence of actual testing and fixes; the time requirement does not guarantee approval.
4. Resolve release checks, submit the complete production release for review and keep the backend/reviewer accounts available.
5. After approval, release to the selected countries and verify installation from Google Play, signup, core exchanges, public links and support channels.

Source: [Google personal-account testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465).

## Outstanding before KindBridge can submit

Android project and signed bundle; final operator/contact details; implemented and published policies; complete account deletion; content moderation/filtering and staffed support; release security/backup checks; final native data audit; actual listing artwork; developer-account verification; device testing and any applicable closed-test period. See [the full gap assessment](01-launch-checklist.md) for repository evidence.
