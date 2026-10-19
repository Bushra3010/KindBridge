import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  accountLookup: vi.fn(), profileLookup: vi.fn(), createAccount: vi.fn(),
  createSession: vi.fn(), sendCode: vi.fn(),
  issued: vi.fn(), grant: vi.fn(), notify: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`redirect:${path}`); } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: {
  account: { findUnique: mocks.accountLookup, create: mocks.createAccount },
  profile: { findUnique: mocks.profileLookup },
}, transaction: vi.fn() }));
vi.mock("@/lib/auth", () => ({
  hashPassword: async () => "password-hash", createSession: mocks.createSession,
  currentAccount: vi.fn(), destroySession: vi.fn(), verifyLogin: vi.fn(),
}));
vi.mock("@/lib/services/verification", () => ({ sendVerificationCode: mocks.sendCode, checkVerificationCode: vi.fn() }));
vi.mock("@/lib/services/ledger", () => ({ issuedStarterTotal: mocks.issued, starterGrant: mocks.grant, correct: vi.fn() }));
vi.mock("@/lib/services/support", () => ({ notify: mocks.notify, audit: vi.fn(), nextRef: vi.fn() }));

import { signup } from "@/app/actions";
import { maybeGrantStarter } from "@/lib/services/membership";
import type { Tx } from "@/lib/db";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.accountLookup.mockResolvedValue(null);
  mocks.profileLookup.mockResolvedValue(null);
  mocks.createAccount.mockResolvedValue({ id: "new-account" });
  mocks.issued.mockResolvedValue(0);
  mocks.sendCode.mockResolvedValue(undefined);
});

describe("signup with email OTP", () => {
  it("sends a verification code and requires verification before onboarding", async () => {
    const form = new FormData();
    for (const [key, value] of Object.entries({ username: "NewNeighbour", email: "neighbour@example.com", password: "test-password", avatar: "a1", adult: "on" })) form.set(key, value);
    await expect(signup(null, form)).rejects.toThrow("redirect:/verify");
    expect(mocks.createSession).toHaveBeenCalledWith("new-account");
    expect(mocks.sendCode).toHaveBeenCalledWith("new-account");
    expect(mocks.createAccount.mock.calls[0][0].data).not.toHaveProperty("emailVerifiedAt");
  });
  it("still rejects an existing email instead of creating a duplicate account", async () => {
    mocks.accountLookup.mockResolvedValue({ id: "existing" });
    const form = new FormData();
    for (const [key, value] of Object.entries({ username: "NewNeighbour", email: "neighbour@example.com", password: "test-password", avatar: "a1", adult: "on" })) form.set(key, value);
    expect(await signup(null, form)).toEqual({ error: expect.stringContaining("already exists") });
    expect(mocks.createAccount).not.toHaveBeenCalled();
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
});

describe("starter coins require email verification", () => {
  function fixture(status = "APPROVED", accountStatus = "ACTIVE", starterGranted = false) {
    const membership = { id: "membership", communityId: "community", accountId: "member", status, starterGranted, account: { status: accountStatus, emailVerifiedAt: new Date() }, community: { starterGrant: 20, starterAllocation: 100 } };
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    return { tx: { membership: { findUniqueOrThrow: vi.fn().mockResolvedValue(membership), updateMany } } as unknown as Tx, updateMany };
  }
  it("grants starter coins to an approved member with a verified email", async () => {
    const { tx } = fixture();
    expect(await maybeGrantStarter(tx, "membership")).toBe(true);
    expect(mocks.grant).toHaveBeenCalledWith(tx, expect.objectContaining({ accountId: "member", amount: 20 }));
  });
  it.each([["PENDING", "ACTIVE", false], ["APPROVED", "SUSPENDED", false], ["APPROVED", "ACTIVE", true]])("preserves eligibility safeguards (%s, %s, granted=%s)", async (status, accountStatus, granted) => {
    const { tx, updateMany } = fixture(status, accountStatus, granted);
    expect(await maybeGrantStarter(tx, "membership")).toBe(false);
    expect(mocks.grant).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
  });
  it("does not grant starter coins before email verification", async () => {
    const { tx } = fixture();
    vi.mocked(tx.membership.findUniqueOrThrow).mockResolvedValue({ id: "membership", status: "APPROVED", starterGranted: false, account: { status: "ACTIVE", emailVerifiedAt: null } } as never);
    expect(await maybeGrantStarter(tx, "membership")).toBe(false);
    expect(mocks.grant).not.toHaveBeenCalled();
  });
  it("still respects the community coin allocation", async () => {
    mocks.issued.mockResolvedValue(100);
    expect(await maybeGrantStarter(fixture().tx, "membership")).toBe(false);
    expect(mocks.grant).not.toHaveBeenCalled();
  });
});
