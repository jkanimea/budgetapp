import { vi } from "vitest";

export const mockPrisma = {
  $transaction: vi.fn((queries: unknown[]) => Promise.all(queries)),
  category: {
    findMany: vi.fn(),
    upsert: vi.fn(),
  },
  transaction: {
    findMany: vi.fn(),
    count: vi.fn(),
    createMany: vi.fn(),
    groupBy: vi.fn(),
    aggregate: vi.fn(),
  },
  budget: {
    findMany: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));
