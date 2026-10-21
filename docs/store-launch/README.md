# KindBridge: App Store and Google Play launch pack

Prepared 22 October 2026 from this repository and official platform guidance. **Status: planning pack and policy drafts; not submission-ready or published.** No mobile binaries, developer accounts, production configuration, or console declarations were verified. The reviewed repository identifies itself as a community pilot web app.

## Start here

1. [Launch requirements and current gaps](01-launch-checklist.md)
2. [Privacy policy draft](02-privacy-policy.md)
3. [Terms of use draft](03-terms-of-use.md)
4. [Community and child-safety standards draft](04-community-safety.md)
5. [Account deletion and support page drafts](05-deletion-and-support.md)
6. [Apple App Privacy and Google Data safety worksheet](06-data-disclosures.md)
7. [Store listing copy, artwork brief and review instructions](07-store-listings.md)
8. [Retention, moderation and release operations](08-operations.md)
9. [Dedicated Google Play submission checklist](09-google-play-submission.md)

## Decisions needed from the owner

Replace all `{{...}}` fields before publication. Keep the policy text consistent with the final product and vendor settings. Arrange legal review of the final operator identity, retention exceptions, local obligations and terms before relying on these drafts.

| Field | What to supply |
|---|---|
| `{{LEGAL_NAME}}` | Full legal name of the individual or registered entity operating KindBridge; align with store developer identity |
| `{{POSTAL_ADDRESS}}` | Public business/contact address suitable for legal notices |
| `{{SUPPORT_EMAIL}}` | Working, monitored support mailbox |
| `{{PRIVACY_EMAIL}}` | Working privacy and deletion mailbox; may be the support mailbox |
| `{{GRIEVANCE_NAME}}`, `{{GRIEVANCE_CONTACT}}` | Responsible person and contact details; confirm India-specific requirements |
| `{{CHILD_SAFETY_EMAIL}}` | Monitored child-safety contact; may be the same staffed mailbox |
| `{{SUPPORT_HOURS}}` | Staffed days, hours, timezone and holidays |
| `{{EFFECTIVE_DATE}}` | Actual policy publication date |
| `{{COUNTRIES}}` | Launch countries; India is a working assumption, not a confirmed restriction |
| `{{GOVERNING_LAW}}`, `{{COURTS}}` | Law and courts selected with legal advice, preserving mandatory consumer rights |
| Retention fields | Complete the schedule in 08-operations; implement it before making deletion promises |
| Infrastructure fields | Actual database region, processing countries, vendor logging and backup periods |

## Public URLs to prepare

These are **proposed routes**, not verified live pages. Use the actual production domain if different from the domain referenced in the repository.

| Proposed URL | Content |
|---|---|
| `https://kindbridge.co.in/privacy-policy` | Final privacy policy |
| `https://kindbridge.co.in/terms` | Final terms of use |
| `https://kindbridge.co.in/community-guidelines` | Community and child-safety standards |
| `https://kindbridge.co.in/delete-account` | Working external deletion request pathway and explanation |
| `https://kindbridge.co.in/support` | Public help, developer contact and support hours |

Publish accessible HTML pages that work without login. Link Privacy Policy and Terms during signup and in Settings. Preserve `/privacy` as the existing member sharing screen. Google requires a public privacy-policy URL and an external account-deletion pathway in addition to the in-app route. [Google user-data policy](https://support.google.com/googleplay/android-developer/answer/18258653), [account deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111).

## Scope of these drafts

Based on the present free, adults-only pilot: email/password accounts, community membership, offers/requests, help coins, exchange messages, reviews, selective sharing, reports and moderation. No advertising, coin purchases, cash redemption, subscriptions, GPS collection or camera uploads were found in the reviewed application code. A native build or added SDK can change this assessment. Proposed policies are release targets wherever the implementation gap notes say additional work is needed.
