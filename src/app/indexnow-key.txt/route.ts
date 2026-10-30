// IndexNow ownership file (https://www.indexnow.org). Bing, Yandex, Seznam and
// Naver fetch it to confirm pings from scripts/indexnow.mjs come from us.
export const dynamic = "force-static";

export function GET() {
  const key = process.env.INDEXNOW_KEY;
  if (!key) return new Response("Not found", { status: 404 });
  return new Response(key, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
