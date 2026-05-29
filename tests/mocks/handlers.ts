import { http, HttpResponse } from "msw";

export const mockDashboardData = {
  data: {
    currentWeek: {
      weekStart: "2024-03-11",
      weekEnd: "2024-03-17",
      totalIncome: 1500,
      totalExpense: 500,
      netSavings: 1000,
      categoryBreakdown: [
        { categoryName: "Groceries", amount: 300, percentage: 60 },
        { categoryName: "Fuel", amount: 200, percentage: 40 },
      ],
    },
    weeklyHistory: [
      { weekStart: "2024-03-11", weekEnd: "2024-03-17", totalIncome: 1500, totalExpense: 500, netSavings: 1000 },
    ],
    topExpenses: [
      { categoryName: "Groceries", amount: 300, percentage: 60 },
    ],
    totalIncome: 50000,
    totalExpense: 20000,
    totalSavings: 30000,
    budgetComparison: [
      { categoryName: "Groceries", budgeted: 50, spent: 30, remaining: 20 },
    ],
  },
};

export const handlers = [
  http.get("*/api/dashboard", () => {
    return HttpResponse.json(mockDashboardData);
  }),
  http.get("*/api/transactions", ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const type = url.searchParams.get("type");
    const transactions = [
      { id: 1, type: "Eft-Pos", amount: -25.50, date: "2024-03-15", details: "New World", particulars: "", code: "", reference: "", foreignCurrencyAmount: null, conversionCharge: null, category: { id: 1, name: "Groceries", color: "#ef4444" } },
      { id: 2, type: "Eft-Pos", amount: -50.00, date: "2024-03-14", details: "BP Connect", particulars: "", code: "", reference: "", foreignCurrencyAmount: null, conversionCharge: null, category: null },
    ];
    let filtered = [...transactions];
    if (search) {
      filtered = filtered.filter((t) =>
        t.details?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (type) {
      filtered = filtered.filter((t) => t.type === type);
    }
    return HttpResponse.json({ transactions: filtered, total: filtered.length });
  }),
  http.post("*/api/transactions", () => {
    return HttpResponse.json({ imported: 3, message: "Imported 3 transactions" });
  }),
  http.get("*/api/categories", () => {
    return HttpResponse.json({
      categories: [
        { id: 1, name: "Groceries", type: "EXPENSE", icon: "🛒", color: "#ef4444" },
        { id: 2, name: "Fuel", type: "EXPENSE", icon: "⛽", color: "#f97316" },
      ],
    });
  }),
  http.get("*/api/weekly-budget", () => {
    return HttpResponse.json({
      budgets: [
        { id: 1, categoryId: 1, weeklyAmount: 50, category: { id: 1, name: "Groceries", type: "EXPENSE", icon: "🛒", color: "#ef4444" } },
      ],
    });
  }),
  http.post("*/api/weekly-budget", () => {
    return HttpResponse.json({ success: true });
  }),
  http.delete("*/api/weekly-budget", () => {
    return HttpResponse.json({ success: true });
  }),
];
