# SEO, AEO and GEO setup

How KindBridge gets found by search engines, answer engines (Google AI Overviews, Bing Copilot) and AI assistants (ChatGPT, Claude, Perplexity, Gemini), and the one-time console setup an owner has to do.

## What the code already does

| Piece | Where | Purpose |
|---|---|---|
| Site facts, FAQ, audiences, skills | `src/lib/site.ts` | Single source for every page, structured data and `llms.txt`. Edit copy here. |
| Metadata defaults | `src/app/layout.tsx` | Title, description, Open Graph, Twitter, verification tags. **Every route is `noindex` unless it opts in** with `publicMetadata()`. |
| Public pages | `/`, `/how-it-works`, `/skills`, `/for/apartment-societies`, `/for/colleges`, `/for/coworking-spaces`, `/rules`, `/signup`, `/login` | Indexable, canonical, with JSON-LD. |
| Structured data | `src/components/json-ld.tsx` | Organization, WebSite, WebApplication, HowTo, FAQPage, WebPage, BreadcrumbList. |
| `robots.txt` | `src/app/robots.ts` | Blocks member/admin screens; explicitly allows AI crawlers on public pages. |
| `sitemap.xml` | `src/app/sitemap.ts` | Built from `PUBLIC_ROUTES`. |
| `llms.txt` | `src/app/llms.txt/route.ts` | Plain-text summary for AI assistants. |
| Social card | `src/app/opengraph-image.tsx` | 1200×630 preview for WhatsApp, LinkedIn, X, Slack. |
| IndexNow | `src/app/indexnow-key.txt/route.ts`, `scripts/indexnow.mjs` | Instant re-crawl requests to Bing, Yandex, Seznam, Naver. |
| 404 page | `src/app/not-found.tsx` | Links back into the public pages. |

To add a public page: give it `export const metadata = publicMetadata({...})`, add it to `PUBLIC_ROUTES`, and link it from `src/components/public-footer.tsx`.

## One-time owner setup

### 1. Google Search Console (most important)

Use the **Domain** property so `kindbridge.co.in`, `www.` and every subdomain are covered.

1. Go to <https://search.google.com/search-console>, sign in with the account that should own KindBridge, **Add property → Domain → `kindbridge.co.in`**.
2. Copy the `google-site-verification=…` TXT record.
3. Add it wherever the domain's DNS is managed (Vercel → Domains → `kindbridge.co.in` → DNS Records, or your registrar): type `TXT`, name `@`, value the copied string.
4. Click **Verify** (DNS can take a few minutes to an hour).
5. **Sitemaps → Add `https://www.kindbridge.co.in/sitemap.xml` → Submit.**
6. **URL inspection →** paste `https://www.kindbridge.co.in/` → **Request indexing**. Repeat for `/how-it-works`, `/skills` and the three `/for/…` pages.

*Alternative (no DNS access):* choose **URL prefix** instead, pick **HTML tag**, copy only the `content="…"` value into the Vercel env var `GOOGLE_SITE_VERIFICATION` (Production), redeploy, then click Verify.

Add the co-founders as **Owners** or **Full users** under Settings → Users and permissions.

### 2. Bing Webmaster Tools (also feeds ChatGPT search, Copilot, DuckDuckGo, Yahoo)

1. <https://www.bing.com/webmasters> → **Import from Google Search Console** (fastest once step 1 is done). Otherwise add the site and use the DNS or `BING_SITE_VERIFICATION` (msvalidate.01) env var.
2. Submit the sitemap.
3. Enable IndexNow: pick a key (e.g. `openssl rand -hex 16`), set `INDEXNOW_KEY` in Vercel (Production), redeploy, and check `https://www.kindbridge.co.in/indexnow-key.txt` shows it.
4. After each deploy that changes public pages:

   ```bash
   INDEXNOW_KEY=your-key npm run seo:ping
   ```

### 3. Check it works

- Rich results: <https://search.google.com/test/rich-results> → test `/how-it-works` (FAQ, HowTo, Breadcrumb) and `/` (Organization, WebApplication).
- Social cards: <https://www.opengraph.xyz> or the LinkedIn Post Inspector with the home URL.
- `https://www.kindbridge.co.in/robots.txt`, `/sitemap.xml`, `/llms.txt` all load.
- PageSpeed: <https://pagespeed.web.dev> on the home page, mobile.

### 4. Google Business Profile (optional)

Only if KindBridge has a real public address or service area. It is not required for a web app.

## Reaching more people

Search alone will be slow for a new domain. These have the biggest effect:

1. **Backlinks from real communities.** Ask each pilot society, college club or coworking space to link to `https://www.kindbridge.co.in/` (or the matching `/for/…` page) from its website, newsletter or notice board QR code. A handful of genuine local links matters more than anything on-page.
2. **Official profiles.** Create Instagram, LinkedIn and (later) Play Store / App Store listings, then add their URLs to `SOCIAL_PROFILES` in `src/lib/site.ts`. They become `sameAs` links, which help Google and AI assistants recognise KindBridge as an entity.
3. **Be quotable.** AI assistants cite pages that answer a question in the first sentence. When adding FAQ entries in `src/lib/site.ts`, lead with the direct answer, then the detail.
4. **Listings and directories.** Product Hunt, Indian startup directories, college placement/club pages, and timebanking/mutual-aid directories. Use the same name, one-line description and URL everywhere.
5. **Share with UTM tags** so you can see what works, e.g. `https://www.kindbridge.co.in/?utm_source=whatsapp&utm_campaign=lakeview_launch`.
6. **Measure.** Search Console shows search queries and clicks. If you also want visitor analytics, Vercel Web Analytics is cookie-free, but it is a new data processor: add it to the privacy policy and store data-safety answers first (`docs/store-launch/06-data-disclosures.md`).

## Legal and support pages

`/privacy-policy`, `/terms`, `/safety`, `/support` and `/delete-account` are built from the drafts in `docs/store-launch/`, adjusted to match what the app does today (for example, closing an account pseudonymises it rather than erasing every message). Operator details live in `src/lib/legal.ts`:

1. Fill in every `null` field there. Blanks show as highlighted "to be confirmed" text.
2. Have the wording reviewed, ideally by counsel.
3. Set `published: true`.

Until all fields are filled **and** `published` is true, the pages show a draft banner, are `noindex`, and are left out of the sitemap. Once live, they are indexed and added to the sitemap automatically. Then:

- Update the sign-up checkbox (`src/app/signup/page.tsx`) to accept the terms and privacy policy as well as the community rules.
- Use `https://www.kindbridge.co.in/privacy-policy`, `/terms`, `/support`, `/delete-account` and `/safety` in the App Store and Play Console.
