import { requireMember } from "@/lib/auth";
import { logout, requestDeletion, updateNotificationPrefs } from "@/app/actions";
import { ActionForm, Submit } from "@/components/forms";
import { Icon } from "@/components/icons";
import { Note, PageHeader, Row, Screen } from "@/components/ui";

export const metadata = { title: "Settings & support" };

export default async function Settings() {
  const { account, profile, community } = await requireMember();
  return (
    <Screen>
      <PageHeader title="Settings & support" back="/profile" />
      <div className="card divide-y divide-line overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5"><Icon name="user" className="text-ink-soft" /><span className="flex-1 font-semibold">Account</span><span className="max-w-[55%] truncate text-[14px] text-muted">{account.email}</span></div>
        <details>
          <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5"><Icon name="bell" className="text-ink-soft" /><span className="flex-1 font-semibold">Notifications</span><Icon name="down" size={18} className="text-muted" /></summary>
          <ActionForm action={updateNotificationPrefs} className="space-y-3 px-4 pb-4">
            <label className="flex items-center gap-3"><span className="flex-1 text-[14px]"><strong>Session & proposal updates</strong><br /><span className="text-muted">Always on. Needed to complete exchanges.</span></span><input type="checkbox" className="toggle" checked disabled readOnly /></label>
            <label className="flex items-center gap-3"><span className="flex-1 text-[14px]"><strong>Opportunity digest</strong><br /><span className="text-muted">Occasional summary of relevant requests.</span></span><input type="checkbox" name="digest" className="toggle" defaultChecked={profile.notifyDigest} /></label>
            <Submit className="btn-secondary btn-sm w-full">Save preferences</Submit>
          </ActionForm>
        </details>
        <Row href="/privacy" icon="shield" label="Privacy & sharing" />
        <Row href="/onboarding/skills?next=/settings" icon="sparkle" label="Skills & availability" />
      </div>

      <h2 className="h-section mb-2 mt-6">Help & support</h2>
      <div className="card divide-y divide-line overflow-hidden">
        <Row href="/report" icon="alert" label="Report a problem" />
        <Row href="/settings/cases" icon="file" label="My support cases" />
        <Row href="/privacy/blocked" icon="ban" label="Blocked accounts" />
        <Row href="/rules" icon="info" label="Community rules & safety" />
      </div>
      <div className="mt-3"><Note>Support triages reports within one business day during support hours. KindBridge isn't an emergency service.</Note></div>

      <div className="card mt-6 overflow-hidden">
        <form action={logout}><button className="flex w-full items-center gap-3 px-4 py-3.5 text-left font-semibold hover:bg-mist"><Icon name="logout" className="text-ink-soft" /> Sign out</button></form>
      </div>

      <details className="mt-6">
        <summary className="cursor-pointer text-center text-[14px] font-semibold text-muted">Close my account</summary>
        <ActionForm action={requestDeletion} className="card mt-3 space-y-3 p-4">
          <p className="text-[14px] text-ink-soft">Your profile will be pseudonymized and you'll leave {community.name}. We keep only the records needed for completed exchanges and safety cases, per our retention policy. Open exchanges must be finished first.</p>
          <Submit className="btn-danger w-full">Close account</Submit>
        </ActionForm>
      </details>
    </Screen>
  );
}
