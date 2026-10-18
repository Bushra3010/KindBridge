import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";

// The test database is a disposable fixture, recreated on every run.
export default function setup() {
  for (const f of ["test.db", "test.db-journal"]) rmSync(path.join(__dirname, "../prisma", f), { force: true });
  execSync("npx prisma db push --skip-generate", { env: { ...process.env, DATABASE_URL: "file:./test.db" }, stdio: "ignore" });
}
