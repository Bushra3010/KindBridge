import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";

const COOKIE = "kb_session";
const SESSION_DAYS = 30;

const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 11);
}

export async function createSession(accountId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.session.create({ data: { id: hashToken(token), accountId, expiresAt } });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: hashToken(token) } });
  jar.delete(COOKIE);
}

export async function verifyLogin(email: string, password: string) {
  const account = await db.account.findUnique({ where: { email: email.trim().toLowerCase() } });
  // Compare against a dummy hash when the account doesn't exist to keep timing uniform.
  const ok = await bcrypt.compare(password, account?.passwordHash ?? "$2a$11$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
  if (!account || !ok) throw new AppError("That email and password don't match.");
  if (account.status === "SUSPENDED") throw new AppError("This account is restricted. Contact support for help.");
  if (account.status === "CLOSED") throw new AppError("This account was closed.");
  return account;
}

/** The signed-in account, or null. */
// Share the session lookup within one render only; never cache across requests/users.
export const currentAccount = cache(async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { id: hashToken(token) },
    include: { account: { include: { profile: true } } },
  });
  if (!session || session.expiresAt < new Date() || session.account.status !== "ACTIVE") return null;
  return session.account;
});

export type Viewer = NonNullable<Awaited<ReturnType<typeof currentAccount>>>;

/**
 * Loads the signed-in member and their onboarding state, redirecting to the
 * next incomplete onboarding step. Pass `allowPending` for pages a member
 * awaiting approval may see.
 */
export async function requireMember(opts: { allowPending?: boolean } = {}) {
  const account = await currentAccount();
  if (!account) redirect("/login");
  if (!account.emailVerifiedAt) redirect("/verify");
  if (!account.profile) redirect("/signup");
  const membership = await db.membership.findFirst({
    where: { accountId: account.id, status: { in: ["PENDING", "APPROVED"] } },
    include: { community: true },
    orderBy: { status: "asc" }, // APPROVED first
  });
  if (!membership) redirect("/onboarding/community");
  if (!account.profile.onboardedAt) redirect("/onboarding/skills");
  if (membership.status === "PENDING" && !opts.allowPending) redirect("/onboarding/community"); // approves it
  return { account, profile: account.profile, membership, community: membership.community };
}

export async function requireRole(roles: string[]) {
  const account = await currentAccount();
  if (!account) redirect("/login");
  if (!roles.includes(account.role)) redirect("/home");
  return account;
}
