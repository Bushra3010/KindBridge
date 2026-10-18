// Field-specific, recipient-specific, revocable disclosure (PRD §9).
// Other members can only read a private field through an active grant;
// there is no other code path that returns PrivateContact to a non-owner.

import { db, transaction } from "@/lib/db";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { DISCLOSURE_FIELDS, type DisclosureField } from "@/lib/constants";
import { notify } from "./support";

const SHAREABLE_STATUSES = ["ACCEPTED", "IN_PROGRESS", "DELIVERED", "COMPLETED", "DISPUTED", "RESOLVED"];

export async function grant(ownerId: string, exchangeId: string, fields: string[]) {
  const valid = fields.filter((f): f is DisclosureField => f in DISCLOSURE_FIELDS);
  if (valid.length === 0) throw new AppError("Choose at least one detail to share.");
  return transaction(async (tx) => {
    const ex = await tx.exchange.findUnique({ where: { id: exchangeId } });
    if (!ex) throw notFound("Exchange");
    if (ex.requesterId !== ownerId && ex.helperId !== ownerId) throw forbidden();
    if (!SHAREABLE_STATUSES.includes(ex.status)) throw new AppError("You can share details once a session is booked.");
    const recipientId = ex.requesterId === ownerId ? ex.helperId : ex.requesterId;

    const contact = await tx.privateContact.findUnique({ where: { accountId: ownerId } });
    for (const field of valid) {
      if (!contact?.[DISCLOSURE_FIELDS[field].key]) throw new AppError(`Add your ${DISCLOSURE_FIELDS[field].label.toLowerCase()} in Privacy & sharing first.`);
      const existing = await tx.disclosureGrant.findFirst({ where: { ownerId, recipientId, field, revokedAt: null } });
      if (!existing) await tx.disclosureGrant.create({ data: { ownerId, recipientId, exchangeId, field } });
    }
    await notify(tx, recipientId, { type: "disclosure_granted", title: "A member shared some details with you", href: `/exchanges/${exchangeId}` });
  });
}

/** Revokes future in-app access. The recipient may already have saved a copy. */
export async function revoke(ownerId: string, grantId: string) {
  return transaction(async (tx) => {
    const g = await tx.disclosureGrant.findUnique({ where: { id: grantId } });
    if (!g || g.ownerId !== ownerId) throw notFound("Shared detail");
    await tx.disclosureGrant.update({ where: { id: g.id }, data: { revokedAt: new Date() } });
  });
}

export async function revokeAllFor(ownerId: string, recipientId: string) {
  await db.disclosureGrant.updateMany({ where: { ownerId, recipientId, revokedAt: null }, data: { revokedAt: new Date() } });
}

/** Returns only the fields `ownerId` has actively granted to `viewerId`. */
export async function visibleContact(viewerId: string, ownerId: string) {
  if (viewerId === ownerId) throw new AppError("Use your own privacy settings to view your details.");
  const grants = await db.disclosureGrant.findMany({ where: { ownerId, recipientId: viewerId, revokedAt: null } });
  if (grants.length === 0) return {};
  const contact = await db.privateContact.findUnique({ where: { accountId: ownerId } });
  const out: Partial<Record<DisclosureField, string>> = {};
  for (const g of grants) {
    const field = g.field as DisclosureField;
    const value = contact?.[DISCLOSURE_FIELDS[field].key];
    if (value) out[field] = value;
  }
  return out;
}
