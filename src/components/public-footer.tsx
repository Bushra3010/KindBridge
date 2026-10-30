import Link from "next/link";
import { Icon } from "@/components/icons";
import { LEGAL_PAGES } from "@/lib/legal";
import { AUDIENCES } from "@/lib/site";

/** Sign-up prompt and links between the public pages. */
export function PublicFooter({ cta = true }: { cta?: boolean }) {
  return (
    <footer className="mt-10 space-y-6">
      {cta && (
        <div className="space-y-2.5">
          <Link href="/signup" className="btn-primary w-full">Get started — it&apos;s free <Icon name="right" size={18} /></Link>
          <p className="text-center text-[13px] text-muted">For adults 18+ · <Link href="/login" className="underline">I already have an account</Link></p>
        </div>
      )}
      <nav aria-label="KindBridge" className="border-t border-line pt-5 text-[13px] text-ink-soft">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
          <li><Link href="/" className="hover:underline">Home</Link></li>
          <li><Link href="/how-it-works" className="hover:underline">How it works</Link></li>
          <li><Link href="/skills" className="hover:underline">Skills you can share</Link></li>
          <li><Link href="/rules" className="hover:underline">Community rules</Link></li>
          {AUDIENCES.map((a) => (
            <li key={a.slug}><Link href={`/for/${a.slug}`} className="hover:underline">For {a.name.toLowerCase()}</Link></li>
          ))}
        </ul>
        <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 text-[12px] text-muted">
          {LEGAL_PAGES.map((p) => (
            <li key={p.path}><Link href={p.path} className="hover:underline">{p.short}</Link></li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
