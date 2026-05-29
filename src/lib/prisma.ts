import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const client = new PrismaClient();

client.$connect().then(() => {
  client.$executeRawUnsafe("PRAGMA journal_mode=WAL");
});

export const prisma = globalForPrisma.prisma ?? client;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
