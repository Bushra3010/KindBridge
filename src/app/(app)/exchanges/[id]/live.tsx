"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/** Polls for new messages and status changes while the tab is visible. */
export function LiveRefresh({ seconds = 6 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === "visible") router.refresh(); }, seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}

export function ScrollToEnd({ dep }: { dep: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollIntoView({ block: "nearest" }); }, [dep]);
  return <div ref={ref} />;
}
