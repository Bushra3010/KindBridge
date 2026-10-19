import { describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { checkVerificationCode, MAX_ATTEMPTS, sendVerificationCode } from "@/lib/services/verification";

vi.mock("server-only", () => ({}));
const sent: string[] = [];
vi.mock("@/lib/email", () => ({
  sendEmail: async (e: { text: string }) => void sent.push(e.text.match(/\d{6}/)![0]),
  verificationEmail: (to: string, code: string) => ({ to, subject: "", html: "", text: `code ${code}` }),
}));

let n = 0;
async function account() {
  n++;
  return db.account.create({ data: { email: `v${n}-${Date.now()}@test.dev`, passwordHash: "x" } });
}

describe("§6.1 email verification", () => {
  it("emails a code, stores only its hash, and accepts it", async () => {
    const a = await account();
    await sendVerificationCode(a.id);
    const code = sent.at(-1)!;
    const stored = await db.account.findUniqueOrThrow({ where: { id: a.id } });
    expect(stored.verifyCode).toBe(createHash("sha256").update(code).digest("hex"));
    await expect(checkVerificationCode(a.id, code)).resolves.toBeUndefined();
  });

  it("locks the code after too many wrong guesses", async () => {
    const a = await account();
    await sendVerificationCode(a.id);
    const code = sent.at(-1)!;
    const wrong = code === "000000" ? "111111" : "000000";
    for (let i = 0; i < MAX_ATTEMPTS; i++) await expect(checkVerificationCode(a.id, wrong)).rejects.toThrow(/match|Too many/);
    await expect(checkVerificationCode(a.id, code)).rejects.toThrow(/no longer valid/);
  });

  it("rejects expired codes and rate-limits resends", async () => {
    const a = await account();
    await sendVerificationCode(a.id);
    await expect(sendVerificationCode(a.id)).rejects.toThrow(/wait/);
    await db.account.update({ where: { id: a.id }, data: { verifyExpiresAt: new Date(Date.now() - 1000) } });
    await expect(checkVerificationCode(a.id, sent.at(-1)!)).rejects.toThrow(/expired/);
  });
});
