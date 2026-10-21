# Public account-deletion and support page drafts

**DRAFT — these describe the required release experience. The external request workflow and complete deletion are not implemented in the reviewed repository.**

## Page A: Delete your KindBridge account

Proposed route: `/delete-account`.

KindBridge is operated by {{LEGAL_NAME}}. You can request deletion of your account and associated personal information through either of these methods:

1. **In the app:** Open Profile → Settings → Delete account, review the explanation and confirm your request.
2. **On the web:** Use the deletion request form below. You do not need to reinstall the app. We will send a verification link to your registered email to confirm that the request is yours.

If you cannot access your registered email, contact {{PRIVACY_EMAIL}} for an alternative identity-verification process. Never send us your password, OTP or identity documents unless a secure, proportionate verification process specifically explains what is required.

### Web request form

- Registered email address — required.
- Optional case reference or explanation — do not include passwords or unnecessary personal details.
- Checkbox: “I request deletion of my KindBridge account and associated personal information.”
- Button: “Request account deletion.”

After submission, show: “If this email is associated with a KindBridge account, we will send instructions to confirm your request.”

### What happens next

We verify ownership and acknowledge your request. We aim to complete ordinary deletion within {{DELETION_COMPLETION_PERIOD}}. If an unresolved exchange affects completion, we record your request and explain the steps and expected timing for settling or cancelling it. You can ask support to help; a stalled exchange should not leave a request pending indefinitely.

We remove your private contact details, credentials and active sessions, delete or irreversibly anonymize unnecessary personal content, and end access to your account. Other members may retain copies they previously saved outside KindBridge.

We may keep limited records where necessary for a specific legal obligation, fraud prevention, security or a dispute. The categories, reasons and periods are: {{RETAINED_RECORDS_REASONS_AND_PERIODS}}. Backups expire within {{BACKUP_EXPIRY}} under the retention schedule. See our Privacy Policy for details.

Help coins cannot be redeemed for cash. We address unresolved reserved coins through the exchange process. Once deletion is complete, an old account and its content cannot ordinarily be restored.

Questions: {{PRIVACY_EMAIL}}. Operator address: {{POSTAL_ADDRESS}}.

## Page B: KindBridge Support

Proposed route: `/support`.

Need help with membership, verification, exchanges, help coins, reporting or deletion? Contact {{SUPPORT_EMAIL}}. Include the affected exchange/case reference, a short description and the app version if known. Do not send passwords, PINs or verification codes.

- Support hours: {{SUPPORT_HOURS}}.
- Ordinary report triage target: one business day during support hours.
- In-app reports: Settings → Report a problem.
- Privacy or deletion: {{PRIVACY_EMAIL}} and the Delete account page.
- Child safety: {{CHILD_SAFETY_EMAIL}}.
- Grievance contact: {{GRIEVANCE_NAME}}, {{GRIEVANCE_CONTACT}}.
- Operator: {{LEGAL_NAME}}, {{POSTAL_ADDRESS}}.

KindBridge is not an emergency service. If someone is in immediate danger, contact local emergency services.

## Engineering handoff — not public copy

- The deletion link must open a functional request mechanism. A static explanation or homepage link is insufficient. Google allows an appropriate support request method, but the proposed verified web form gives a clearer experience.
- Keep initial submission public; verify account ownership before destructive action. Rate-limit submissions and use generic responses to avoid email-account enumeration.
- Record request ID, account reference, verified-at timestamp, status, due date, exceptions, completion and notification. Restrict staff access and retain only necessary request records.
- Explain confirmation and irreversible effects before execution; provide acknowledgement and completion communication. Remove authentication secrets and revoke sessions promptly at the appropriate stage.
- Inventory and purge personal material across profiles, listings, messages, reviews/thanks, notifications, skills, memberships, reports, audit payloads and vendor systems. Retain only justified minimum records; pseudonymous IDs and ledger links can remain personal data.
- Keep the ledger balanced by removing unnecessary personal fields and links, or preserving minimal restricted records for an approved reason; do not destroy ledger integrity to implement deletion.
- Reapply deletion after restoring a backup. Test requests from pending/unverified accounts and members with open/disputed exchanges.
- Link both pages from signup, login and Settings; test outside an authenticated session and from store-console links.

Policy basis: [Google account-deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111), [Apple account-deletion guidance](https://developer.apple.com/support/offering-account-deletion-in-your-app/).
