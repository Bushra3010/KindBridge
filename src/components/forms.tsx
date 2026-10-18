"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/action";

export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess,
  id,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  id?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (resetOnSuccess && state?.ok) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form ref={ref} action={formAction} className={className} id={id} noValidate={false}>
      {children}
      {state?.error && (
        <p role="alert" className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-[14px] font-semibold text-minus">
          {state.error}
        </p>
      )}
      {state?.ok && state.message && (
        <p role="status" className="mt-3 rounded-2xl bg-teal-50 px-4 py-3 text-[14px] font-semibold text-teal-800">
          {state.message}
        </p>
      )}
    </form>
  );
}

export function Submit({ children, className = "btn-primary w-full", name, value }: { children: React.ReactNode; className?: string; name?: string; value?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending} name={name} value={value}>
      {pending ? <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden /> : null}
      {children}
    </button>
  );
}

/** Shows a local datetime picker and submits the instant as ISO-8601 UTC. */
export function DateTimeField({ name, defaultValue, label = "Date & time" }: { name: string; defaultValue?: string; label?: string }) {
  const toLocalInput = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const [local, setLocal] = useState("");
  useEffect(() => {
    const initial = defaultValue ?? new Date(Date.now() + 2 * 86_400_000).toISOString();
    const d = new Date(initial);
    if (!defaultValue) d.setHours(16, 0, 0, 0);
    setLocal(toLocalInput(d.toISOString()));
  }, [defaultValue]);
  const iso = local ? new Date(local).toISOString() : "";
  const tz = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";
  return (
    <div>
      <label className="label" htmlFor={`${name}-local`}>{label}</label>
      <input id={`${name}-local`} type="datetime-local" className="field" value={local} onChange={(e) => setLocal(e.target.value)} required />
      <input type="hidden" name={name} value={iso} />
      {tz && <p className="mt-1 text-[12px] text-muted">Shown in your timezone ({tz})</p>}
    </div>
  );
}

/** Renders a stored instant in the viewer's own timezone. */
export function LocalTime({ iso, mode = "datetime" }: { iso: string; mode?: "datetime" | "date" | "time" | "relative" | "range"; }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    const d = new Date(iso);
    if (mode === "relative") {
      const diff = (Date.now() - d.getTime()) / 1000;
      const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
      if (Math.abs(diff) < 60) setText("just now");
      else if (Math.abs(diff) < 3600) setText(rtf.format(-Math.round(diff / 60), "minute"));
      else if (Math.abs(diff) < 86400) setText(rtf.format(-Math.round(diff / 3600), "hour"));
      else setText(rtf.format(-Math.round(diff / 86400), "day"));
      return;
    }
    const opts: Intl.DateTimeFormatOptions =
      mode === "date" ? { weekday: "long", month: "long", day: "numeric" }
      : mode === "time" ? { hour: "numeric", minute: "2-digit" }
      : { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" };
    setText(new Intl.DateTimeFormat(undefined, opts).format(d));
  }, [iso, mode]);
  return <time dateTime={iso} suppressHydrationWarning>{text ?? " "}</time>;
}

export function DateBadge({ iso, minutes }: { iso: string; minutes: number }) {
  const [parts, setParts] = useState<{ dow: string; day: string; month: string; range: string } | null>(null);
  useEffect(() => {
    const d = new Date(iso);
    const end = new Date(d.getTime() + minutes * 60_000);
    const t = (x: Date) => new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(x);
    setParts({
      dow: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(d).toUpperCase(),
      day: String(d.getDate()),
      month: new Intl.DateTimeFormat(undefined, { month: "long" }).format(d),
      range: `${t(d)} – ${t(end)}`,
    });
  }, [iso, minutes]);
  return (
    <div className="flex items-center gap-4">
      <div className="flex w-14 flex-col items-center rounded-2xl bg-sky-50 py-2">
        <span className="text-[11px] font-bold text-muted">{parts?.dow}</span>
        <span className="text-[22px] font-extrabold leading-none text-ink">{parts?.day}</span>
      </div>
      <div>
        <div className="text-[16px] font-bold">{parts?.month}</div>
        <div className="text-[15px] text-ink-soft">{parts?.range}</div>
      </div>
    </div>
  );
}
