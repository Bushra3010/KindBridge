// Shown instantly while a member screen loads its data.
export default function Loading() {
  return (
    <main className="app-screen member-screen mx-auto w-full max-w-md px-5 pb-32 pt-[max(env(safe-area-inset-top),24px)]" aria-busy="true" aria-label="Loading">
      <div className="animate-pulse space-y-4 pt-2">
        <div className="flex items-center gap-3"><div className="size-14 rounded-full bg-white/70" /><div className="h-5 w-32 rounded-full bg-white/70" /></div>
        <div className="h-28 rounded-[var(--radius-card)] bg-white/60" />
        <div className="h-5 w-40 rounded-full bg-white/70" />
        <div className="h-20 rounded-[var(--radius-card)] bg-white/60" />
        <div className="h-20 rounded-[var(--radius-card)] bg-white/60" />
      </div>
    </main>
  );
}
