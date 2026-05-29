


import { dashboardService } from "@/services/dashboard.service";

export async function GET() {
  try {
    const data = await dashboardService.getDashboardData();
    return Response.json({ data });
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch dashboard data", details: (error as Error).message },
      { status: 500 }
    );
  }
}
