import { execSync } from "node:child_process";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";

// The test schema is a disposable fixture, emptied on every run.
export default async function setup() {
  loadEnvConfig(process.cwd());
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL is not set (see .env.example).");
  execSync("npx prisma db push --accept-data-loss --skip-generate", { env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url }, stdio: "ignore" });
  const db = new PrismaClient({ datasourceUrl: url });
  const tables = await db.$queryRaw<{ tablename: string }[]>`select tablename from pg_tables where schemaname = current_schema()`;
  if (tables.length) await db.$executeRawUnsafe(`truncate ${tables.map((t) => `"${t.tablename}"`).join(", ")} cascade`);
  await db.$disconnect();
}
