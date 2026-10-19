import { adminBlockMember, adminDeleteMember } from "@/app/actions";
import { ActionForm, Submit } from "@/components/forms";
import { Icon } from "@/components/icons";

type Target = { id: string; status: string; role: string; label: string };

/** Block/unblock and delete controls for one member, shared by the list and detail pages. */
export function MemberActions({ m, from = "list" }: { m: Target; from?: "list" | "detail" }) {
  if (m.status === "CLOSED") return null;
  const blocked = m.status === "SUSPENDED";
  return (
    <div className="flex shrink-0 items-start gap-2">
      <details className="group relative">
        <summary className={`btn-sm list-none ${blocked ? "btn-secondary" : "btn-secondary text-orange-900"} cursor-pointer`}>
          <Icon name={blocked ? "check" : "ban"} size={16} /> {blocked ? "Unblock" : "Block"}
        </summary>
        <div className="card absolute right-0 z-20 mt-2 w-72 p-3 text-left shadow-lg">
          <p className="text-[13px] text-muted">{blocked ? `Let ${m.label} sign in again.` : `${m.label} is signed out everywhere and can't sign in until unblocked. Their coins and history are kept.`}</p>
          <ActionForm action={adminBlockMember} className="mt-2 space-y-2">
            <input type="hidden" name="accountId" value={m.id} />
            <input type="hidden" name="block" value={blocked ? "0" : "1"} />
            <input name="reason" className="field py-2" placeholder="Reason (optional, kept in audit log)" />
            <Submit className={blocked ? "btn-primary btn-sm w-full" : "btn-primary btn-sm w-full bg-orange-700 hover:bg-orange-800"}>{blocked ? "Unblock member" : "Block member"}</Submit>
          </ActionForm>
        </div>
      </details>
      {m.role !== "ADMIN" && (
        <details className="group relative">
          <summary className="btn-secondary btn-sm cursor-pointer list-none text-minus"><Icon name="x" size={16} /> Delete</summary>
          <div className="card absolute right-0 z-20 mt-2 w-80 p-3 text-left shadow-lg">
            <p className="text-[13px] text-muted">Permanently removes {m.label}. If they have coin or exchange history, the account is closed and anonymised instead so the ledger stays intact. This can&apos;t be undone.</p>
            <ActionForm action={adminDeleteMember} className="mt-2 space-y-2">
              <input type="hidden" name="accountId" value={m.id} />
              <input type="hidden" name="from" value={from} />
              <input name="reason" required className="field py-2" placeholder="Reason (required)" />
              <input name="confirm" required autoComplete="off" className="field py-2" placeholder="Type DELETE to confirm" aria-label="Type DELETE to confirm" />
              <Submit className="btn-primary btn-sm w-full bg-red-700 hover:bg-red-800">Delete account</Submit>
            </ActionForm>
          </div>
        </details>
      )}
    </div>
  );
}
