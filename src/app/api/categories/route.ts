import { transactionService } from "@/services/transaction.service";

export async function GET() {
  try {
    const categories = await transactionService.getCategories();
    return Response.json({ categories });
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch categories", details: (error as Error).message },
      { status: 500 }
    );
  }
}
