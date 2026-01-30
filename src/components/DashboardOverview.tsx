import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SpendingChart } from "./SpendingChart";
import { TransactionList } from "./TransactionList";
import { useDateFilter } from "@/hooks/useDateFilter";
import { getCurrentMonth, isoToMonthString } from "@/lib/dateUtils";

/**
 * StatCard component - extracted to reduce duplication
 */
function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <h3 className="text-sm font-medium text-slate-600 mb-2">{title}</h3>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

/**
 * DashboardOverview - Encapsulates overview tab with its own queries
 * Loads data lazily when tab is active
 */
export function DashboardOverview() {
  const { dateRange } = useDateFilter();

  const month = useMemo(
    () => isoToMonthString(dateRange.startDate || getCurrentMonth()),
    [dateRange.startDate],
  );

  // Queries scoped to overview tab
  const transactions = useQuery(api.transactions.getTransactions, {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const spendingByCategory = useQuery(api.transactions.getSpendingByCategory, {
    month,
  });

  const budgetStatus = useQuery(api.budgets.getBudgetStatus, { month });
  const savingsGoals = useQuery(api.savings.getSavingsGoals);
  const insights = useQuery(api.insights.getInsights);

  // Show loading state only for this tab
  if (
    transactions === undefined ||
    spendingByCategory === undefined ||
    budgetStatus === undefined
  ) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="This Month"
          value={`$${budgetStatus?.totalSpent?.toFixed(2) || "0.00"}`}
          subtitle={`of $${budgetStatus?.totalBudget?.toFixed(2) || "0.00"} budgeted`}
        />
        <StatCard
          title="Remaining Budget"
          value={`$${budgetStatus?.totalRemaining?.toFixed(2) || "0.00"}`}
          subtitle="Available to spend"
        />
        <StatCard
          title="Savings Goals"
          value={String(savingsGoals?.length || 0)}
          subtitle="Active goals"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SpendingChart data={spendingByCategory || []} />
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Recent Transactions
          </h3>
          <TransactionList transactions={transactions?.slice(0, 5) || []} />
        </div>
      </div>

      {/* AI Insights Preview */}
      {insights && insights.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-lg border border-emerald-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            💡 Latest Insight
          </h3>
          <div className="bg-white p-4 rounded-md">
            <h4 className="font-medium text-slate-900">{insights[0].title}</h4>
            <p className="text-sm text-slate-600 mt-1">
              {insights[0].description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
