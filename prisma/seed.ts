// Bootstraps an empty database with one platform admin, from ADMIN_EMAIL and
// ADMIN_PASSWORD. Communities and skill categories are then created in /admin.
// For throwaway demo data instead, run `npm run db:seed:demo` on an empty database.
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || password.length < 12) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) in .env first.");
  if (await db.account.findUnique({ where: { email } })) {
    console.log(`${email} already exists — nothing to do.`);
    return;
  }
  await db.account.create({
    data: {
      email, passwordHash: await bcrypt.hash(password, 11), emailVerifiedAt: new Date(), adultConfirmedAt: new Date(), rulesAcceptedAt: new Date(), role: "ADMIN",
      profile: { create: { username: "kbadmin", displayName: "KB Admin", avatar: "a7", onboardedAt: new Date() } },
    },
  });
  console.log(`Created admin ${email}. Sign in and set up a community and skill categories in /admin.`);
}

main().finally(() => db.$disconnect());
