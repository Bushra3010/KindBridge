import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ accounts: vi.fn(), groups: vi.fn(), transferred: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: {
  helpCoinAccount: { findMany: mocks.accounts },
  ledgerEntry: { groupBy: mocks.groups, aggregate: mocks.transferred },
} }));
import { reconcile } from "@/lib/services/ledger";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.accounts.mockResolvedValue([
    { id: "issuance", kind: "ISSUANCE", available: -20, reserved: 0 },
    { id: "member", kind: "MEMBER", available: 15, reserved: 5 },
  ]);
  mocks.groups.mockImplementation(({ by }) => Promise.resolve(by[0] === "coinAccountId" ? [
    { coinAccountId: "issuance", bucket: "AVAILABLE", _sum: { amount: -20 } },
    { coinAccountId: "member", bucket: "AVAILABLE", _sum: { amount: 15 } },
    { coinAccountId: "member", bucket: "RESERVED", _sum: { amount: 5 } },
  ] : []));
  mocks.transferred.mockResolvedValue({ _sum: { amount: 7 } });
});

describe("ledger reconciliation", () => {
  it("preserves balances and transferred totals, including an empty bucket", async () => {
    expect(await reconcile()).toEqual({ ok: true, problems: [], totals: { issued: 20, available: 15, reserved: 5, transferred: 7 } });
  });
  it("still detects cached-balance mismatches, negative holdings and unbalanced transactions", async () => {
    mocks.accounts.mockResolvedValue([
      { id: "issuance", kind: "ISSUANCE", available: -20, reserved: 0 },
      { id: "member", kind: "MEMBER", available: -1, reserved: 5 },
    ]);
    const original = mocks.groups.getMockImplementation()!;
    mocks.groups.mockImplementation(args => args.by[0] === "transactionId" ? Promise.resolve([{ transactionId: "broken" }]) : original(args));
    const result = await reconcile();
    expect(result.ok).toBe(false);
    expect(result.problems).toEqual(expect.arrayContaining([
      expect.stringContaining("cached -1/5 ≠ ledger 15/5"),
      "Account member has a negative balance", "Issued 20 ≠ member holdings 4", "Transaction broken is unbalanced",
    ]));
  });
  it("scopes every ledger read to the selected community", async () => {
    await reconcile("community-a");
    expect(mocks.accounts).toHaveBeenCalledWith(expect.objectContaining({ where: { communityId: "community-a" } }));
    for (const [query] of mocks.groups.mock.calls) expect(query.where).toEqual({ coinAccount: { communityId: "community-a" } });
    expect(mocks.transferred).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ coinAccount: { communityId: "community-a" } }) }));
  });
  it("starts all independent reads before waiting for the database", async () => {
    let resolveAccounts!: (value: unknown[]) => void;
    mocks.accounts.mockImplementation(() => new Promise(resolve => { resolveAccounts = resolve; }));
    const pending = reconcile();
    expect(mocks.groups).toHaveBeenCalledTimes(2);
    expect(mocks.transferred).toHaveBeenCalledTimes(1);
    resolveAccounts([]);
    await pending;
  });
});
