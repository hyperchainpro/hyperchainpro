import { PrismaClient } from '@prisma/client'

// Force the correct DATABASE_URL before Prisma client initialization
process.env.DATABASE_URL = process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')
  ? process.env.DATABASE_URL
  : 'postgresql://z@127.0.0.1:5433/branchboard'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db