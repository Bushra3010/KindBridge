import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { exchangeAction } from "@/app/actions";
import { reputation } from "@/lib/services/reviews";
import { getOrCreateMemberAccount } from "@/lib/services/ledger";
import { maskContacts } from "@/lib/services/support";
import { FORMATS, REPORT_CATEGORIES, type Format } from "@/lib/constants";
import { ActionForm, DateBadge, DateTimeField, LocalTime, Submit } from "@/components/forms";
import { Avatar } from "@/components/avatar";
import { Coin } from "@/components/brand";
import { Icon } from "@/components/icons";
import { TermsFields } from "@/components/terms-fields";
import { Note, Screen, StatusPill } from "@/components/ui";
import { LiveRefresh } from "./live";

const STEPS = ["PROPOSED", "ACCEPTED", "IN_PROGRESS", "DELIVERED", "COMPLETED"];
const STEP_LABEL = ["Proposed", "Booked", "In progress", "Delivered", "Completed"];

function Op({ op, id, children, className, extra }: { op: string; id: string; children: React.ReactNode; className?: string; extra?: Record<string, string | number> }) {
  return (
    <ActionForm action={exchangeAction}>
      <input type="hidden" name="exchangeId" value={id} />
      <input type="hidden" name="op" value={op} />
      {extra && Object.entries(extra).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <Submit className={className ?? "btn-primary w-full"}>{children}</Submit>
    </ActionForm>
  );
}

export default async function ExchangePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ booked?: string }> }) {
  const { account } = await requireMember();
  const { id } = await params;
  const { booked } = await searchParams;

  const ex = await db.exchange.findUnique({
    where: { id },
    include: {
      listing: { include: { category: true } },
      versions: { orderBy: { version: "desc" } },
      messages: { where: { kind: { not: "SYSTEM" } }, orderBy: { createdAt: "desc" }, take: 1 },
      requester: { include: { profile: true } },
      helper: { include: { profile: true } },
      reviews: true,
    },
  });
  // Non-participants get a 404, not a 403, so exchange IDs reveal nothing.
  if (!ex || (ex.requesterId !== account.id && ex.helperId !== account.id)) notFound();

  const iAmRequester = ex.requesterId === account.id;
  const other = iAmRequester ? ex.helper : ex.requester;
  const otherName = other.profile?.displayName ?? "Member";
  const latest = ex.versions[0];
  const accepted = ex.versions.find((v) => v.id === ex.acceptedVersionId);
  const terms = accepted ?? latest;
  const pendingChange = accepted && latest.id !== accepted.id && ex.status === "ACCEPTED" ? latest : null;

  const [rep, wallet] = await Promise.all([reputation(other.id), getOrCreateMemberAccount(db, ex.communityId, account.id)]);

  const stepIndex = STEPS.indexOf(ex.status);
  const held = ["ACCEPTED", "IN_PROGRESS", "DELIVERED", "DISPUTED"].includes(ex.status);
  const canShare = ["ACCEPTED", "IN_PROGRESS", "DELIVERED", "COMPLETED", "DISPUTED", "RESOLVED"].includes(ex.status);
  const myReview = ex.reviews.find((r) => r.authorId === account.id);
  const lastMessage = ex.messages[0];
  const partialPendingForMe = ex.partialAmount !== null && held && (iAmRequester ? !ex.partialByReq : !ex.partialByHelper);
  const partialPendingForThem = ex.partialAmount !== null && held && !partialPendingForMe;

  return (
    <Screen>
      <LiveRefresh />
      <header className="flex items-center gap-3 pt-2">
        <Link href="/exchanges" aria-label="Back" className="grid size-10 place-items-center rounded-full bg-white/80 shadow-sm"><Icon name="left" /></Link>
        <Link href={`/u/${other.profile?.username}?exchange=${ex.id}`} className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar preset={other.profile?.avatar} size={46} online={!other.profile?.paused} />
          <div>
            <p className="text-[18px] font-extrabold leading-tight">{otherName}</p>
            <p className="text-[13px] text-muted">{rep.rating ? `★ ${rep.rating} · ` : ""}{rep.completedHelp} sessions · {iAmRequester ? "Helping you" : "You're helping"}</p>
          </div>
        </Link>
        <Link href={`/exchanges/${ex.id}/chat`} className="btn-primary btn-sm shrink-0"><Icon name="chat" size={18} /> Chat</Link>
      </header>

      {booked && ex.status === "ACCEPTED" && (
        <div className="card mt-4 p-5 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-gradient-to-br from-teal-200 to-green-200 text-white"><Icon name="check" size={34} className="text-teal-800" /></div>
          <p className="mt-3 text-[22px] font-extrabold">You're booked</p>
          <p className="text-ink-soft">Your session is scheduled.</p>
        </div>
      )}

      {/* Progress */}
      <div className="mt-4 flex items-center justify-between gap-1" aria-label={`Status: ${ex.status}`}>
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 flex-col items-center gap-1">
            <div className={`h-1.5 w-full rounded-full ${stepIndex >= i ? "bg-teal-600" : "bg-teal-100"}`} />
            <span className={`text-[10px] font-bold ${stepIndex === i ? "text-teal-800" : "text-muted"}`}>{STEP_LABEL[i]}</span>
          </div>
        ))}
      </div>
      {!STEPS.includes(ex.status) && <div className="mt-2 text-center"><StatusPill status={ex.status} /></div>}

      {/* Terms */}
      <section className="card mt-4 space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold">{accepted ? "Agreed details" : `Proposed details · v${latest.version}`}</h2>
          <span className="text-[12px] text-muted">{ex.ref}</span>
        </div>
        <p className="rounded-2xl bg-mist px-3 py-2.5 text-[15px]">{terms.deliverable}</p>
        <DateBadge iso={terms.scheduledAt.toISOString()} minutes={terms.durationMin} />
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[14px] text-ink-soft">
          <span className="inline-flex items-center gap-1.5"><Icon name={terms.format === "ONLINE" ? "video" : "pin"} size={17} />{terms.format === "ONLINE" ? "Online session" : "Shared space"}</span>
          <span className="inline-flex items-center gap-1.5"><Icon name="clock" size={17} />{terms.durationMin} minutes</span>
          {terms.materials && <span className="inline-flex items-center gap-1.5"><Icon name="paperclip" size={17} />{terms.materials}</span>}
        </div>
        <div className="card-tint flex items-center gap-3 p-3.5">
          <Coin size={36} />
          <div>
            <p className="text-[18px] font-extrabold">{terms.coins} coins</p>
            <p className="text-[12px] text-ink-soft">
              {ex.status === "PROPOSED" && iAmRequester && `${wallet.available} available → ${wallet.available - terms.coins} after reservation`}
              {ex.status === "PROPOSED" && !iAmRequester && "Reserved from the requester when accepted"}
              {held && `${ex.reserved} reserved · released after confirmation`}
              {ex.status === "COMPLETED" && `${ex.settled} sent to ${iAmRequester ? otherName : "you"}`}
              {ex.status === "RESOLVED" && `${ex.settled} to helper · ${ex.refunded} returned`}
              {ex.status === "CANCELLED" && `${ex.refunded} returned to the requester`}
            </p>
          </div>
        </div>
        {latest.note && !accepted && <p className="text-[14px] text-ink-soft">“{maskContacts(latest.note)}”</p>}
      </section>

      {/* Actions */}
      <section className="mt-4 space-y-3">
        {ex.status === "PROPOSED" && latest.authorId !== account.id && (
          <>
            {iAmRequester && wallet.available < latest.coins && (
              <p className="rounded-2xl bg-amber-50 p-3 text-[14px] text-amber-900">You need {latest.coins} coins but have {wallet.available} available. Suggest a lower amount, or help someone to earn more.</p>
            )}
            <Op op="accept" id={ex.id} extra={{ version: latest.version }}>{iAmRequester ? `Accept & reserve ${latest.coins}` : "Accept"}</Op>
          </>
        )}
        {ex.status === "PROPOSED" && latest.authorId === account.id && (
          <p className="card p-4 text-center text-[14px] text-ink-soft">Waiting for {otherName} to respond. Proposals expire <LocalTime iso={ex.expiresAt.toISOString()} mode="date" />.</p>
        )}
        {ex.status === "PROPOSED" && (
          <>
            <details className="card overflow-hidden">
              <summary className="cursor-pointer list-none p-4 text-center font-bold">Suggest changes</summary>
              <ActionForm action={exchangeAction} className="space-y-4 border-t border-line p-4">
                <input type="hidden" name="exchangeId" value={ex.id} />
                <input type="hidden" name="op" value="revise" />
                <TermsFields d={{ ...latest, scheduledAt: latest.scheduledAt.toISOString() }} maxCoins={ex.listing.category.maxCoins} />
                <Submit>Send new terms</Submit>
                <Note>New terms replace the current proposal and need {otherName}'s acceptance.</Note>
              </ActionForm>
            </details>
            {latest.authorId === account.id
              ? <Op op="withdraw" id={ex.id} className="btn-ghost w-full">Withdraw proposal</Op>
              : <Op op="decline" id={ex.id} className="btn-ghost w-full">Decline</Op>}
          </>
        )}

        {pendingChange && (
          <div className="card space-y-3 p-4">
            <p className="font-bold">New time suggested</p>
            <p className="text-[14px] text-ink-soft"><LocalTime iso={pendingChange.scheduledAt.toISOString()} /></p>
            {pendingChange.authorId !== account.id
              ? <Op op="acceptReschedule" id={ex.id} extra={{ version: pendingChange.version }}>Accept new time</Op>
              : <p className="text-[13px] text-muted">Waiting for {otherName}. The current booking stays in place until then.</p>}
          </div>
        )}

        {ex.status === "ACCEPTED" && (
          <>
            {!iAmRequester && <Op op="deliver" id={ex.id}>Mark help as delivered</Op>}
            <Op op="start" id={ex.id} className="btn-secondary w-full">Start session</Op>
            <div className="grid grid-cols-2 gap-2">
              <details className="card col-span-2 overflow-hidden sm:col-span-1">
                <summary className="flex cursor-pointer list-none items-center justify-center gap-2 p-3 text-[14px] font-bold"><Icon name="calendar" size={18} /> Reschedule</summary>
                <ActionForm action={exchangeAction} className="space-y-3 border-t border-line p-4">
                  <input type="hidden" name="exchangeId" value={ex.id} />
                  <input type="hidden" name="op" value="reschedule" />
                  <DateTimeField name="scheduledAt" defaultValue={terms.scheduledAt.toISOString()} label="New date & time" />
                  <Submit>Suggest new time</Submit>
                </ActionForm>
              </details>
              <details className="card col-span-2 overflow-hidden sm:col-span-1">
                <summary className="flex cursor-pointer list-none items-center justify-center gap-2 p-3 text-[14px] font-bold"><Icon name="x" size={18} /> Cancel session</summary>
                <ActionForm action={exchangeAction} className="space-y-3 border-t border-line p-4">
                  <input type="hidden" name="exchangeId" value={ex.id} />
                  <input type="hidden" name="op" value="cancel" />
                  <label className="label" htmlFor="reason">Reason</label>
                  <input id="reason" name="reason" className="field" placeholder="Something came up" required />
                  <Submit className="btn-danger w-full">Cancel & return {ex.reserved} coins</Submit>
                </ActionForm>
              </details>
            </div>
            <Note>Changes need both members' agreement.</Note>
          </>
        )}

        {ex.status === "IN_PROGRESS" && !iAmRequester && <Op op="deliver" id={ex.id}>Mark help as delivered</Op>}
        {ex.status === "IN_PROGRESS" && iAmRequester && <p className="card p-4 text-center text-[14px] text-ink-soft">Session in progress. {otherName} will mark it delivered when done.</p>}

        {ex.status === "DELIVERED" && iAmRequester && (
          <div className="card space-y-3 p-4">
            <p className="font-bold">Did you receive the help?</p>
            <p className="text-[14px] text-ink-soft">Confirming sends {ex.reserved} reserved coins to {otherName}. This can't be undone.</p>
            <Op op="confirm" id={ex.id}>Confirm & release {ex.reserved} coins</Op>
          </div>
        )}
        {ex.status === "DELIVERED" && !iAmRequester && (
          <p className="card p-4 text-center text-[14px] text-ink-soft">You marked this delivered. {otherName} has been asked to confirm. Coins are released after confirmation.</p>
        )}

        {ex.status === "DISPUTED" && (
          <p className="card border-l-4 border-orange-400 p-4 text-[14px] text-ink-soft">A moderator is reviewing this session. The {ex.reserved} reserved coins stay held until it's resolved. You can still agree a partial amount together below.</p>
        )}

        {partialPendingForMe && (
          <div className="card space-y-3 p-4">
            <p className="font-bold">Partial settlement suggested</p>
            <p className="text-[14px] text-ink-soft">{ex.partialAmount} coins to the helper, {ex.reserved - ex.partialAmount!} returned to the requester.</p>
            <Op op="approvePartial" id={ex.id} extra={{ amount: ex.partialAmount! }}>Agree to this split</Op>
          </div>
        )}
        {partialPendingForThem && <p className="card p-4 text-[14px] text-ink-soft">You suggested {ex.partialAmount} coins to the helper. Waiting for {otherName} to agree.</p>}

        {["IN_PROGRESS", "DELIVERED", "DISPUTED"].includes(ex.status) && (
          <details className="card overflow-hidden">
            <summary className="cursor-pointer list-none p-4 text-center text-[14px] font-bold">Only part of the help happened?</summary>
            <ActionForm action={exchangeAction} className="space-y-3 border-t border-line p-4">
              <input type="hidden" name="exchangeId" value={ex.id} />
              <input type="hidden" name="op" value="partial" />
              <label className="label" htmlFor="amount">Coins for the helper (of {ex.reserved})</label>
              <input id="amount" name="amount" type="number" min={0} max={ex.reserved} defaultValue={Math.floor(ex.reserved / 2)} className="field" required />
              <Submit className="btn-secondary w-full">Suggest partial settlement</Submit>
              <Note>Both members must agree. The rest returns to the requester.</Note>
            </ActionForm>
          </details>
        )}

        {["ACCEPTED", "IN_PROGRESS", "DELIVERED"].includes(ex.status) && (
          <details className="card overflow-hidden">
            <summary className="cursor-pointer list-none p-4 text-center text-[14px] font-bold text-minus">Something went wrong</summary>
            <ActionForm action={exchangeAction} className="space-y-3 border-t border-line p-4">
              <input type="hidden" name="exchangeId" value={ex.id} />
              <input type="hidden" name="op" value="dispute" />
              <label className="label" htmlFor="category">What went wrong?</label>
              <select id="category" name="category" className="field">{REPORT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
              <label className="label" htmlFor="explanation">Details <span className="font-normal text-muted">(optional)</span></label>
              <textarea id="explanation" name="explanation" rows={3} className="field" />
              <Submit className="btn-danger w-full">Ask a moderator to review</Submit>
              <Note>Coin holds remain until resolved. The other member is told a review was requested, not who reported what.</Note>
            </ActionForm>
          </details>
        )}

        {ex.status === "COMPLETED" && !myReview && (
          <Link href={`/u/${other.profile?.username}?exchange=${ex.id}#review`} className="card flex items-center gap-3 p-4"><Icon name="award" className="text-teal-700" /><span className="flex-1 font-bold">How did it go? Review {otherName}</span><Icon name="right" className="text-muted" /></Link>
        )}
        {ex.status === "COMPLETED" && myReview && <p className="card p-4 text-center text-[14px] text-ink-soft">Thanks for your review. {ex.reviews.length < 2 ? "It will publish once both reviews are in or after 7 days." : "Both reviews are published."}</p>}
        {ex.status === "COMPLETED" && iAmRequester === false && (
          <Link href="/home" className="card-tint flex items-center gap-3 p-4"><Coin size={30} /><span className="flex-1 text-[14px] font-bold">You earned {ex.settled} coins. See help you can spend them on.</span><Icon name="right" /></Link>
        )}
      </section>

      <section className="mt-6 space-y-3">
        <Link href={`/exchanges/${ex.id}/chat`} className="card flex items-center gap-3 p-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-teal-50 text-teal-700"><Icon name="chat" /></div>
          <div className="min-w-0 flex-1">
            <p className="font-bold">Chat with {otherName}</p>
            <p className="truncate text-[13px] text-muted">{lastMessage ? `${lastMessage.senderId === account.id ? "You: " : ""}${lastMessage.body}` : "No messages yet"}</p>
          </div>
          <Icon name="right" className="text-muted" />
        </Link>
        <Link href={`/u/${other.profile?.username}?exchange=${ex.id}`} className="card flex items-center gap-3 p-4">
          <Avatar preset={other.profile?.avatar} size={44} />
          <div className="min-w-0 flex-1">
            <p className="font-bold">{otherName}&apos;s profile</p>
            <p className="text-[13px] text-muted">{canShare ? "Share details, review, report or block" : "Reviews, skills, report or block"}</p>
          </div>
          <Icon name="right" className="text-muted" />
        </Link>
      </section>
      <p className="mt-6 text-center text-[12px] text-muted">{FORMATS[ex.listing.format as Format]}{ex.listing.category.active && <> · {ex.listing.category.name}</>} · Listing: <Link className="underline" href={`/listings/${ex.listingId}`}>{ex.listing.title}</Link></p>
    </Screen>
  );
}
