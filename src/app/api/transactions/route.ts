import { NextRequest } from "next/server";
import { transactionService } from "@/services/transaction.service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters: Record<string, unknown> = {};

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const categoryId = searchParams.get("categoryId");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");

    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (categoryId) filters.categoryId = parseInt(categoryId);
    if (type) filters.type = type;
    if (search) filters.search = search;
    if (page) filters.page = parseInt(page);
    if (pageSize) filters.pageSize = parseInt(pageSize);

    const result = await transactionService.getAll(filters);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch transactions", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: "File too large. Max 10MB." }, { status: 400 });
    }

    const content = await file.text();
    const imported = await transactionService.importCsv(content);

    return Response.json({ imported, message: `Imported ${imported} transactions` });
  } catch (error) {
    return Response.json(
      { error: "Failed to import CSV", details: (error as Error).message },
      { status: 500 }
    );
  }
}
