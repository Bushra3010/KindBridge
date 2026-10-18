import { PrismaClient } from "@prisma/client";

// SQLite allows a single writer; one pooled connection serializes interactive
// transactions instead of failing with SQLITE_BUSY. Postgres relies on the
// conditional updates in ledger.ts for the same guarantees.
function datasourceUrl() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  if (!url.startsWith("file:") || url.includes("connection_limit")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}connection_limit=1`;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient({ datasourceUrl: datasourceUrl() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export type Tx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">;

export function transaction<T>(fn: (tx: Tx) => Promise<T>) {
  return db.$transaction(fn, { maxWait: 15_000, timeout: 20_000 });
}
