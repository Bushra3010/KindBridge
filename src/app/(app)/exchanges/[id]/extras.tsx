import Link from "next/link";
import { db } from "@/lib/db";
import { blockMember, exchangeAction, revokeGrant, shareDetails } from "@/app/actions";
import { visibleContact } from "@/lib/services/disclosure";
import { isBlockedEitherWay } from "@/lib/services/safety";
import { DISCLOSURE_FIELDS, type DisclosureField } from "@/lib/constants";
import { ActionForm, Submit } from "@/components/forms";
import { Icon } from "@/components/icons";
import { Note, StatusPill } from "@/components/ui";
import { ShareDetails } from "./share";

type Ex = { id: string; ref: string; status: string; requesterId: string; helperId: string; listing: { title: string } };

/**
 * Everything about one exchange that concerns the *other member* rather than
 * the session itself: chat, review, sharing details, report and block. Shown
 * on that member's profile when opened from the exchange.
 */
export async function ExchangeExtras({ ex, viewerId, otherId, otherName }: { ex: Ex; viewerId: string; otherId: string; otherName: string }) {
  const canShare = ["ACCEPTED", "IN_PROGRESS", "DELIVERED", "COMPLETED", "DISPUTED", "RESOLVED"].includes(ex.status);
  const [sharedWithMe, myGrants, myContact, blocked, myReview] = await Promise.all([
    visibleContact(viewerId, otherId),
    db.disclosureGrant.findMany({ where: { ownerId: viewerId, recipientId: otherId, revokedAt: null } }),
    db.privateContact.findUnique({ where: { accountId: viewerId } }),
    isBlockedEitherWay(db, viewerId, otherId),
    db.review.findFirst({ where: { exchangeId: ex.id, authorId: viewerId } }),
  ]);

  return (
    <section className="mt-6 space-y-3" aria-label={`Your exchange with ${otherName}`}>
      <div className="card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-bold uppercase tracking-wide text-muted">Your exchange · {ex.ref}</p>
            <p className="truncate font-extrabold">{ex.listing.title}</p>
          </div>
          <StatusPill status={ex.status} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link href={`/exchanges/${ex.id}/chat`} className="btn-primary btn-sm"><Icon name="chat" size={18} /> Chat</Link>
          <Link href={`/exchanges/${ex.id}`} className="btn-secondary btn-sm">View exchange</Link>
        </div>
      </div>

      {ex.status === "COMPLETED" && !myReview && (
        <div id="review" className="card space-y-3 p-4">
          <p className="font-extrabold">How did it go with {otherName}?</p>
          <ActionForm action={exchangeAction} className="space-y-3">
            <input type="hidden" name="exchangeId" value={ex.id} />
            <input type="hidden" name="op" value="review" />
            <fieldset className="flex justify-center gap-1" aria-label="Rating">
              {[5, 4, 3, 2, 1].map((n) => (
                <span key={n} className="contents">
                  <input type="radio" name="rating" value={n} id={`r${n}`} defaultChecked={n === 5} className="peer-chip sr-only" required />
                  <label htmlFor={`r${n}`} className="chip cursor-pointer px-3">{n}★</label>
                </span>
              ))}
            </fieldset>
            <textarea name="body" rows={2} className="field" placeholder="A short, honest review (public)" maxLength={500} aria-label="Review" />
            <textarea name="thanks" rows={2} className="field" placeholder={`A private thank-you note for ${otherName} (optional)`} maxLength={500} aria-label="Private thank-you note" />
            <Note>Don&apos;t include names, addresses or contact details.</Note>
            <Submit>Submit review</Submit>
          </ActionForm>
        </div>
      )}
      {ex.status === "COMPLETED" && myReview && (
        <p className="card p-4 text-center text-[14px] text-ink-soft">Thanks for your review. It&apos;s now on their profile.</p>
      )}

      {canShare && Object.keys(sharedWithMe).length > 0 && (
        <div className="card p-4">
          <h2 className="mb-2 font-extrabold">{otherName} shared with you</h2>
          <dl className="space-y-1.5">
            {Object.entries(sharedWithMe).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 text-[14px]">
                <dt className="text-muted">{DISCLOSURE_FIELDS[k as DisclosureField].label}</dt>
                <dd className="font-semibold">{k === "PHOTO" ? <a className="text-teal-700 underline" href={v} target="_blank" rel="noreferrer noopener">View photo</a> : v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {canShare && (
        <details className="card overflow-hidden">
          <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
            <Icon name="shield" className="text-teal-700" />
            <span className="flex-1"><span className="block font-extrabold">Share on your terms</span><span className="block text-[13px] text-muted">Only with {otherName}{myGrants.length ? ` · ${myGrants.length} shared` : ""}</span></span>
            <Icon name="down" size={18} className="text-muted" />
          </summary>
          <div className="border-t border-line px-4 pb-4">
            <ShareDetails
              action={shareDetails}
              exchangeId={ex.id}
              recipient={otherName}
              values={{ FIRST_NAME: myContact?.firstName ?? null, PHOTO: myContact?.photoUrl ?? null, PHONE: myContact?.phone ?? null, MEETING_LOCATION: myContact?.meetingLocation ?? null }}
              alreadyShared={myGrants.map((g) => g.field)}
            />
            {myGrants.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-line pt-3">
                <p className="text-[13px] font-bold text-ink-soft">Currently shared</p>
                {myGrants.map((g) => (
                  <form key={g.id} action={revokeGrant} className="flex items-center justify-between text-[14px]">
                    <input type="hidden" name="grantId" value={g.id} />
                    <span>{DISCLOSURE_FIELDS[g.field as DisclosureField].label}</span>
                    <button className="btn-ghost btn-sm">Stop sharing</button>
                  </form>
                ))}
              </div>
            )}
          </div>
        </details>
      )}

      <div className="card divide-y divide-line overflow-hidden text-[15px]">
        <Link href={`/report?type=EXCHANGE&id=${ex.id}`} className="flex items-center gap-3 px-4 py-3.5 font-semibold hover:bg-mist"><Icon name="flag" className="text-ink-soft" /> Report this exchange</Link>
        {blocked ? (
          <p className="flex items-center gap-3 px-4 py-3.5 text-muted"><Icon name="ban" /> Messaging with {otherName} is off</p>
        ) : (
          <form action={blockMember}>
            <input type="hidden" name="accountId" value={otherId} />
            <input type="hidden" name="next" value={`/exchanges/${ex.id}`} />
            <button className="flex w-full items-center gap-3 px-4 py-3.5 text-left font-semibold text-minus hover:bg-red-50"><Icon name="ban" /> Block {otherName}</button>
          </form>
        )}
      </div>
    </section>
  );
}
