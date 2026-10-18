# KindBridge — Product Requirements Document

**Version:** 1.0  
**Date:** October 19, 2026  
**Status:** Proposed product specification for validation  
**Launch market:** India; first community to be selected  
**Working name:** KindBridge — name and trademark availability unchecked

This PRD supersedes the original direct-barter PRD. Members earn coins by helping one person and spend them receiving help from another. The product uses private usernames, voluntary selective disclosure, and paid visibility that is separate from earned reputation. Defaults below are proposed implementation decisions; commercial assumptions are not forecasts.

## 1. Product summary

KindBridge is a community platform where adults exchange practical help using earned virtual coins. Members discover relevant skills nearby, agree on a task and coin amount, coordinate privately, and confirm completion. Real names and contact information are hidden from other members unless voluntarily shared.

**Value proposition:** Share a skill, earn help coins, and get useful help from your community—without publicly revealing your identity.

**Example:** PlantWizard helps a neighbor with balcony plants and earns 20 coins. PlantWizard later spends those coins on spreadsheet guidance from SheetExpert. SheetExpert can spend the coins on another member's help. No reciprocal match between the original two people is required.

The main business hypothesis is that useful earning and spending opportunities produce repeat participation, while organizations or a subset of members pay for coordination, convenience, or relevant visibility.

## 2. Problem and audience

Residents need occasional practical assistance but may not know who can help. Community chats make requests easy to post but difficult to discover, schedule, track, and resolve. Contributors need a credible expectation that helping today will let them receive useful help later.

| User | Primary need | Example |
| --- | --- | --- |
| Resident seeking help | Find an available helper without publicly posting personal details | Basic laptop setup guidance |
| Contributor | Put a skill to use and earn future help | Language practice in exchange for coins |
| Learner or hobbyist | Affordable, recurring peer learning | Beginner music or plant-care session |
| Community organizer | Launch and sustain a useful member network | Apartment association or college organizer |
| Moderator | Resolve reports and stalled exchanges with appropriate evidence | Investigate a disputed completion |

Start with 50–100 consenting adults in one apartment society, college community, or coworking space. The first release supports one active community per account; cross-community discovery is deferred. Strong local supply matters more than total registrations.

## 3. Objectives and boundaries

### Objectives

1. Complete a useful first help session with minimal coordination friction.
2. Let earners spend their coins on relevant help within a reasonable period.
3. Preserve user-controlled privacy while maintaining account accountability.
4. Demonstrate repeat participation and manageable support effort.
5. Test paid community plans and visibility after core activity is established.

### Outside the initial release

- Cash purchases of help coins, cash withdrawal, cryptocurrency, or speculative coin trading.
- Unrestricted coin gifts, account-to-account balance transfers, or cross-community spending.
- Professional contractor booking, goods trading, tool lending, or employment.
- Public real-name directories, precise-location maps, or public transaction histories.
- Automated service-quality guarantees, emergency response, or automated dispute arbitration.
- Services involving medical, legal, financial, hazardous, regulated, childcare, or personal-care work.
- Private-home service visits during the pilot. Online help and agreed shared-space meetings are supported.

Later expansion requires explicit scope and policy decisions rather than silently enabling excluded categories.

## 4. Product structure and release priorities

| Release | Scope | Exit condition |
| --- | --- | --- |
| P0: Community pilot | Profiles, community checks, offers/requests, search, chat, terms, coin ledger, scheduling, completion, reviews, privacy, reporting, moderation | Core journey works; activity and coin usefulness measured |
| P1: Monetization beta | Paid boosts, community subscriptions, billing, organizer tools, recurring sessions, digests | Paying customers receive measurable value; free activity remains healthy |
| P2: Expansion | Premium conveniences, skill circles, sponsored events, additional communities | Repeatable launch economics and sufficient moderation capacity |

A responsive mobile-first web app is the proposed delivery format. Native apps and a framework choice are not prerequisites for validating the concept.

## 5. Core journeys

### A. Join and establish a profile

Register → verify a contact channel → accept adult/community eligibility and rules → choose a unique username and avatar → request membership in a supported community → add offered skills, needed skills, and availability.

