import { requireMember } from "@/lib/auth";
import { updateProfile } from "@/app/actions";
import { AVAILABILITY_OPTIONS } from "@/lib/constants";
import { AVATAR_KEYS } from "@/components/avatar";
import { ActionForm, Submit } from "@/components/forms";
import { PageHeader, Screen } from "@/components/ui";
import { AvatarPicker } from "@/app/signup/avatar-picker";

export const metadata = { title: "Edit profile" };

export default async function EditProfile() {
  const { profile } = await requireMember();
  return (
    <Screen>
      <PageHeader title="Edit profile" back="/profile" />
      <ActionForm action={updateProfile} className="space-y-4">
        <AvatarPicker keys={AVATAR_KEYS} defaultValue={profile.avatar} />
        <div>
          <label className="label" htmlFor="bio">Short bio</label>
          <input id="bio" name="bio" className="field" defaultValue={profile.bio} maxLength={160} placeholder="Curious mind. Happy to help." />
          <p className="mt-1 text-[12px] text-muted">Public to your community. Don't include contact details.</p>
        </div>
        <div>
          <label className="label" htmlFor="availability">Availability</label>
          <select id="availability" name="availability" className="field" defaultValue={profile.availability}>{AVAILABILITY_OPTIONS.map((o) => <option key={o}>{o}</option>)}</select>
        </div>
        <label className="card flex items-center gap-3 p-4">
          <span className="flex-1"><span className="block font-bold">Pause availability</span><span className="block text-[13px] text-muted">You'll appear as unavailable. Booked sessions aren't affected.</span></span>
          <input type="checkbox" name="paused" className="toggle" defaultChecked={profile.paused} />
        </label>
        <p className="text-[13px] text-muted">Your username ({profile.displayName}) can't be changed during the pilot.</p>
        <Submit>Save profile</Submit>
      </ActionForm>
    </Screen>
  );
}
