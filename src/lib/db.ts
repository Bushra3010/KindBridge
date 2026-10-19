import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// PRISMA_LOG=1 prints every query with its duration (handy when pages feel slow).
export const db = globalForPrisma.prisma ?? new PrismaClient({ log: process.env.PRISMA_LOG ? ["query"] : [] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export type Tx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">;

export function transaction<T>(fn: (tx: Tx) => Promise<T>) {
  return db.$transaction(fn, { maxWait: 15_000, timeout: 20_000 });
}