The member can browse after approval and propose or accept help once verification and starter-balance eligibility checks are satisfied.

### B. Request and receive help

Search existing offers or post a request → receive or send a proposal → agree on task, duration, coin amount, format, and time → reserve coins → coordinate through private chat → receive help → confirm completion → release coins → review.

### C. Help and earn

Browse relevant requests → submit a proposal → requester accepts terms → confirm coins are reserved → provide help → mark delivered → receive coins after recipient confirmation or moderator resolution → discover help available within the earned balance.

### D. Share details with one person

Open the accepted exchange → select Share details → choose recipient and fields → preview → confirm. The recipient receives access only to the selected fields. Sharing does not require the recipient to reciprocate.

### E. Buy visibility, after P1 launch

Select a valid offer or request → review community, category, period, rotation, and price → pay → receive a sponsored placement during the selected period → view delivered impressions and inquiries.

## 6. Functional requirements

### 6.1 Accounts, membership, and profiles — P0

- A stable internal account ID owns reputation, balances, and permissions independently of the public username.
- Usernames are unique, screened for impersonation and abuse, and do not display verification data. Changing a username does not reset account history or enforcement.
- Profiles show offered/needed skills, availability, completed-help count, reviews, and optional avatar. Real names, phone numbers, email addresses, and exact addresses are hidden by default.
- Contact verification and community membership are distinct badges with explicit meanings. Neither is labeled identity verification.
- Pilot membership uses an organizer-confirmed invitation or approval. Verification records are private; community organizers do not receive unrestricted access to platform account data.
- Members can pause availability, close listings, manage notifications, and request account deletion.
- Accounts undergoing unresolved transactions or investigations follow a documented closure process; suspending an account does not destroy its balance records.

### 6.2 Listings and discovery — P0

- Members create an offer or request with category, description, expected duration, proposed coin amount, format, and availability.
- Only approved service categories are selectable. A report action remains available for prohibited content posted under an allowed category.
- Search and filters cover keyword, category, offer/request, availability, online/shared-space format, and affordable coin range.
- Discovery is restricted to the approved community. Exact locations are never included in search results.
- Organic ranking prioritizes relevance and current availability, with reliability signals and exploration opportunities for new members. Account coin balance is not a ranking factor.
- Empty results offer a path to post a request or receive an opt-in alert. The app does not fabricate listings or availability.
- A one-off listing pauses when an exchange is accepted. Recurring capacity is deferred to P1.

### 6.3 Proposals and accepted terms — P0

- A proposal includes the service recipient, helper, deliverable, estimated duration, coin total, meeting format, date/time, and required materials.
- The requester must approve any coin amount. Revisions create a new terms version and require fresh acceptance; only the latest accepted version can authorize settlement.
- Acceptance atomically reserves coins and listing capacity. A failed reservation leaves the proposal unaccepted and explains the insufficient balance.
- Unaccepted proposals expire after seven days by default. Before acceptance, participants may decline or withdraw without a coin movement.
- Dates display in the member's local timezone; schedules are stored consistently and timezone changes must not change the actual appointment instant.

### 6.4 Chat, scheduling, and notifications — P0

- Private chat is restricted to participants. Authorized moderators receive case-scoped access when investigating reports.
- Chat does not require sharing phone numbers or other identity fields. Mask contact details in notification previews by default.
- Show accepted terms and status alongside the conversation.
- Rescheduling requires both participants' agreement. Existing terms remain in force until a change is accepted.
- Notify members about proposals, acceptance, approaching sessions, delivery claims, cancellations, and disputes. Transactional notifications and optional marketing/digests have separate preferences.
- Blocking stops free-form messages and new proposals while preserving structured completion, cancellation, reporting, and support actions for an existing exchange.

### 6.5 Reviews and reputation — P0

