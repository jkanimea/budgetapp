import { prisma } from "@/lib/prisma";
import { parseCsvContent } from "@/lib/csv-parser";
import { categorizeTransaction, SEED_CATEGORIES } from "@/lib/categorizer";

type TransactionIncludeCategory = {
  id: number;
  type: string;
  details: string | null;
  particulars: string | null;
  code: string | null;
  reference: string | null;
  amount: number;
  date: Date;
  foreignCurrencyAmount: number | null;
  conversionCharge: number | null;
  category: { id: number; name: string; type: string; icon: string | null; color: string | null } | null;
};

function centsToDollars(cents: number): number {
  return Math.round(cents) / 100;
}

export class TransactionService {
  async seedCategories(): Promise<void> {
    await prisma.$transaction(
      SEED_CATEGORIES.map((cat) =>
        prisma.category.upsert({
          where: { name_type: { name: cat.name, type: cat.type } },
          update: { icon: cat.icon, color: cat.color },
          create: { name: cat.name, type: cat.type, icon: cat.icon, color: cat.color },
        })
      )
    );
  }

  private async getCategoryMap(): Promise<Map<string, number>> {
    const categories = await prisma.category.findMany();
    const map = new Map<string, number>();
    for (const c of categories) {
      map.set(`${c.name}:${c.type}`, c.id);
    }
    return map;
  }

  async importCsv(content: string): Promise<number> {
    await this.seedCategories();
    const parsed = parseCsvContent(content);
    let categoryMap = await this.getCategoryMap();

    const txRows: {
      type: string; details: string; particulars: string;
      code: string; reference: string; amount: number;
      date: Date; foreignCurrencyAmount: number | null;
      conversionCharge: number | null; categoryId: number;
    }[] = [];

    for (const tx of parsed) {
      const { name: catName, type: catType } = categorizeTransaction(
        tx.type, tx.details, tx.particulars
      );
      const key = `${catName}:${catType}`;

      if (!categoryMap.has(key)) {
        const cat = await prisma.category.upsert({
          where: { name_type: { name: catName, type: catType } },
          create: { name: catName, type: catType },
          update: {},
        });
        categoryMap.set(key, cat.id);
      }

      txRows.push({
        type: tx.type,
        details: tx.details,
        particulars: tx.particulars,
        code: tx.code,
        reference: tx.reference,
        amount: tx.amount,
        date: tx.date,
        foreignCurrencyAmount: tx.foreignCurrencyAmount,
        conversionCharge: tx.conversionCharge,
        categoryId: categoryMap.get(key)!,
      });
    }

    const existing = await prisma.transaction.findMany({
      where: {
        OR: txRows.map((tx) => ({
          date: tx.date,
          type: tx.type,
          amount: tx.amount,
          details: tx.details,
        })),
      },
      select: { date: true, type: true, amount: true, details: true },
    });

    const existingSet = new Set(
      existing.map((e) => `${+e.date}|${e.type}|${e.amount}|${e.details}`)
    );

    const newRows = txRows.filter(
      (tx) => !existingSet.has(`${+tx.date}|${tx.type}|${tx.amount}|${tx.details}`)
    );

    if (newRows.length === 0) return 0;

    if (newRows.length > 0) {
      await prisma.transaction.createMany({ data: newRows });
    }

    return newRows.length;
  }

  async getAll(filters?: {
    startDate?: Date;
    endDate?: Date;
    categoryId?: number;
    type?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ transactions: TransactionIncludeCategory[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) (where.date as Record<string, unknown>).gte = filters.startDate;
      if (filters.endDate) (where.date as Record<string, unknown>).lte = filters.endDate;
    }
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.type) where.type = filters.type;
    if (filters?.search) {
      where.OR = [
        { details: { contains: filters.search } },
        { particulars: { contains: filters.search } },
      ];
    }

    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 100;
    const skip = (page - 1) * pageSize;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: "desc" },
        take: pageSize,
        skip,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions: transactions.map((tx) => ({
        ...tx,
        amount: Math.round(tx.amount) / 100,
        foreignCurrencyAmount: tx.foreignCurrencyAmount ? Math.round(tx.foreignCurrencyAmount) / 100 : null,
        conversionCharge: tx.conversionCharge ? Math.round(tx.conversionCharge) / 100 : null,
      })) as unknown as TransactionIncludeCategory[],
      total,
    };
  }

  async getCategories() {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  }
}

export const transactionService = new TransactionService();
