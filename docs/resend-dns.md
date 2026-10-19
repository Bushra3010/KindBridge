# Resend setup for kindbridge.co.in

Resend generated these records for the `kindbridgeapp` workspace on 19 October 2026. All three records were added to Vercel DNS under `kind-bridge` and confirmed through public DNS on 19 October 2026. Resend verified the domain on 19 October 2026 at 18:12 IST.

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDPDVzl9NxAFtKyPq6Mg+AaF48yXtP3hH3VwKWuY7NlGkNKwyNxMcyDcW9NfxiTCXnpbDFsdxA2W1gJXgymcbVsppJO579dPPm8n2jEAQsOSHAsyF06OLBbCS60n9jWF1WV2xunmdPfnbBHBvI7du99cyHQH/leg+gAjphCkJOS2wIDAQAB` | Auto |
| CNAME | `rsend` | `rsend-apne1.forge.rmta.net` | 60 |
| CNAME | `send` | `send.forge.rmta.net` | 60 |

Resend also suggests an optional DMARC record: TXT `_dmarc` = `v=DMARC1; p=none;`. Preserve an existing DMARC policy if one exists.

These are the values shown in this account's Resend setup, including its Tokyo-region sending CNAMEs. The DKIM value is a public key, not an API secret. Do not replace existing mail records or change the domain's nameservers.

Configuration checklist (completed):

1. In Resend's domain setup, choose **I've already added the records**, then wait for verification.
2. Create **KindBridge production OTP** with **Sending access**, scoped to `kindbridge.co.in` when selectable.
3. Store the secret as the server-only `RESEND_API_KEY` in the correct Vercel project's production environment. Set `EMAIL_FROM` to `KindBridge <noreply@kindbridge.co.in>`.
4. Redeploy the verified project, request a code for `kindbridgeapp@gmail.com`, and check delivery in Resend.

The token-authorized Vercel checks confirmed project `kind-bridge/kindbridge` (`prj_y6X5fpxDTzjmulIAdWOfy1xa0MCr`) and domain ownership. Added record IDs: DKIM `rec_3a788805a24675f9eab93779`, rsend `rec_96aba03495560b93d6a6e9f0`, send `rec_389812257ac14e52099e0b3d`. Existing website records were preserved. The Sending-only key `KindBridge production OTP` is restricted to `kindbridge.co.in` and configured as a sensitive production environment variable and in the ignored local `.env`. The sender is `KindBridge <noreply@kindbridge.co.in>`. Production deployment `dpl_76BsgSZqeDbqevdhNSkeacJpuNJ1` reached READY. A fresh OTP requested through the production `/verify` page was confirmed Delivered by Resend (email ID `01a1543b-6aea-77ad-853a-7faf8d9505de`). No secrets are included in this document.

Custom-domain check: `kindbridge.co.in`, `www.kindbridge.co.in`, and `kindbridge-sigma.vercel.app` all resolve in Vercel to READY production deployment `dpl_76BsgSZqeDbqevdhNSkeacJpuNJ1`. The custom domain therefore uses the same tested Resend credentials and OTP flow.