- Only parties to a settled completed exchange can submit one review each.
- Reviews publish after both submit or seven days after settlement to reduce retaliation.
- Display counts alongside aggregate ratings. Do not present a single review as strong evidence of reliability.
- Review prompts prohibit personal details, meeting addresses, and contact information; members can report exposure.
- Public reputation summarizes activity without exposing counterparties or a transaction graph. The member's own ledger remains private.
- Paid boosts cannot change reviews, completed-help counts, verification badges, or earned contributor rankings.

## 7. Help-coin economy and accounting — P0

### Proposed pilot defaults

- Use integer coins. A proposed reference rate is 10 coins per 30 minutes of everyday help, with mutually agreed integer quotes permitted within category limits set for the pilot.
- Give an eligible approved account a one-time 20-coin starter grant from a capped community onboarding allocation. Exact values are hypotheses to test.
- Coins are not sold, withdrawn for cash, converted into boost credits, or transferred outside a settled help exchange.
- No fee is deducted from help transfers during the pilot. Routine session completion moves existing coins; it does not mint a second reward.
- No expiry during the pilot. Future expiry rules would need advance communication and a separate product decision.

### Ledger requirements

Maintain an append-only transaction ledger with available and reserved balance buckets. Every operation has an idempotency key, actor, timestamp, related exchange, and reason. Operations include starter grant, reserve, release, settlement, refund, and authorized correction.

Each operation must balance against another account/bucket, including a system issuance account for grants. Member balances cannot be negative. The system must distinguish coins issued from coins transferred and reconcile both daily.

Corrections use reversing entries rather than edits. Platform staff cannot silently change a balance. Issuance, reversals, and sensitive adjustments require authorization and audit records. Reserved coins are unavailable to other requests.

### Supply and abuse controls

- Starter grants occur once per eligible account, subject to duplicate-account checks and a capped community allocation.
- Monitor suspicious starter claims, repeated closed-loop exchanges, self-dealing, review manipulation, and unusual transaction patterns. Signals trigger review, not automatic public accusations.
- Starter grants and any later referral rewards increase supply; report them separately from earned transfers.
- Track spending opportunities and concentrated/unspent balances. Creating more coins is not the default remedy for insufficient helpers.
- Any referral reward is deferred until later validation and must have a budget, eligibility rules, and fraud checks.

## 8. Exchange states and resolution rules — P0

Core lifecycle: **Proposed → Accepted/coins reserved → In progress → Delivered/awaiting confirmation → Completed/coins settled**.

Additional outcomes: Declined, Withdrawn, Expired, Cancelled, and Disputed. Dispute state preserves prior events and the held balance.

| Situation | Required behavior |
| --- | --- |
| Helper reports delivery | Ask recipient to confirm or dispute. Do not immediately transfer coins. |
| Recipient confirms | Atomically transfer reserved coins to helper and complete the exchange once. |
| Recipient does not respond | Remind after 24 and 72 hours; flag for review after seven days. No automatic success settlement. |
| Cancellation before work | Either party may cancel; release reserved coins. Record reason and monitor repeated no-shows. |
| Cancellation after work begins | Participant selects partial delivery/dispute; hold funds pending an agreed settlement or moderator decision. |
| Both agree partial delivery | Record the agreed amount and explicit approval from both, settle that portion, and release the remainder. |
| No-show or quality dispute | Hold remaining reserved funds and open a case; do not decide solely from a rating or missed message. |
| Moderated resolution | Record evidence reviewed, amount settled/refunded, reason, and appeal path; enforce total settlement plus refund no greater than the held amount. |
| Blocked or suspended account | Preserve exchange records and structured resolution access through support. |

Review eligibility applies to full completed exchanges in P0. Partial outcomes and no-shows contribute private operational signals and case history, not ordinary public completion reviews.

## 9. Privacy and selective disclosure — P0

- Do not market the service as guaranteeing complete anonymity. Real-world interaction can reveal identity.
- Sharing is field-specific, recipient-specific, and voluntary. Eligible fields include chosen first name, photo, phone number, and meeting location.
- The preview shows exactly what will be shared and confirms that the recipient may retain a copy.
- Represent sharing as an access grant, not a copied public-profile field. Users can revoke future in-app access and see active grants.
- APIs, search indexes, exported reports, notifications, and analytics must respect disclosure permissions. A hidden profile field must not be obtainable through a direct API request.
- No mutual reveal by default. No requirement to pay to hide information.
- Community statistics suppress small groups or granular combinations that could identify participants. Organizers cannot inspect private chats, identities, or ledgers merely because they pay for a plan.
- Define retention, deletion, restricted support access, and incident response before pilot launch. Pseudonymize closed public profiles while retaining only documented records needed for transaction and report resolution.

