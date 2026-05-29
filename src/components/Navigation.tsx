"use client";

import { useRouter, usePathname } from "next/navigation";
import { Menubar } from "primereact/menubar";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "pi pi-chart-bar", href: "/" },
  { label: "Import CSV", icon: "pi pi-upload", href: "/upload" },
  { label: "Transactions", icon: "pi pi-credit-card", href: "/transactions" },
  { label: "Budget", icon: "pi pi-bullseye", href: "/budget" },
];

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    {
      label: "BudgetApp",
      icon: "pi pi-calculator",
      className: "font-bold text-white text-xl",
      command: () => router.push("/"),
    },
    ...NAV_ITEMS.map((item) => ({
      label: item.label,
      icon: item.icon,
      className: pathname === item.href ? "p-menuitem-active" : "",
      command: () => router.push(item.href),
    })),
  ];

  return <Menubar model={items} />;
}
