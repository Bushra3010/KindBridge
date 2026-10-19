"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { attempt, type ActionState } from "@/lib/action";
import { AVATAR_KEYS } from "@/components/avatar";

export async function updateAdminProfile(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireRole(["ADMIN", "COIN_ADMIN"]);
  return attempt(async () => {
    const data = z.object({
      displayName: z.string().trim().min(1, "Enter a display name.").max(40),
      bio: z.string().trim().max(160),
      avatar: z.string().refine(value => AVATAR_KEYS.includes(value), "Choose an avatar."),
    }).parse(Object.fromEntries(form));
    await db.profile.update({ where: { accountId: me.id }, data });
    revalidatePath("/admin", "layout");
    revalidatePath("/profile");
  }, "Profile saved.");
}
