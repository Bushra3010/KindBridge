# Retention, moderation and release operations

Internal owner/engineering handoff. These are tasks and proposed controls, not claims that the current app implements them.

## Retention decisions to approve and implement

Do not select a blanket multi-year retention period for all data. Identify the purpose, applicable legal duty, trigger, access restriction and deletion/anonymization action for each category. Get jurisdiction-specific advice for security logs, safety evidence and statutory records; a non-cash help ledger does not automatically justify retaining chat indefinitely.

| Category | Decision required | Implementation/evidence |
|---|---|---|
| Active/inactive accounts | Inactivity policy, notice and cleanup trigger | Scheduled job and member notice |
| Verification data | Expiry and short post-expiry cleanup window | Clear code/hash, expiry, send timestamps and attempts when no longer needed |
| Sessions | Expiry and cleanup | Revoke on deletion/security action; purge expired records |
| Profile and optional contact | Edit/removal and deletion completion trigger | Remove identifiers, private details, bios, skills and unnecessary membership data |
| Listings/messages/reviews/thanks | Ordinary retention and deletion behavior | Delete or irreversibly anonymize personal content; preserve only specifically justified evidence |
| Ledger/exchange minimum | Necessary retained fields, retention reason and end date | Strip unnecessary identity/free text; restrict access and preserve balanced entries |
| Reports/disputes/audit | Differentiate open cases, closed cases and legal holds | Limited access, hold review dates, scrub unnecessary payload data |
| Web/email/security logs | Vendor and internal limits by purpose | Configure providers; inspect accidental PII/OTP logging |
| Backups | Rotation/expiry and restoration handling | Document expiry; replay deletion after restores |
| Deletion requests | Completion target and minimum proof-of-action retention | Track acknowledgement, verification, exception, completion and notification |

Unresolved choices map directly to the `{{...}}` fields in the Privacy Policy. Keep the final schedule, job configuration and a sample verified deletion report with the release record.

## Safety and support runbook

1. Assign a named support owner and backup; publish real staffed hours and contact channels.
2. Receive reports into a monitored queue with case IDs. Verify all report targets reach the queue.
3. Triage ordinary reports within the existing one-business-day support-hours target. Establish an urgent escalation route for credible threats, exploitation or severe privacy harm.
4. Restrict or remove harmful content and limit abusive accounts; record the reason and minimum evidence. Ensure tools cover every supported content type.
5. For suspected CSAM/exploitation, use a restricted handling/reporting procedure aligned with applicable law. Do not ask users or staff to circulate illegal media.
6. Tell the reporter the outcome where appropriate without exposing another member's private information. Provide a review/appeal route.
7. Limit access to private details and case material by role; review access and security events periodically.
8. Define incident assessment, provider escalation, any applicable notification deadlines, user communications and post-incident action. Keep secrets out of support tickets.

## Release acceptance script

Use real iOS and Android devices plus supported older/newer OS versions. Record build IDs, date, device, pass/fail and screenshots for material results. The presence of source tests is not evidence of a passing mobile release.

| Flow | Acceptance result |
|---|---|
| Signup and email verification | New adult member receives OTP; expiry, failed-attempt lock, resend cooldown and recovery behave correctly |
| Login and recovery | Correct/wrong credentials, reset flow, rate limiting, sign-out and session expiry tested without account enumeration |
| Membership | Pending, approved, rejected/removed states and unavailable-community guidance work |
| Listings | Create/edit/pause/search; no cross-community access; reject prohibited content under implemented controls |
| Exchange | Proposal, accept, reserve, reschedule, deliver, confirm, cancel/refund, partial settlement and dispute work from both sides |
| Ledger | No overspend or double settlement on retries/concurrency; reconcile balances after each critical transition |
| Sharing | Only chosen recipient sees granted fields; revocation prevents future access; external image behavior disclosed |
| Abuse | Report profile/listing/message/review/exchange; blocked member cannot send free-form messages or start new proposals; moderators can act |
| Deletion | Verified public and in-app requests, pending/unverified accounts, open/disputed exchanges, content purge, credentials/session revocation, provider/backup handling |
| Legal pages | All public URLs work logged out on both devices, match store URLs and contain no template fields |
| Usability | Large text, screen reader, contrast, focus, touch targets, keyboard, back navigation and safe areas |
| Reliability | Slow/offline/reconnect, server errors, expired sessions, app resume and update behavior; no stuck coin actions |
| Reviewer access | Fresh install, seeded accounts and instructions work without manual intervention |

Run appropriate existing unit/integration checks and add meaningful mobile/end-to-end checks as implementation proceeds. Use an isolated test environment for destructive or database tests; do not seed/reset a live member database.

## Production readiness and ongoing work

- Verify TLS, database access, secret scoping, operational logs, rate limits and release-only configuration.
- Complete a backup/restore drill, including deletion replay and ledger reconciliation.
- Schedule dependable reminders, expiry handling and retention/deletion jobs; monitor failures.
- Monitor app crashes, OTP failures, API errors, unresolved exchanges and abuse queue age. Audit any telemetry SDK before adding it to the release.
- Establish release rollback and backend compatibility procedures; do not leave old installed apps broken by an API change.
- Maintain store credentials, signing-key recovery, owner access and vendor billing; restrict operational roles.
- Review policies and store disclosures whenever features, permissions, SDKs, providers, regions, retention or monetization change.
- Keep recurring costs budgeted: developer membership, domain, hosting/database/backups, email, support/moderation and maintenance. Exact infrastructure cost depends on usage and plans and was not audited here.

## Release evidence folder

Keep final policy versions, legal/operator details, retention approval, data-map/SDK audit, console declarations, signed build IDs, device-test results, reviewer instructions, artwork rights, backup drill and support ownership in an access-controlled release record. Store credentials and signing keys in secure storage, not this repository.
