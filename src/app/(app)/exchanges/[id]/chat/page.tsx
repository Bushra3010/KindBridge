import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { sendMessage } from "@/app/actions";
import { isBlockedEitherWay } from "@/lib/services/safety";
import { ActionForm, LocalTime, Submit } from "@/components/forms";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icons";
import { Screen } from "@/components/ui";
import { LiveRefresh, ScrollToEnd } from "../live";

export const metadata = { title: "Chat" };

/** Full-screen conversation for one exchange; participants only. */
export default async function ExchangeChat({ params }: { params: Promise<{ id: string }> }) {
  const { account } = await requireMember();
  const { id } = await params;
  const ex = await db.exchange.findUnique({
    where: { id },
    include: {
      listing: true,
      messages: { orderBy: { createdAt: "asc" }, take: 300 },
      requester: { include: { profile: true } },
      helper: { include: { profile: true } },
    },
  });
  if (!ex || (ex.requesterId !== account.id && ex.helperId !== account.id)) notFound();
  const other = ex.requesterId === account.id ? ex.helper : ex.requester;
  const otherName = other.profile?.displayName ?? "Member";
  const blocked = await isBlockedEitherWay(db, account.id, other.id);

  return (
    <Screen>
      <LiveRefresh seconds={4} />
      <header className="flex items-center gap-3 pb-3 pt-2">
        <Link href={`/exchanges/${ex.id}`} aria-label="Back to exchange" className="grid size-10 shrink-0 place-items-center rounded-full bg-white/80 shadow-sm"><Icon name="left" /></Link>
        <Link href={`/u/${other.profile?.username}?exchange=${ex.id}`} className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar preset={other.profile?.avatar} size={42} online={!other.profile?.paused} />
          <div className="min-w-0">
            <p className="truncate text-[17px] font-extrabold leading-tight">{otherName}</p>
            <p className="truncate text-[12px] text-muted">{ex.ref} · {ex.listing.title}</p>
          </div>
        </Link>
      </header>

      <div className="space-y-2 pb-4" aria-label="Messages" aria-live="polite">
        {ex.messages.length === 0 && <p className="py-10 text-center text-[14px] text-muted">No messages yet. Say hello to {otherName}.</p>}
        {ex.messages.map((m) =>
          m.kind === "SYSTEM" ? (
            <p key={m.id} className="mx-auto max-w-[85%] text-center text-[12px] text-muted">{m.body}</p>
          ) : (
            <div key={m.id} className={`flex ${m.senderId === account.id ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-3xl px-4 py-2.5 text-[15px] ${m.senderId === account.id ? "rounded-br-lg bg-gradient-to-br from-sky-100 to-teal-100" : "rounded-bl-lg bg-white shadow-sm"}`}>
                <p className="whitespace-pre-line">{m.body}</p>
                <p className="mt-0.5 text-right text-[11px] text-muted"><LocalTime iso={m.createdAt.toISOString()} mode="time" /></p>
              </div>
            </div>
          ),
        )}
        <ScrollToEnd dep={ex.messages.length} />
      </div>

      <div className="chat-composer sticky bottom-[104px] z-10 -mx-5 px-5 pb-2 pt-2">
        {blocked ? (
          <p className="rounded-2xl bg-mist p-3 text-center text-[13px] text-muted">Messaging is off. Session actions, reporting and support stay available.</p>
        ) : (
          <ActionForm action={sendMessage} resetOnSuccess>
            <input type="hidden" name="exchangeId" value={ex.id} />
            <div className="flex items-end gap-2">
              <label htmlFor="body" className="sr-only">Message</label>
              <textarea id="body" name="body" rows={1} className="field flex-1 resize-none rounded-3xl" placeholder={`Message ${otherName}…`} maxLength={2000} required />
              <Submit className="btn-primary size-12 shrink-0 p-0"><Icon name="send" size={20} /><span className="sr-only">Send</span></Submit>
            </div>
            <p className="mt-1.5 text-[11px] text-muted">Never share passwords or one-time codes.</p>
          </ActionForm>
        )}
      </div>
    </Screen>
  );
}