## 10. Safety and moderation — P0

Provide report actions for listings, profiles, messages, reviews, and exchanges. Reports include category, optional explanation, and relevant evidence. The sender receives an acknowledgment and case status without exposing the reporter to the other member.

Moderators can remove content, restrict accounts, resolve coin holds, and record enforcement. Case access and coin-adjustment permissions are separate roles. Sensitive actions are audited.

Pilot target: human triage within one business day during published support hours. Staff this service before launch; do not advertise emergency assistance. Provide meeting-in-shared-space guidance and prohibit requests for account passwords or credentials during tech help.

## 11. Monetization requirements

### 11.1 Paid boosts — P1

Members buy temporary sponsored visibility for an eligible offer or request in their community and category. Proposed purchase mechanism: direct purchase of a defined boost package; if a boost-credit balance is introduced, keep it in a separate ledger with no conversion to help coins.

- Show duration, dates, targeting, rotation, price, and refund terms before payment.
- Clearly label every placement Sponsored. Never sell Top Contributor status.
- Show only matching active listings; suspended accounts and prohibited services cannot promote.
- Limit inventory; decline or reschedule purchases when no slot is available. Do not guarantee every buyer first position or guaranteed requests.
- Keep normal discovery useful. Default design: at most one sponsored card per ten results, only when a relevant placement exists.
- Track actual impressions, profile opens, inquiries, and accepted exchanges without exposing other members' identities to advertisers.
- Activate only after server-side payment confirmation; deduplicate payment callbacks and reconcile refunds.
- Refund a campaign that fails to start because of platform error. Disclose that lack of inquiries during a delivered campaign is not a guaranteed-performance refund.
- Test helper and requester demand separately: helpers earning virtual coins may have limited willingness to pay for more work.

Illustrative price experiment: ₹29–₹99 per defined campaign. Duration and final price must be specified together before testing.

### 11.2 Community plans — P1

Sell organizer tools to residential associations, colleges, and coworking operators: private community setup, invitations, membership approvals, category settings, aggregate health reports, and optional onboarding support.

Illustrative price experiment: ₹1,000–₹3,000 per community per month. Measure willingness to pay and renewals. Published pricing must state taxes and inclusions.

Billing needs subscription status, payment records, cancellation, invoices, and an agreed downgrade/grace period. A community payment failure must not confiscate member coins or hide dispute/reporting access.

### 11.3 Premium and sponsorships — P2

Test optional conveniences such as advanced filters, saved alerts, recurring scheduling, and personal activity summaries; initial price hypothesis ₹99/month. If recurring scheduling launches free in P1, do not remove it from existing members without an explicit transition policy.

Later, allow clearly labeled sponsorship of useful skill-sharing activities and offer paid organization setup/training. Do not sell private identities, messages, or member transaction histories.

Basic exchange participation, essential messaging, privacy, reporting, blocking, and dispute access remain free. All paid features require confirmation of the applicable payment, tax, and privacy requirements for the chosen implementation before release; this PRD does not establish legal classification.

## 12. Engagement requirements

The primary loop is **relevant request → completed contribution → useful balance → affordable help → repeat participation**.

| Feature | Phase | Behavior |
| --- | --- | --- |
| Personalized opportunities | P0, basic | Show requests matching declared skills and availability; explain why they match. |
| Spend suggestions | P0 | Show active affordable offers, including when a new balance becomes spendable. |
| Appreciation | P0 | Private thank-you messages and honest reviews after completion. |
| Opt-in digest | P1 | Configurable summary of relevant opportunities, without sensitive details. |
| Recurring sessions | P1 | Members agree recurring appointments; reserve coins for each occurrence separately rather than creating unfunded promises. |
| Skill circles | P2 | Interest-based groups within a community, moderated and opt-in. |
| Monthly goals and badges | P2 | Reward confirmed contribution with recognition, not automatically minted spendable coins. |
| Leaderboards | P2 | Optional participation, usernames only, contribution and reliability based; paid boosts have no effect. |
| Community milestones | P1 | Aggregate completed-help counts with privacy safeguards. |

