import type { Metadata } from "next";
import "./globals.css";
import { PrimeReactProvider } from "primereact/api";

export const metadata: Metadata = {
  title: "BudgetApp - Track Your Spending",
  description: "Import bank CSV files, categorize expenses, and manage your weekly budget",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PrimeReactProvider value={{ unstyled: false }}>
          {children}
        </PrimeReactProvider>
      </body>
    </html>
  );
}
