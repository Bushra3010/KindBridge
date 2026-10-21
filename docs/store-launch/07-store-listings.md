# Store listing copy and review handoff

Draft copy for the present free pilot. Use only where each described feature works in the shipped app. No paid visibility, cash earnings, subscriptions or device notifications are advertised.

## Apple App Store

| Field | Draft |
|---|---|
| Name | KindBridge |
| Subtitle | Give help. Find help. |
| Promotional text | Share everyday skills with your community. Earn help coins by helping a neighbour, then use them when you need a hand. For adults aged 18 and over. |
| Keywords | community,neighbours,skills,help,sharing,volunteer,local |
| Primary category candidate | Social Networking; confirm against final experience |
| Support URL | Proposed: `https://kindbridge.co.in/support` |
| Privacy Policy URL | Proposed: `https://kindbridge.co.in/privacy-policy` |
| Copyright | {{YEAR}} {{LEGAL_NAME}} |

The draft name/subtitle fit 30 characters, promotional text fits 170, and keywords fit 100. Confirm all fields against current console constraints. [Apple version metadata](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information).

## Google Play

| Field | Draft |
|---|---|
| App name | KindBridge |
| Short description | Share skills, help neighbours and exchange help coins in your community. |
| Category candidate | Social; confirm honestly, including applicable child-safety requirements |
| App type | App |
| Pricing | Free for the described pilot |
| Ads | No ads found in reviewed source; verify release dependencies |
| Target audience | Adults 18+; answer content rating separately |
| Developer contact | {{SUPPORT_EMAIL}} and applicable verified public operator details |

The draft name fits 30 characters and short description fits 80. Use the full description below, subject to final field validation.

## Shared full description

KindBridge brings everyday community help into one place. Offer a skill, ask for a hand and arrange help with people in your community.

HELP SOMEONE. GET HELP WHEN YOU NEED IT.
Earn help coins by completing an agreed exchange. Use them to request help from another member. Help coins are internal community units: they cannot be bought, sold or redeemed for cash.

FIND THE RIGHT HELP
Browse community offers and requests, share your skills and availability, and agree on the task, time and coin amount before a session begins.

KEEP EXCHANGES ORGANIZED
Use an exchange conversation to agree details, manage changes, confirm completion and raise a dispute when something needs attention.

CHOOSE WHAT YOU SHARE
Use a username and illustrated avatar. Keep optional contact details private from other members until you choose to share specific details with a specific person. Revoke future in-app access through your sharing settings.

SUPPORT A RESPECTFUL COMMUNITY
Report concerning content or behavior, block unwanted interactions and review completed exchanges. Community rules apply to everyone.

KindBridge is for adults aged 18 and over. Community availability and membership approval may apply. Pilot exchanges take place online or in agreed shared spaces; private-home visits and regulated or hazardous services are not permitted. KindBridge is not an emergency service.

Support: {{SUPPORT_EMAIL}}
Privacy Policy: https://kindbridge.co.in/privacy-policy
Terms: https://kindbridge.co.in/terms

## Required artwork and capture brief

| Asset | Preparation |
|---|---|
| Apple app icon | Prepare a high-quality 1024 × 1024 source and build the final asset catalog using current Xcode requirements; validate appearance and export requirements for supported OS versions |
| Google store icon | 512 × 512, 32-bit PNG, up to 1 MB; keep distinct from Android launcher/adaptive icon resources |
| Google feature graphic | 1024 × 500, JPEG or 24-bit PNG without alpha |
| Android screenshots | At least two accepted screenshots; prepare 6–8 portrait phone images. Accepted standard range is 320–3840 px, with the longest side at most twice the shortest; confirm relevant form-factor rules |
| Apple screenshots | Capture actual native iPhone screens in a currently accepted size, for example 1320 × 2868 where accepted for the target display group; add separate iPad assets if supporting iPad |
| Optional preview video | Show real app flows; no need to make a video a first-release blocker unless required for a specific feature/review |

Final formats and device groups: [Google preview assets](https://support.google.com/googleplay/android-developer/answer/9866151), [Apple screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications). Existing PWA icons do not establish that store artwork is complete.

Suggested six-screen sequence: community home (“Help starts nearby”), explore (“Find everyday help”), listing/proposal (“Agree before you begin”), exchange conversation (“Keep the details together”), coins (“Earn help. Ask for help.”), and sharing controls (“Choose what you share”). Use fictional demo records and the actual submitted iOS/Android UI. Do not show real emails, phone numbers, cases or private chats.

## Reviewer information template

**Internal only. Replace placeholders and submit through each console's private review-access fields. Never commit actual credentials.**

App purpose: KindBridge is an adults-only community service for arranging everyday help. It uses non-purchasable, non-cash help coins. Members can arrange online sessions or meet in shared spaces. It is not random/anonymous chat; conversations relate to proposed exchanges.

Reviewer contact: {{REVIEW_CONTACT_NAME}}, {{REVIEW_CONTACT_EMAIL}}, {{REVIEW_CONTACT_PHONE}}.

Account A: {{REVIEWER_A_EMAIL}} / {{REVIEWER_A_PASSWORD}}.
Account B: {{REVIEWER_B_EMAIL}} / {{REVIEWER_B_PASSWORD}}.
Community: {{REVIEW_COMMUNITY}}. Both accounts are preverified, approved and ready to use. {{OTHER_ACCESS_INSTRUCTIONS_OR_NONE}}.

1. Sign in with Account A and open Explore to see safe sample offers.
2. Open {{DEMO_LISTING_TITLE}} and propose an exchange with the sample terms.
3. Sign in with Account B in a separate session and accept. Return to A to inspect reserved coins and exchange conversation.
4. Use the sample exchange to mark delivery and confirm completion; inspect updated coin balances. {{RESET_OR_EXTRA_TEST_DATA_INSTRUCTIONS}}.
5. Open a booked session → Share details to test voluntary sharing. Revoke future access in Profile → Privacy & sharing.
6. Open a sample profile/content report control or Settings → Report a problem. Manage blocks from Privacy & sharing → Blocked accounts.
7. To test deletion, use {{DELETION_TEST_ACCOUNT_AND_ACCESS_INSTRUCTIONS}} with no unresolved exchanges. Open Settings → Delete account, or the public web route. {{DELETION_TIMING_AND_TEST_INSTRUCTIONS}}.

Explain the final native features and platform integration accurately here: {{ACTUAL_MOBILE_FEATURES}}. Do not claim push notifications, offline operation, background checks or end-to-end encryption unless implemented and verified.

Before submission, test every instruction from a clean installation without owner assistance. Keep accounts active for review, provide sufficient sample coins, and ensure reviewer emails do not expose real members.
