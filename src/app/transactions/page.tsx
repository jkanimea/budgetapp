"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Skeleton } from "primereact/skeleton";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Chip } from "primereact/chip";
import { Paginator } from "primereact/paginator";
import { Navigation } from "@/components/Navigation";

interface Transaction {
  id: number; type: string; details: string | null;
  particulars: string | null; amount: number; date: string;
  category: { name: string; color: string | null } | null;
}

const TYPE_OPTIONS = [
  { label: "All Types", value: "" },
  { label: "Eft-Pos", value: "Eft-Pos" },
  { label: "Direct Debit", value: "Direct Debit" },
  { label: "Direct Credit", value: "Direct Credit" },
  { label: "Deposit", value: "Deposit" },
  { label: "Payment", value: "Payment" },
  { label: "Transfer", value: "Transfer" },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(0);
  const [first, setFirst] = useState(0);
  const pageSize = 50;
  const toast = useRef<Toast>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (typeFilter) params.set("type", typeFilter);
      params.set("page", String(page + 1));
      params.set("pageSize", String(pageSize));

      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const d = await res.json();
      setTransactions(d.transactions || []);
      setTotal(d.total || 0);
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Error", detail: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const onSearchChange = (val: string) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      setFirst(0);
    }, 300);
  };

  const onPageChange = (e: { first: number; page: number }) => {
    setFirst(e.first);
    setPage(e.page);
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(Math.abs(n));

  const amountBody = (row: Transaction) => (
    <span className={row.amount < 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
      {fmt(row.amount)}
    </span>
  );

  const dateBody = (row: Transaction) =>
    new Date(row.date).toLocaleDateString("en-NZ", {
      day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
    });

  const categoryBody = (row: Transaction) =>
    row.category ? <Chip label={row.category.name} /> : null;

  const descBody = (row: Transaction) => row.details || row.particulars || "-";

  return (
    <div>
      <Navigation />
      <Toast ref={toast} />
      <main className="max-w-7xl mx-auto p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Transactions</h1>
          <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {total} total
          </span>
        </div>

        <div className="flex gap-3 items-center">
          <span className="flex-1 relative">
            <i className="pi pi-search absolute" style={{ left: "12px", top: "10px", fontSize: "14px", color: "#94a3b8" }} />
            <InputText
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10"
            />
          </span>
          <Dropdown
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.value); setPage(0); setFirst(0); }}
            options={TYPE_OPTIONS}
            className="w-48"
          />
        </div>

        <Card>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} height="2.5rem" />)}
            </div>
          ) : (
            <>
              <DataTable
                value={transactions}
                size="small"
                stripedRows
                sortField="date"
                sortOrder={-1}
                emptyMessage="No transactions found"
              >
                <Column field="date" header="Date" body={dateBody} sortable style={{ width: "140px" }} />
                <Column header="Description" body={descBody} sortable style={{ minWidth: "200px" }} />
                <Column field="type" header="Type" sortable style={{ width: "120px" }} />
                <Column header="Category" body={categoryBody} style={{ width: "160px" }} />
                <Column field="amount" header="Amount" body={amountBody} sortable style={{ width: "130px" }} />
              </DataTable>
              <Paginator
                first={first}
                rows={pageSize}
                totalRecords={total}
                onPageChange={onPageChange}
              />
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
