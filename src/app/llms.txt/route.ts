import { AUDIENCES, FAQ, HOW_IT_WORKS, SITE_DESCRIPTION, SITE_NAME, SITE_URL, SKILL_AREAS } from "@/lib/site";

// llms.txt (https://llmstxt.org): a plain summary for AI assistants and answer
// engines, built from the same copy as /how-it-works so the two never drift.
export const dynamic = "force-static";

export function GET() {
  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

Key facts:
- Type: community skill-sharing web app (mobile-first), currently a free community pilot in India.
- Audience: adults aged 18 and over, organised into communities such as apartment societies, colleges and coworking spaces.
- Currency: help coins, an internal unit earned by helping and spent on help. Coins cannot be bought, sold or cashed out.
- Privacy: members use a username and illustrated avatar; real names and contact details are shared only by choice, with one person at a time, and can be revoked.
- Safety: everyday help only (no medical, legal, financial, hazardous, regulated, childcare or personal-care services); meetings happen online or in shared spaces, never private homes; blocking, reporting and moderated disputes are built in.
- Price: free to join and use; no fee on coin transfers.

## How it works

${HOW_IT_WORKS.map((s, i) => `${i + 1}. **${s.name}** — ${s.text}`).join("\n")}

## Skills members share

${SKILL_AREAS.map((s) => `- **${s.name}:** ${s.text}`).join("\n")}

## FAQ

${FAQ.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}

## Pages

- [Home](${SITE_URL}/): what KindBridge is and how to get started
- [How it works](${SITE_URL}/how-it-works): step-by-step guide and full FAQ
- [Skills you can share](${SITE_URL}/skills): the kinds of everyday help members trade
${AUDIENCES.map((a) => `- [${a.title}](${SITE_URL}/for/${a.slug}): ${a.description}`).join("\n")}
- [Community rules](${SITE_URL}/rules): the rules every member agrees to
- [Create an account](${SITE_URL}/signup): free sign-up for adults 18+
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
