import type { Tx } from "@/lib/db";

export async function notify(
  tx: Tx,
  accountId: string,
  n: { type: string; title: string; body?: string; href?: string; category?: "REQUESTS" | "COINS" | "COMMUNITY" | "SAFETY" },
) {
  // Bodies never carry contact details; previews stay masked (PRD §6.4).
  await tx.notification.create({
    data: { accountId, type: n.type, title: n.title, body: n.body ?? "", href: n.href ?? "/", category: n.category ?? "REQUESTS" },
  });
}

export async function audit(tx: Tx, e: { actorId: string | null; action: string; targetType: string; targetId: string; data?: unknown }) {
  await tx.auditEvent.create({
    data: { actorId: e.actorId, action: e.action, targetType: e.targetType, targetId: e.targetId, data: JSON.stringify(e.data ?? {}) },
  });
}

/** Short human-readable reference such as KB-1042. */
export async function nextRef(tx: Tx, prefix: "KB" | "CASE") {
  const count = prefix === "KB" ? await tx.exchange.count() : await tx.report.count();
  return `${prefix}-${1001 + count}`;
}

/** Strips phone numbers and email addresses from free text shown in previews. */
export function maskContacts(text: string) {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "•••@•••")
    .replace(/(\+?\d[\d\s-]{7,}\d)/g, "••• ••• ••••");
}
