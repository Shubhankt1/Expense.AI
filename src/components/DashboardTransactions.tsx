import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";
import { useDateFilter } from "@/hooks/useDateFilter";

/**
 * DashboardTransactions - Tab component for transaction management
 * Manages its own data fetching
 */
export function DashboardTransactions() {
  const { dateRange } = useDateFilter();

  const transactions = useQuery(api.transactions.getTransactions, {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  if (transactions === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TransactionForm />
      <TransactionList transactions={transactions || []} />
    </div>
  );
}
