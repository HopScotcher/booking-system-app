// lib/db.ts

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Database utility functions
export async function healthCheck() {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

export async function disconnectDb() {
  await db.$disconnect();
}

// Transaction helper
export async function withTransaction<T>(
  callback: Parameters<typeof db.$transaction>[0]
): Promise<T> {
  return await db.$transaction(callback);
}
