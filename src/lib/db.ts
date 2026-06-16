import { PrismaClient } from '@prisma/client'

/**
 * Database client with graceful fallback.
 * Returns empty results when database is not available.
 */

// ─── No-op handler that mimics Prisma model methods ─────────────────────────

function createNoOpModel(): Record<string, unknown> {
  const emptyPromise = Promise.resolve([]);
  const emptyCountPromise = Promise.resolve({ count: 0 });
  const emptyCreatePromise = Promise.resolve({});
  const emptyUpdatePromise = Promise.resolve({});
  const emptyDeletePromise = Promise.resolve({});
  const emptyFindFirstPromise = Promise.resolve(null);
  const emptyFindUniquePromise = Promise.resolve(null);
  const emptyAggregatePromise = Promise.resolve({});
  const emptyGroupByPromise = Promise.resolve([]);

  return {
    findMany: (..._args: unknown[]) => emptyPromise,
    findFirst: (..._args: unknown[]) => emptyFindFirstPromise,
    findUnique: (..._args: unknown[]) => emptyFindUniquePromise,
    create: (..._args: unknown[]) => emptyCreatePromise,
    createMany: (..._args: unknown[]) => emptyCountPromise,
    update: (..._args: unknown[]) => emptyUpdatePromise,
    updateMany: (..._args: unknown[]) => emptyCountPromise,
    upsert: (..._args: unknown[]) => emptyUpdatePromise,
    delete: (..._args: unknown[]) => emptyDeletePromise,
    deleteMany: (..._args: unknown[]) => emptyCountPromise,
    count: (..._args: unknown[]) => emptyCountPromise,
    aggregate: (..._args: unknown[]) => emptyAggregatePromise,
    groupBy: (..._args: unknown[]) => emptyGroupByPromise,
    fields: {},
  };
}

// ─── Lazy singleton Prisma client ───────────────────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
};

function tryCreateClient(): PrismaClient | null {
  try {
    const url = process.env.DATABASE_URL || '';

    // Only allow postgresql:// or postgres:// URLs
    if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
      return null;
    }

    // Skip placeholder/unreachable hosts
    if (url.includes('123456') || url.includes('localhost')) {
      return null;
    }

    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error'] : [],
    });
  } catch {
    return null;
  }
}

function getClient(): PrismaClient | null {
  if (globalForPrisma.prisma === undefined) {
    globalForPrisma.prisma = tryCreateClient() ?? undefined;
  }
  return globalForPrisma.prisma ?? null;
}

// Cache no-op models so they're consistent
const noOpModels = new Map<string, Record<string, unknown>>();

function getNoOpModel(name: string): Record<string, unknown> {
  if (!noOpModels.has(name)) {
    noOpModels.set(name, createNoOpModel());
  }
  return noOpModels.get(name)!;
}

/**
 * Database proxy that gracefully falls back to no-op when DB is unavailable.
 * Usage: `db.user.findMany(...)` → returns `[]` if no DB connection.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    if (client) {
      const val = (client as Record<string, unknown>)[prop as string];
      if (typeof val === 'function') return val.bind(client);
      return val;
    }
    // No DB available – return a no-op model for any property access
    return getNoOpModel(prop as string);
  },
});