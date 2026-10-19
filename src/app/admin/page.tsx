import { Suspense } from "react";
import { requireRole } from "@/lib/auth";
import { OverviewActivity, OverviewLedger, OverviewNewest, OverviewPlaceholder, OverviewStats } from "./overview-sections";

export const metadata = { title: "Overview" };

export default async function AdminOverview() {
  const me = await requireRole(["ADMIN", "COIN_ADMIN"]);
  const isAdmin = me.role === "ADMIN";
  return <div className="space-y-6">
    <div><p className="admin-eyebrow">COMMUNITY AT A GLANCE</p><h1 className="admin-title">Welcome back, {me.profile?.displayName ?? "Administrator"}.</h1><p className="mt-2 text-sm text-muted">A little oversight keeps a helpful community thriving.</p></div>
    <Suspense fallback={<OverviewPlaceholder label="ledger" />}><OverviewLedger /></Suspense>
    <Suspense fallback={<OverviewPlaceholder label="statistics" />}><OverviewStats isAdmin={isAdmin} /></Suspense>
    <div className="grid gap-6 md:grid-cols-2">
      <Suspense fallback={<OverviewPlaceholder label="recent activity" />}><OverviewActivity /></Suspense>
      <Suspense fallback={<OverviewPlaceholder label="newest accounts" />}><OverviewNewest isAdmin={isAdmin} /></Suspense>
    </div>
  </div>;
}