Do not optimize primarily for daily opens or notification volume. Avoid balance expiry pressure, required daily streaks, and public exposure as engagement mechanisms.

## 13. Data model and permissions

Core entities: Account, PrivateContact, Community, Membership, Profile, SkillCategory, Listing, ProposalVersion, Exchange, Appointment, Conversation, Message, HelpCoinAccount, LedgerTransaction, LedgerEntry, DisclosureGrant, Review, Report, ModerationCase, Notification, and AuditEvent.

P1 adds BoostCampaign, Payment, Refund, Subscription, Organization, OrganizerRole, and AggregateReport. Help coins and monetary billing remain distinct accounting systems.

Permissions are server enforced: members access approved community listings and their own exchanges; counterparties access agreed records and granted details; organizers manage membership and approved aggregate reports; moderators access assigned cases; finance roles manage billing; coin corrections require separate authorization.

Analytics must not contain message bodies, shared addresses, identity documents, or contact values. User-facing deletion and data-access behavior must match the documented retention policy.

## 14. Nonfunctional requirements

- Accessible responsive UI targeting WCAG 2.2 AA for core flows, with keyboard access, labeled forms, readable contrast, and understandable errors.
- Pilot load-test assumption: 100 registered members and 20 concurrent sessions. Target p95 discovery API response below one second under that defined load; revisit before expanding.
- Encrypt transport and stored sensitive data; protect sessions, rate-limit abuse, and enforce authorization on every private resource.
- Ledger operations and payments are idempotent and atomic. Never display success before durable reservation or settlement.
- Show loading, empty, insufficient-balance, suspended-account, failed-payment, and recoverable-network states.
- Provide operational alerts for failed reconciliation, payment callbacks, overdue coin holds, and stalled support cases.
- Back up data and demonstrate a restore before pilot launch. Establish recovery targets and hosting availability objectives before public expansion.

## 15. Metrics and analytics

**North-star metric:** confirmed completed help sessions per active community per week. Count a session once after settlement; exclude cancelled, reversed, and fabricated exchanges.

| Metric | Definition |
| --- | --- |
| Activation | Approved members publishing a listing or sending a proposal within seven days / eligible new approved members with seven days of observation |
| Request fulfillment | Requests reaching confirmed completion / requests in a matured cohort; report open, expired, and cancelled counts separately |
| Matching time | Median time from request publication to accepted funded exchange; also report unmatched requests |
| Completion | Completed exchanges / accepted exchanges whose scheduled completion date has passed, alongside pending and disputed counts |
| Coin usefulness | Members spending earned coins within 30 days of their first earning / first-time earners with a full 30-day observation window; distinguish starter spending |
| Repeat use | Members completing another exchange within 30 days / first-time completers with a full 30-day window |
| Operational effort | Coordinator and moderation minutes per completed exchange |
| Safety | Reports by type/severity, time to triage, disputes, no-shows, and resolution outcomes |
| Economy health | Issued, available, held, and transferred coins; unspent balances; issuance per community; concentration; suspicious activity |
| Monetization | Paid conversion, campaign delivery, subscription renewal/churn, refunds, acquisition cost, and contribution after direct operating costs |

Events include membership_approved, listing_published, proposal_sent, terms_accepted, coins_reserved, service_delivered, completion_confirmed, coins_settled, exchange_cancelled, dispute_opened, disclosure_granted/revoked, and report_submitted. P1 adds payment_confirmed, boost_started, sponsored_impression, and subscription_renewed. Deduplicate settlement events.

## 16. Pilot and decision gates

