import { createHash, randomInt } from "node:crypto";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { sendEmail, verificationEmail } from "@/lib/email";

export const CODE_MINUTES = 15;
export const MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_SECONDS = 60;

const hash = (code: string) => createHash("sha256").update(code).digest("hex");

/** Creates a fresh 6-digit code (only its hash is stored) and emails it. */
export async function sendVerificationCode(accountId: string, opts: { force?: boolean } = {}) {
  const account = await db.account.findUniqueOrThrow({ where: { id: accountId } });
  if (account.emailVerifiedAt) return;
  const wait = account.verifySentAt ? RESEND_COOLDOWN_SECONDS - (Date.now() - account.verifySentAt.getTime()) / 1000 : 0;
  if (!opts.force && wait > 0) throw new AppError(`Please wait ${Math.ceil(wait)} seconds before asking for another code.`);

  const code = String(randomInt(100000, 1000000));
  await db.account.update({
    where: { id: accountId },
    data: { verifyCode: hash(code), verifyExpiresAt: new Date(Date.now() + CODE_MINUTES * 60_000), verifySentAt: new Date(), verifyAttempts: 0 },
  });
  await sendEmail(verificationEmail(account.email, code, CODE_MINUTES));
}

/** Checks a code. Wrong guesses are counted; after MAX_ATTEMPTS the code is void. */
export async function checkVerificationCode(accountId: string, code: string) {
  const account = await db.account.findUniqueOrThrow({ where: { id: accountId } });
  if (account.emailVerifiedAt) return;
  if (!account.verifyCode || !account.verifyExpiresAt || account.verifyAttempts >= MAX_ATTEMPTS)
    throw new AppError("That code is no longer valid. Tap “Send a new code”.");
  if (account.verifyExpiresAt < new Date()) throw new AppError("That code has expired. Tap “Send a new code”.");
  if (hash(code.trim()) !== account.verifyCode) {
    // Conditional increment so parallel guesses can't exceed the limit.
    await db.account.updateMany({ where: { id: accountId, verifyAttempts: { lt: MAX_ATTEMPTS } }, data: { verifyAttempts: { increment: 1 } } });
    const left = MAX_ATTEMPTS - account.verifyAttempts - 1;
    throw new AppError(left > 0 ? `That code doesn't match. ${left} ${left === 1 ? "try" : "tries"} left.` : "Too many wrong codes. Tap “Send a new code”.");
  }
}
