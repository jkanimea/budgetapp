interface CategoryRule {
  name: string;
  type: "INCOME" | "EXPENSE";
}

const MERCHANT_CATEGORY_MAP: Record<string, CategoryRule> = {
  "new world": { name: "Groceries", type: "EXPENSE" },
  "pak n save": { name: "Groceries", type: "EXPENSE" },
  "woolworths": { name: "Groceries", type: "EXPENSE" },
  "countdown": { name: "Groceries", type: "EXPENSE" },
  "four square": { name: "Groceries", type: "EXPENSE" },

  "bp connect": { name: "Fuel", type: "EXPENSE" },
  "bp ": { name: "Fuel", type: "EXPENSE" },
  "z energy": { name: "Fuel", type: "EXPENSE" },
  "caltex": { name: "Fuel", type: "EXPENSE" },
  "gull ": { name: "Fuel", type: "EXPENSE" },

  "propertybrokers": { name: "Rent", type: "EXPENSE" },
  "property bro": { name: "Rent", type: "EXPENSE" },

  "powerco": { name: "Utilities", type: "EXPENSE" },
  "genesis energy": { name: "Utilities", type: "EXPENSE" },
  "mercury energy": { name: "Utilities", type: "EXPENSE" },
  "contact energy": { name: "Utilities", type: "EXPENSE" },
  "trustpower": { name: "Utilities", type: "EXPENSE" },
  "nova energy": { name: "Utilities", type: "EXPENSE" },
  "slingshot": { name: "Utilities", type: "EXPENSE" },
  "spark nz": { name: "Utilities", type: "EXPENSE" },
  "vodafone nz": { name: "Utilities", type: "EXPENSE" },
  "2degrees": { name: "Utilities", type: "EXPENSE" },
  "chorus": { name: "Utilities", type: "EXPENSE" },

  "oxford finance": { name: "Loan Payments", type: "EXPENSE" },
  "mtf finance": { name: "Loan Payments", type: "EXPENSE" },

  "chubb life": { name: "Insurance", type: "EXPENSE" },
  "aai insurance": { name: "Insurance", type: "EXPENSE" },
  "ami insurance": { name: "Insurance", type: "EXPENSE" },
  "state insurance": { name: "Insurance", type: "EXPENSE" },
  "tower insurance": { name: "Insurance", type: "EXPENSE" },
  "vero insurance": { name: "Insurance", type: "EXPENSE" },

  "south end takeaways": { name: "Dining Out", type: "EXPENSE" },
  "benniks poultry": { name: "Dining Out", type: "EXPENSE" },
  "kfc": { name: "Dining Out", type: "EXPENSE" },
  "mcdonald": { name: "Dining Out", type: "EXPENSE" },
  "burger king": { name: "Dining Out", type: "EXPENSE" },
  "pizza hut": { name: "Dining Out", type: "EXPENSE" },
  "subway": { name: "Dining Out", type: "EXPENSE" },
  "domino": { name: "Dining Out", type: "EXPENSE" },
  "hell pizza": { name: "Dining Out", type: "EXPENSE" },

  "laundromat": { name: "Personal Care", type: "EXPENSE" },
  "gb gardens": { name: "Entertainment", type: "EXPENSE" },

  "ird": { name: "Tax", type: "EXPENSE" },
  "inland revenue": { name: "Tax", type: "EXPENSE" },

  "wellington uni": { name: "Income", type: "INCOME" },
  "salary": { name: "Salary", type: "INCOME" },
  "wage": { name: "Salary", type: "INCOME" },

  "w&i benefit": { name: "Government Benefits", type: "INCOME" },
  "working for families": { name: "Government Benefits", type: "INCOME" },
  "winz": { name: "Government Benefits", type: "INCOME" },
  "benefit": { name: "Government Benefits", type: "INCOME" },
};

const DEFAULT_CATEGORY_BY_TYPE: Record<string, CategoryRule> = {
  "Direct Credit": { name: "Income", type: "INCOME" },
  "Deposit": { name: "Income", type: "INCOME" },
  "Eft-Pos": { name: "Shopping", type: "EXPENSE" },
  "Direct Debit": { name: "Bills", type: "EXPENSE" },
  "Payment": { name: "Bills", type: "EXPENSE" },
  "Automatic Payment": { name: "Bills", type: "EXPENSE" },
  "Debit Order": { name: "Bills", type: "EXPENSE" },
  "Fee": { name: "Bank Fees", type: "EXPENSE" },
  "Service Charge": { name: "Bank Fees", type: "EXPENSE" },
  "Atm": { name: "Cash", type: "EXPENSE" },
  "Cash": { name: "Cash", type: "EXPENSE" },
  "Transfer": { name: "Transfers", type: "EXPENSE" },
};

const INCOME_TYPES = new Set(["Direct Credit", "Deposit"]);

export function categorizeTransaction(
  type: string,
  details: string,
  particulars: string
): CategoryRule {
  const searchText = `${particulars} ${details}`.toLowerCase();

  const sortedKeywords = Object.keys(MERCHANT_CATEGORY_MAP).sort(
    (a, b) => b.length - a.length
  );

  for (const keyword of sortedKeywords) {
    if (searchText.includes(keyword)) {
      return MERCHANT_CATEGORY_MAP[keyword];
    }
  }

  if (INCOME_TYPES.has(type)) {
    return { name: "Income", type: "INCOME" };
  }

  return DEFAULT_CATEGORY_BY_TYPE[type] || { name: "Uncategorized", type: "EXPENSE" };
}

export const SEED_CATEGORIES: { name: string; type: string; icon: string; color: string }[] = [
  { name: "Groceries", type: "EXPENSE", icon: "🛒", color: "#ef4444" },
  { name: "Fuel", type: "EXPENSE", icon: "⛽", color: "#f97316" },
  { name: "Rent", type: "EXPENSE", icon: "🏠", color: "#eab308" },
  { name: "Utilities", type: "EXPENSE", icon: "💡", color: "#22c55e" },
  { name: "Loan Payments", type: "EXPENSE", icon: "🏦", color: "#3b82f6" },
  { name: "Insurance", type: "EXPENSE", icon: "🛡️", color: "#8b5cf6" },
  { name: "Dining Out", type: "EXPENSE", icon: "🍔", color: "#ec4899" },
  { name: "Personal Care", type: "EXPENSE", icon: "🧴", color: "#14b8a6" },
  { name: "Entertainment", type: "EXPENSE", icon: "🎬", color: "#f43f5e" },
  { name: "Shopping", type: "EXPENSE", icon: "🛍️", color: "#6366f1" },
  { name: "Bills", type: "EXPENSE", icon: "📄", color: "#a855f7" },
  { name: "Tax", type: "EXPENSE", icon: "💰", color: "#dc2626" },
  { name: "Bank Fees", type: "EXPENSE", icon: "🏧", color: "#78716c" },
  { name: "Cash", type: "EXPENSE", icon: "💵", color: "#84cc16" },
  { name: "Transfers", type: "EXPENSE", icon: "🔄", color: "#06b6d4" },
  { name: "Uncategorized", type: "EXPENSE", icon: "❓", color: "#6b7280" },
  { name: "Income", type: "INCOME", icon: "💼", color: "#22c55e" },
  { name: "Salary", type: "INCOME", icon: "💼", color: "#16a34a" },
  { name: "Government Benefits", type: "INCOME", icon: "🏛️", color: "#059669" },
  { name: "Income - Other", type: "INCOME", icon: "📈", color: "#10b981" },
];
