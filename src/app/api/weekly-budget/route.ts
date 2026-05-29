import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const budgets = await prisma.budget.findMany({
      include: { category: true },
      orderBy: { category: { name: "asc" } },
    });
    return Response.json({
      budgets: budgets.map((b) => ({
        ...b,
        weeklyAmount: Math.round(b.weeklyAmount) / 100,
      })),
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch budgets", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categoryId, weeklyAmount, startDate } = body;

    if (!categoryId || weeklyAmount == null) {
      return Response.json({ error: "categoryId and weeklyAmount are required" }, { status: 400 });
    }

    const amountCents = Math.round(parseFloat(weeklyAmount) * 100);
    const budget = await prisma.budget.upsert({
      where: { categoryId },
      create: {
        categoryId,
        weeklyAmount: amountCents,
        startDate: startDate ? new Date(startDate) : new Date(),
      },
      update: { weeklyAmount: amountCents },
    });

    return Response.json({ budget: { ...budget, weeklyAmount: Math.round(budget.weeklyAmount) / 100 } });
  } catch (error) {
    return Response.json(
      { error: "Failed to save budget", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = parseInt(request.nextUrl.searchParams.get("id") || "");
    if (!id) return Response.json({ error: "id is required" }, { status: 400 });

    await prisma.budget.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: "Failed to delete budget", details: (error as Error).message },
      { status: 500 }
    );
  }
}
