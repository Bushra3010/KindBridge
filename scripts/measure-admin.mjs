// Read-only comparison against the previous serial reconciliation query pattern.
import nextEnv from '@next/env';
import { tsImport } from 'tsx/esm/api';
import { performance } from 'node:perf_hooks';
import assert from 'node:assert/strict';
nextEnv.loadEnvConfig(process.cwd());
const { db } = await tsImport('../src/lib/db.ts', import.meta.url);
const { reconcile } = await tsImport('../src/lib/services/ledger.ts', import.meta.url);
async function previousReconcile() {
  const accounts = await db.helpCoinAccount.findMany();
  const sums = await db.ledgerEntry.groupBy({ by: ['coinAccountId', 'bucket'], _sum: { amount: true } });
  const problems = [];
  let issued = 0, available = 0, reserved = 0;
  for (const a of accounts) {
    const av = sums.find(s => s.coinAccountId === a.id && s.bucket === 'AVAILABLE')?._sum.amount ?? 0;
    const rs = sums.find(s => s.coinAccountId === a.id && s.bucket === 'RESERVED')?._sum.amount ?? 0;
    if (av !== a.available || rs !== a.reserved) problems.push(`Account ${a.id}: cached ${a.available}/${a.reserved} ≠ ledger ${av}/${rs}`);
    if (a.kind === 'MEMBER') {
      if (a.available < 0 || a.reserved < 0) problems.push(`Account ${a.id} has a negative balance`);
      available += a.available;
      reserved += a.reserved;
    } else issued += -(a.available + a.reserved);
  }
  if (issued !== available + reserved) problems.push(`Issued ${issued} ≠ member holdings ${available + reserved}`);
  const unbalanced = await db.ledgerEntry.groupBy({ by: ['transactionId'], having: { amount: { _sum: { not: 0 } } } });
  for (const u of unbalanced) problems.push(`Transaction ${u.transactionId} is unbalanced`);
  const transferred = await db.ledgerEntry.aggregate({ where: { amount: { gt: 0 }, transaction: { type: 'SETTLE' } }, _sum: { amount: true } });
  return { ok: problems.length === 0, problems, totals: { issued, available, reserved, transferred: transferred._sum.amount ?? 0 } };
}
try {
  await db.$connect();
  // Warm the connection pool so startup doesn't skew either implementation.
  await Promise.all(Array.from({ length: 4 }, () => db.account.count()));
  for (let run = 1; run <= 3; run++) {
    let started = performance.now();
    const previous = await previousReconcile();
    const oldMs = Math.round(performance.now() - started);
    started = performance.now();
    const current = await reconcile();
    const newMs = Math.round(performance.now() - started);
    assert.deepEqual({ ...current, problems: [...current.problems].sort() }, { ...previous, problems: [...previous.problems].sort() });
    console.log(`Run ${run}: serial ${oldMs}ms; optimized ${newMs}ms; reports match`);
  }
} finally { await db.$disconnect(); }

if (process.argv.includes('--http')) {
  const base = process.env.ADMIN_PREVIEW_URL ?? 'http://localhost:3010';
  const loginHtml = await (await fetch(`${base}/login`)).text();
  const form = new FormData();
  const decode = s => s.replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('&amp;', '&');
  for (const input of loginHtml.matchAll(/<input\b[^>]*>/g)) {
    const name = input[0].match(/name="([^"]*)"/)?.[1];
    const value = input[0].match(/value="([^"]*)"/)?.[1];
    if (name?.startsWith('$ACTION')) form.set(decode(name), decode(value ?? ''));
  }
  form.set('email', process.env.ADMIN_TEST_EMAIL ?? 'admin@kindbridge.dev');
  form.set('password', process.env.ADMIN_TEST_PASSWORD ?? 'kindbridge123');
  const login = await fetch(`${base}/login`, { method: 'POST', body: form, redirect: 'manual', headers: { Origin: base } });
  const cookie = login.headers.getSetCookie().map(value => value.split(';')[0]).find(value => value.startsWith('kb_session='));
  assert.ok(cookie, 'Test sign-in did not establish an admin session');
  try {
    for (const route of ['/admin', '/admin/profile']) {
      const started = performance.now();
      const response = await fetch(`${base}${route}`, { headers: { Cookie: cookie }, redirect: 'manual' });
      const headersMs = Math.round(performance.now() - started);
      const html = await response.text();
      const fullMs = Math.round(performance.now() - started);
      assert.equal(response.status, 200);
      assert.ok(html.includes('Welcome back,'));
      assert.ok(html.includes('Platform statistics'));
      assert.ok(html.includes('Ledger'));
      assert.ok(!html.includes('NEXT_REDIRECT'));
      console.log(`${route}: HTTP 200, initial response ${headersMs}ms, full data ${fullMs}ms; no redirect`);
    }
  } finally {
    // Remove only the temporary session this diagnostic created.
    const { createHash } = await import('node:crypto');
    const id = createHash('sha256').update(cookie.slice('kb_session='.length)).digest('hex');
    await db.session.deleteMany({ where: { id } });
    await db.$disconnect();
  }
}
