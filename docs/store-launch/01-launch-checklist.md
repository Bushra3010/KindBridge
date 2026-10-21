# Launch requirements and current gaps

Checked 22 October 2026. Unchecked items require completion or evidence; this is not a certification of compliance.

## 1. Developer accounts and ownership

| Requirement | Apple | Google Play |
|---|---|---|
| Account | Apple Developer Program and App Store Connect | Play Console developer account |
| Standard registration cost | US$99 per membership year | US$25 one-time registration |
| Ownership | Choose individual or organization matching the real operator | Choose personal or organization matching the real operator |
| Verification | Identity, contact details, Apple Account with two-factor authentication; organizations need legal-entity verification and normally D-U-N-S | Identity/contact/payment-profile verification; organizations normally need D-U-N-S and business records; complete device verification if requested |
| Access | Owner retains account; invite developers with appropriate roles | Owner retains account; invite developers with appropriate roles |

Fees are published USD base amounts; local pricing, taxes and eligibility for waivers vary. [Apple membership](https://developer.apple.com/programs/), [Apple enrollment](https://developer.apple.com/programs/enroll/), [Google registration](https://support.google.com/googleplay/android-developer/answer/6112435), [Google account types](https://support.google.com/googleplay/android-developer/answer/13634885).

- [ ] Legal operator name, public contact information, country availability and ownership confirmed.
- [ ] Accounts verified, current agreements accepted, recovery methods stored securely.
- [ ] Domain, logo, screenshots, illustrations, fonts and app name rights confirmed.
- [ ] Paid-app agreements, bank and tax details completed if charging money; they are conditional for this free pilot.
- [ ] If distributing in the EU, complete Apple's applicable trader-status disclosures. [Apple app information](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information).

## 2. Mobile app builds

The checked tree contains a Next.js web app and PWA manifest, but no native iOS/Android project. A mobile website alone is not a store submission artifact.

- [ ] Choose and build the mobile application, preserving the working backend and user journeys. If using a web container, design a complete mobile experience and assess its actual functionality against store rules.
- [ ] Select permanent iOS bundle ID and Android application ID under an identifier you control. Example only: `in.co.kindbridge.app`; confirm ownership and uniqueness before use.
- [ ] Set app version and monotonically increasing build/version code; configure production API/domain and release environment.
- [ ] iOS: signing team, distribution signing, provisioning/capabilities, App Store Connect record, release archive/upload, application icon and launch appearance.
- [ ] Build iOS using the iOS 26 SDK or later; Apple's published minimum took effect 28 April 2026. This build-SDK requirement does not force the minimum supported device OS to iOS 26. [Apple SDK requirement](https://developer.apple.com/news/?id=ueeok6yw).
- [ ] Android: signed Android App Bundle (`.aab`), Play App Signing, securely backed-up upload key and recovery procedure; verify 64-bit/native-library compatibility where applicable.
- [ ] For a standard phone app, target Android 16 / API 36 or later under the published requirement effective 31 August 2026; recheck Play Console at upload time. [Google target API requirements](https://support.google.com/googleplay/android-developer/answer/11926878).
- [ ] Audit native dependencies for current memory page-size compatibility and other Play build checks.
- [ ] No development URLs, debug menus, test secrets or privileged credentials in shipped assets.
- [ ] Inventory permissions, privacy manifests, required-reason APIs and SDK declarations from the final binary. Ask only for permissions the release uses.
- [ ] Verify links, keyboard avoidance, safe areas, Android back behavior, session persistence, external links, loading/error/offline states and accessibility on real devices.

Apple's minimum-functionality rule creates a review risk for a thin website wrapper. Its UGC rules also require content filtering, reporting, blocking and published contact details. These are review criteria, not a promise that a particular framework will pass. [Apple review guidelines, sections 4.2 and 1.2](https://developer.apple.com/app-store/review/guidelines/).

## 3. Confirmed repository gaps

| Priority | Finding | Required action |
|---|---|---|
| Blocker | `/privacy` calls `requireMember()` and manages private contact sharing | Publish a separate public privacy policy |
| Blocker | Account closure substitutes the email/name but retains password hash, verification fields, listings, messages, reviews and other linked records | Implement deletion of unnecessary personal data and user content; document narrowly justified exceptions and timed cleanup |
| Blocker | Open exchanges prevent `requestDeletion` from proceeding | Allow a deletion request to be recorded; explain settlement handling and completion timing; avoid indefinite obstruction |
| Blocker | No external account-deletion page found | Build a public request pathway with identity verification; don't require reinstalling the app |
| Blocker | No native mobile project found in this checkout | Produce, sign and test both mobile builds |
| High | Signup accepts community rules only | Link final Terms and Privacy Policy; record terms version and notice version; separate any optional consent |
| High | Public developer contact/support hours absent from reviewed rules | Publish a staffed contact and actual support hours |
| High | Reporting/blocking/moderator services exist; a content-filtering mechanism was not identified | Implement and test proportionate content controls and moderator removal across supported UGC types |
| High | No implemented retention schedule or timed deletion found | Approve and implement the retention and backup plan |
| High | Login/general abuse rate limiting and password reset were not found in the reviewed auth paths | Add abuse controls and a secure account-recovery flow; preserve OTP protections |
| High | README flags private-contact encryption, backup/restore and accessibility work | Verify current production protections and close unresolved items; README may lag deployment |
| High | README describes lazy reminder sweeps | Establish reliable production jobs for promised reminders and deletion/retention tasks |
| High | Production email is supported in code but delivery wasn't tested | Verify sender/domain configuration, OTP delivery, resend limits and failure recovery |

Evidence: `src/app/(app)/privacy/page.tsx`, `src/app/(app)/settings/page.tsx`, `src/app/signup/page.tsx`, `src/app/actions.ts:requestDeletion`, `src/lib/services/admin.ts:closeAccountRecords`, `src/lib/services/safety.ts`, `src/lib/auth.ts`, `README.md`, `prisma/schema.prisma`.

Apple expects account deletion, including associated UGC subject to legal retention; Google requires in-app and external deletion request options and disclosure of justified retention. Changing the button label alone does not solve the data lifecycle. [Apple deletion guidance](https://developer.apple.com/support/offering-account-deletion-in-your-app/), [Google deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111).

## 4. Policies and store declarations

- [ ] Final public Privacy Policy, Terms, community standards, support and deletion pages online and linked in-app.
- [ ] Operator contacts, retention periods, vendor regions and effective date filled in across all documents.
- [ ] Apple App Privacy and Google Data safety forms reconciled to release behavior, third-party SDKs and infrastructure; use worksheet 06.
- [ ] Complete age/content questionnaires honestly, including chat, user content and moderation. Adults-only eligibility does not automatically determine the store's content rating.
- [ ] Google: app access instructions, ads declaration, target audience, IARC content rating, Data safety, account-deletion link and applicable financial/health/government/other declarations completed accurately.
- [ ] Check Google Social-app child-safety applicability. If applicable, publish child-safety standards and designate a contact even with an adults-only audience. [Google policy declarations](https://developers.google.com/android-publisher/app-store-review/policy-declarations).
- [ ] Apple: app category, age rating, content rights, privacy details, export-compliance/encryption questionnaire, pricing/availability and review contact completed.
- [ ] Do not describe help coins as money, investment returns or cash earnings. If the economic model changes, reassess legal and store declarations.
- [ ] No separate cash refund/subscription policy is needed for the present no-payment model; publish coin-cancellation rules. Before paid boosts/subscriptions, assess applicable Apple/Google billing rules and add purchase, cancellation, refund and renewal disclosures.
- [ ] Email/password login alone does not introduce a third-party-social-login obligation. Reassess Apple's login-service rule if adding social login.

## 5. Listing assets and review access

- [ ] Store names, descriptions, categories, keywords and localized text finalized from file 07.
- [ ] Real iOS and Android screenshots, icons and Google feature graphic exported in current accepted sizes; no personal data or unreleased features.
- [ ] Reviewer accounts are verified, approved community members, have safe sample content and enough coins for testing.
- [ ] Provide two accounts and steps to exercise both sides of an exchange. Avoid real-member data and admin credentials.
- [ ] Explain community approval/availability restrictions, contact-sharing controls, reporting, blocking, deletion and the coin model.
- [ ] Backend stays available throughout review; reviewer access does not depend on waiting for a manual approval or inaccessible OTP inbox.

## 6. Testing and release

- [ ] Run TestFlight and Android internal/closed testing; inspect crash reports and Play pre-launch results.
- [ ] For personal Google accounts created after 13 November 2023: at least 12 testers opted in continuously for 14 days, followed by a production-access application. Meeting the duration is not automatic approval. [Google testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465).
- [ ] Execute the release test script in file 08, including data deletion and abuse cases.
- [ ] Submit complete metadata and builds to both stores; budget time for questions and fixes without promising a review date.
- [ ] Choose manual release initially so approval can be checked before public availability; select only supported countries.
- [ ] After release, test installation from both stores, signup/email, backend, policy links, reports and deletion; monitor support, crashes and failed exchanges.

## 7. India launch considerations

The repository uses an Indian domain and Asia/Kolkata timezone; India is an assumption pending owner confirmation. Have counsel assess applicable IT/intermediary, grievance, consumer, privacy, security-incident and recordkeeping duties for the actual business. The DPDP Act/Rules have staged commencement; do not claim that every provision is already in force or label the product compliant without checking the applicable dates and controls. The official publication hub contains the Rules, commencement timeline and corrigendum. [MeitY DPDP publications](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digit).

If adding other countries, assess their privacy/consumer requirements, international transfers and public trader information before enabling distribution there. A blanket global launch is not assumed in this pack.
