import { coinReverse } from "@/app/actions";
import { ActionForm, LocalTime, Submit } from "@/components/forms";

type Txn = {
  id: string;
  type: string;
  reason: string;
  reversesId: string | null;
  createdAt: Date;
  entries: { amount: number; bucket: string; coinAccount: { kind: string; account: { profile: { displayName: string } | null } | null } }[];
};

const TYPE_LABEL: Record<string, string> = { STARTER_GRANT: "Starter grant", RESERVE: "Hold", RELEASE: "Release", SETTLE: "Settlement", REFUND: "Refund", CORRECTION: "Correction" };

function legs(t: Txn) {
  return t.entries
    .map((e) => `${e.coinAccount.kind === "ISSUANCE" ? "Issuance" : (e.coinAccount.account?.profile?.displayName ?? "Member")} ${e.amount > 0 ? "+" : ""}${e.amount}${e.bucket === "RESERVED" ? " held" : ""}`)
    .join(" · ");
}

/** Ledger transactions with an audited reversal form for coin admins. */
export function Transactions({ txns, reversed, canReverse }: { txns: Txn[]; reversed: Set<string>; canReverse: boolean }) {
  if (txns.length === 0) return <p className="text-[14px] text-muted">No transactions.</p>;
  return (
    <div className="card divide-y divide-line">
      {txns.map((t) => (
        <details key={t.id} className="group px-4 py-3">
          <summary className="flex cursor-pointer list-none items-baseline gap-3 text-[14px]">
            <span className="font-bold">{TYPE_LABEL[t.type] ?? t.type}</span>
            <span className="min-w-0 flex-1 truncate text-ink-soft">{legs(t)}</span>
            {reversed.has(t.id) && <span className="pill bg-gray-100 text-gray-700">reversed</span>}
            <span className="shrink-0 text-[12px] text-muted"><LocalTime iso={t.createdAt.toISOString()} mode="relative" /></span>
          </summary>
          <div className="mt-2 space-y-2 text-[13px]">
            <p className="text-muted">{t.reason || "No reason recorded"} · <code>{t.id}</code>{t.reversesId && <> · reverses <code>{t.reversesId}</code></>}</p>
            {canReverse && !reversed.has(t.id) && (
              <ActionForm action={coinReverse} className="flex flex-wrap gap-2">
                <input type="hidden" name="transactionId" value={t.id} />
                <input name="reason" required className="field flex-1 py-2" placeholder="Reason for reversal (recorded in the audit log)" />
                <Submit className="btn-secondary btn-sm">Post reversal</Submit>
              </ActionForm>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
