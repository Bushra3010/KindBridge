# App Privacy and Data safety worksheet

**Working classification, not final console answers.** Based on server schema and application code reviewed on 22 October 2026. Complete again against both release binaries, network traffic, native dependencies, provider contracts and logging settings. Server-side collection counts; being private from other members does not mean data is not collected.

## Data inventory

| Data in KindBridge | Apple categories to evaluate | Google categories to evaluate | Required/optional and purpose |
|---|---|---|---|
| Account email | Contact Info → Email Address | Personal info → Email address | Required; account management, verification, security |
| Optional first name | Contact Info → Name | Personal info → Name | Optional; member-requested sharing |
| Optional phone | Contact Info → Phone Number | Personal info → Phone number | Optional; member-requested sharing |
| Account ID and username | Identifiers → User ID | Personal info → User IDs | Required; account, membership and exchanges |
| Password hash, verification/session records | Evaluate Other Data/security collection under platform definitions; avoid inventing a password category | Evaluate applicable personal/security data classification under form definitions | Required for authentication; never publish values |
| Avatar, bio, skills, availability, membership | User Content → Other User Content; User ID where appropriate | Personal info → Other info; Other user-generated content as applicable | Mix of required and optional; profile and matching |
| Private photo URL and any image actually processed | User Content → Photos or Videos if applicable; URL/content category depending on handling | Photos and videos → Photos if collected/processed; otherwise relevant content field | Optional; selective sharing; inspect actual image loading behavior |
| Manually entered meeting spot and session location | Location → Coarse/Precise Location if value meets definition; otherwise Other User Content | Location → Approximate/Precise location if value meets definition; otherwise Other personal/user content | Optional/location-bearing content; no GPS code found; user-typed locations can still qualify |
| Listings and proposal/session terms | User Content → Other User Content | App activity → Other user-generated content | Core activity; arrange help |
| Private exchange messages | User Content → Emails or Text Messages | Messages → Other in-app messages | Collected when used; communication, disputes/safety |
| Reviews and private thank-you notes | User Content → Other User Content | App activity → Other user-generated content | Optional; reputation and feedback |
| Reports and support content | User Content → Customer Support; other categories present in submissions | App activity → Other user-generated content and other submitted categories | Optional submissions; abuse prevention and support |
| Coin/exchange history | Evaluate Other Data or relevant user-content/activity category; assess purchases only if actual purchases exist | Evaluate App activity → Other actions; assess financial info/purchase history only if actual money/purchases exist | Core ledger; internal non-cash help units; do not assume bank/payment data |
| IP addresses, user agents, request logs, errors | Evaluate Diagnostics, Identifiers, Other Data and location if inferred | Evaluate Diagnostics, Device or other IDs and location if inferred | Infrastructure-dependent; confirm fields, purpose and retention |
| Cookie/session identifiers and device/push tokens, if added | Evaluate User ID, Device ID or other applicable category | Evaluate User IDs or Device or other IDs | Session management; push tokens only if release introduces them |

Choose categories using each platform's current definitions, including overlapping fields where required. [Apple data types and purposes](https://developer.apple.com/app-store/app-privacy-details/), [Google Data safety definitions](https://support.google.com/googleplay/android-developer/answer/10787469).

## Apple worksheet

- **Collect data?** Yes: accounts, profiles, messages and other server records exist.
- **Linked to identity?** Most core records are linked to the account, even when members use usernames. Pseudonymity does not justify “not linked.”
- **Purposes:** App Functionality is the starting point. Add other purposes only where actually used. Profile matching does not automatically justify an advertising declaration.
- **Tracking?** No advertising/tracking SDK was found in the reviewed source. Final answer requires auditing the native app, embedded web content and partners. Analytics alone is not automatically Apple's definition of tracking.
- **App Tracking Transparency?** Assess only if the release performs tracking as Apple defines it. Do not request permission unnecessarily or use a prompt to excuse prohibited practices.
- **Optional information?** Do not assume optional fields are exempt from disclosure; check the narrow conditions in Apple's guidance.
- **Privacy manifests and SDK signatures:** Audit separately from the store privacy label; manifests do not replace policy/label answers.

Publish the privacy-policy URL and keep declarations consistent across release platforms and third-party code. [Apple App Privacy setup](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy).

## Google worksheet

- **Collect data?** Yes. Off-device transmission to your backend is collection.
- **Sharing?** Review each transfer. Provider processing on your behalf and user-initiated transfers may qualify for specific exceptions under Google's definitions; do not select “no sharing” just because providers are called processors.
- **Encryption in transit?** Verify HTTPS/TLS for every app endpoint, database connection and provider transfer before answering yes. Password hashing is not proof of encrypted transport.
- **Deletion requests?** Answer based on the final working app/web deletion flow. Current pseudonymization alone is not evidence that associated data is deleted.
- **Required vs optional?** Account email/IDs are required; optional contact and submitted content depend on the feature. Evaluate each data type as collected across the release.
- **Purposes?** App functionality, account management and fraud prevention/security are likely. Add analytics, advertising, personalization or developer communications only where actually applicable.
- Do not assert an independent security review, certification or badge without evidence.

Definitions and sharing exceptions: [Google Data safety form guidance](https://support.google.com/googleplay/android-developer/answer/10787469).

## Provider and release audit

| Component | Confirm before submission |
|---|---|
| Vercel hosting | Whether used in release; request/log fields, regions, access, retention, analytics settings and contractual protections |
| Supabase PostgreSQL | Release region, access controls, backups, encryption and retention; current auth is custom email/password, not evidence of Supabase Auth usage |
| Resend | Release usage, recipient and email-content processing, delivery logs/retention and any tracking settings |
| Native frameworks/plugins | Complete dependency list, permissions, identifiers, diagnostics, crash reporting, push tokens and SDK privacy declarations |
| External photo hosts | Whether images are opened or rendered, what third parties receive, and whether URLs leak personal information |

## Final sign-off record

- Release version/builds: {{RELEASE_BUILD_IDS}}.
- Audit owner/date: {{DISCLOSURE_AUDITOR_AND_DATE}}.
- Native dependencies and traffic evidence: {{AUDIT_EVIDENCE_LOCATION}}.
- Provider settings verified: {{PROVIDER_VERIFICATION_DATE}}.
- Final privacy-policy version: {{POLICY_VERSION}}.
- Console answers/screenshots stored at: {{DECLARATION_RECORD_LOCATION}}.

Do not copy this worksheet unchanged into either console. Resolve conditional classifications and keep the actual submitted answers with the release record.
