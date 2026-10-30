// Tells IndexNow search engines (Bing, Yandex, Seznam, Naver) that the public
// pages changed. Run after a deploy: INDEXNOW_KEY=… npm run seo:ping
// Reads the live sitemap so the list always matches what is deployed.
const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.kindbridge.co.in").replace(/\/+$/, "");
const key = process.env.INDEXNOW_KEY;
if (!key) {
  console.error("Set INDEXNOW_KEY (the same value deployed to the site).");
  process.exit(1);
}

const sitemap = await (await fetch(`${site}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urlList.length) {
  console.error(`No URLs found in ${site}/sitemap.xml`);
  process.exit(1);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(site).host, key, keyLocation: `${site}/indexnow-key.txt`, urlList }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urlList.length} URLs`);
if (!res.ok && res.status !== 202) process.exit(1);
