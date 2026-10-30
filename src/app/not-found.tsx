import Link from "next/link";
import { Logo } from "@/components/brand";
import { PublicFooter } from "@/components/public-footer";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-4 pb-16 pt-12 text-center">
      <Logo size={26} />
      <h1 className="mt-8 text-[26px] font-extrabold">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-[15px] text-ink-soft">It may have moved, or the link may be wrong.</p>
      <Link href="/" className="btn-secondary mt-6 w-full">Back to KindBridge</Link>
      <div className="text-left"><PublicFooter cta={false} /></div>
    </main>
  );
}
