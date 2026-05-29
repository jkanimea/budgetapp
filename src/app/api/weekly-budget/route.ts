import { NextRequest } from "next/server";
import { budgetService } from "@/services/budget.service";

export async function GET() {
  try {
    const budgets = await budgetService.getBudgets();
    return Response.json({ budgets });
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

    const parsed = parseFloat(weeklyAmount);
    if (isNaN(parsed) || parsed <= 0) {
      return Response.json({ error: "weeklyAmount must be a positive number" }, { status: 400 });
    }

    await budgetService.setWeeklyBudget(categoryId, parsed, startDate ? new Date(startDate) : undefined);

    return Response.json({ success: true });
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

    await budgetService.deleteBudget(id);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: "Failed to delete budget", details: (error as Error).message },
      { status: 500 }
    );
  }
}