1. Interview 10–15 potential members and at least two organizers; test privacy expectations, skill supply, willingness to help, and coin pricing comprehension.
2. Test a clickable prototype for requesting, accepting, disclosure, and confirmation.
3. Recruit 50–100 adults in one supported community, with a deliberately balanced skill mix and a named moderator.
4. Run the P0 pilot for eight weeks. Manually assist early matches and record the effort; do not imply self-service success when an organizer arranged it.
5. Evaluate after an adequate observation window. A starting directional gate is 20 completed sessions, at least 25% repeat participation among eligible completers, at least 30% of eligible first-time earners spending earned coins within 30 days, and declining organizer effort. Report counts and uncertainty; these are proposed thresholds, not industry benchmarks.
6. Review every serious safety incident and reconcile every coin hold before expansion. A low report rate alone does not establish safety.
7. Test P1 willingness to pay with a small number of communities and members. Expand only if core fulfillment and unpaid participation remain healthy.

If earning is healthy but spending is poor, inspect missing categories, availability, geographic boundaries, and coin pricing before adding rewards or paid acquisition. If activity requires persistent manual coordination, include that labor in the business model.

## 17. Required acceptance checks

Before the P0 pilot:

1. Complete an end-to-end session from request through reserved coins, settlement, and review.
2. Demonstrate earned coins from that session being spent with a different member.
3. Reject concurrent acceptances that would overspend a balance or book a one-off listing twice.
4. Replay reserve/confirm requests and show no duplicate ledger movements.
5. Cancel before work and restore the full reserved amount exactly once.
6. Resolve partial work and prove settlement plus refund matches the held amount.
7. Handle no-response without automatic successful settlement.
8. Deny unauthorized access to chats, coin history, private fields, and other communities.
9. Share one field with one person and verify another member cannot retrieve it; revoke future access successfully.
10. Block a member while preserving dispute and structured resolution controls.
11. Submit and resolve a report with scoped moderator access and audited adjustments.
12. Reconcile ledger totals, test backup restore, and verify account-closure handling.
13. Validate core flows on mobile, keyboard navigation, and network failures.

Before P1 billing: validate payment callback replay, campaign inventory limits, sponsored labels, failed-start refunds, subscription cancellation/downgrade, and analytics privacy. Required checks should focus on these financial, access-control, and complete user-flow risks.

## 18. Risks and mitigations

| Risk | Response |
| --- | --- |
| Coins cannot buy useful help | Seed complementary supply and measure earned-coin spending before growth. |
| Too much onboarding issuance | Cap grants, reconcile supply, and review duplicate claims. |
| Coin hoarding or uneven skill demand | Show relevant spend opportunities and recruit missing skills; do not assume inflation solves scarcity. |
| Pseudonyms reduce offline confidence | Start online/shared-space, explain verification, and support voluntary disclosure without overstating safety. |
| Collusion or reputation farming | Stable accounts, capped grants, pattern review, and evidence-based enforcement. |
| Paid visibility crowds out useful matches | Strict relevance, limited sponsored inventory, and monitoring of organic fulfillment. |
| Helpers will not pay for boosts | Test requester boosts and organization plans; do not assume advertising demand. |
| Local networks fail to scale | Measure each community's independent activity and launch/support cost. |
| Privacy leakage through reviews or stats | Minimize public history, moderate exposed details, and suppress identifying aggregates. |
| Operations exceed revenue | Track staffing cost, repeat use, and contribution margins from the first pilot. |

## 19. Open decisions and launch checklist

Confirm before implementation commitment: launch community, service allowlist, verification mechanism, coin reference rate and starter allocation, partial/dispute authority, staffing budget, retention policy, owner of each workstream, and delivery timeline.

Confirm before P1: buyer segment, willingness to pay, exact boost duration and inventory, tax-inclusive/exclusive pricing, payment provider, refund/cancellation terms, community downgrade behavior, and applicable requirements for the final payment design.

Release requires approved product/community rules, staffed support, accessible onboarding, tested privacy boundaries, balanced coin accounting, usable reporting, and enough real offers and requests to support the first sessions.

**Success means members can repeatedly turn help given into help received, with privacy they understand and operating costs the business can sustain.**
