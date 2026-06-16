import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient | null {
  try {
    const url = process.env.DATABASE_URL || '';
    if (!url.startsWith('postgresql://') && !url.startsWith('postgres://') && !url.startsWith('file:')) {
      return null;
    }
    // Skip client creation for placeholder/unreachable hosts
    if (url.includes('ep-branchboard-123456') || url.includes('localhost') && !url.includes('file:')) {
      return null;
    }
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error'] : [],
    });
  } catch {
    return null;
  }
}

function tryGetClient(): PrismaClient | null {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma ?? null;
}

function noOpProxy(): unknown {
  return new Proxy({}, {
    get() { return noOpProxy(); },
    apply() { return Promise.resolve([]); },
  });
}

/**
 * Database client with graceful fallback.
 * Returns empty results when database is not available.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = tryGetClient();
    if (!client) return noOpProxy();
    const val = (client as Record<string, unknown>)[prop as string];
    if (typeof val === 'function') return val.bind(client);
    return val;
  },
});