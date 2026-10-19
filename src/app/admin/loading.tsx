export default function AdminLoading() {
  return <div role="status" aria-label="Loading admin page" className="space-y-6">
    <div className="h-9 w-48 rounded-xl bg-line/60" />
    <div className="card h-28" />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{Array.from({ length: 5 }, (_, i) => <div key={i} className="card h-24" />)}</div>
    <p className="text-sm text-muted">Loading your workspace…</p>
  </div>;
}
