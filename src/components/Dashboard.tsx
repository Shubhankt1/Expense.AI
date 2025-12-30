import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TransactionForm } from "./TransactionForm";
import { BudgetManager } from "./BudgetManager";
import { SavingsGoals } from "./SavingsGoals";
import { SpendingChart } from "./SpendingChart";
import { InsightsPanel } from "./InsightsPanel";
import { TransactionList } from "./TransactionList";
import { StatementUpload } from "./StatementUpload";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const currentMonth = new Date().toISOString().substring(0, 7);

  const transactions = useQuery(api.transactions.getTransactions, {
    limit: 10,
  });
  const spendingByCategory = useQuery(api.transactions.getSpendingByCategory, {
    month: currentMonth,
  });
  const monthlyTrends = useQuery(api.transactions.getMonthlyTrends, {
    months: 6,
  });
  const budgetStatus = useQuery(api.budgets.getBudgetStatus, {
    month: currentMonth,
  });
  const savingsGoals = useQuery(api.savings.getSavingsGoals);
  const insights = useQuery(api.insights.getInsights);

  //   console.log({
  //     transactions,
  //     spendingByCategory,
  //     monthlyTrends,
  //     budgetStatus,
  //     savingsGoals,
  //     insights,
  //   });

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "transactions", label: "Transactions", icon: "💳" },
    { id: "upload", label: "Upload Statement", icon: "📄" },
    { id: "budgets", label: "Budgets", icon: "🎯" },
    { id: "savings", label: "Savings", icon: "💰" },
    { id: "insights", label: "Insights", icon: "🧠" },
  ];

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
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-slate-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-sm font-medium text-slate-600 mb-2">
                This Month
              </h3>
              <div className="text-2xl font-bold text-slate-900">
                ${budgetStatus?.totalSpent?.toFixed(2) || "0.00"}
              </div>
              <p className="text-sm text-slate-500">
                of ${budgetStatus?.totalBudget?.toFixed(2) || "0.00"} budgeted
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-sm font-medium text-slate-600 mb-2">
                Remaining Budget
              </h3>
              <div className="text-2xl font-bold text-emerald-600">
                ${budgetStatus?.totalRemaining?.toFixed(2) || "0.00"}
              </div>
              <p className="text-sm text-slate-500">Available to spend</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h3 className="text-sm font-medium text-slate-600 mb-2">
                Savings Goals
              </h3>
              <div className="text-2xl font-bold text-blue-600">
                {savingsGoals?.length || 0}
              </div>
              <p className="text-sm text-slate-500">Active goals</p>
            </div>
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
                <h4 className="font-medium text-slate-900">
                  {insights[0].title}
                </h4>
                <p className="text-sm text-slate-600 mt-1">
                  {insights[0].description}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="space-y-6">
          <TransactionForm />
          <TransactionList transactions={transactions || []} />
        </div>
      )}

      {activeTab === "upload" && <StatementUpload />}
      {activeTab === "budgets" && <BudgetManager />}
      {activeTab === "savings" && <SavingsGoals />}
      {activeTab === "insights" && <InsightsPanel />}
    </div>
  );
}
