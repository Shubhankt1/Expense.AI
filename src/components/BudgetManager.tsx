import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { DeleteButton } from "./DeleteButton";
import { Id } from "../../convex/_generated/dataModel";

interface Budget {
  id: Id<"budgets">;
  category: string;
  month: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export function BudgetManager() {
  const categories = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Other",
  ];

  const [newBudget, setNewBudget] = useState({
    category: "",
    monthlyLimit: "",
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const currentMonth = new Date().toISOString().substring(0, 7);
  const budgetStatus = useQuery(api.budgets.getBudgetStatus, {
    month: currentMonth,
  });
  const setBudget = useMutation(api.budgets.setBudget);
  const deleteBudget = useMutation(api.budgets.deleteBudgetMutation);

  const handleDelete = async (budget: Budget) => {
    if (
      !confirm(
        `Delete Budget for category "${budget.category}" for the month of ${budget.month}?`
      )
    )
      return;
    setDeletingId(budget.id);
    toast.promise(
      deleteBudget({ budgetId: budget.id }).finally(() => setDeletingId(null)),
      {
        success: `Deleted budget category "${budget.category}" for the month of ${budget.month}`,
        error: (error) => {
          const message = error?.message || "";
          const match = message.match(/Uncaught Error: (.+?)(?:\n|at handler)/);
          const cleanError = match
            ? match[1].trim()
            : "Failed to delete budget";
          return cleanError;
        },
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newBudget.category || !newBudget.monthlyLimit) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const resp = await setBudget({
        category: newBudget.category,
        monthlyLimit: parseFloat(newBudget.monthlyLimit),
        month: currentMonth,
      });
      if (resp.operation === "delete")
        toast.success("Budget deleted successfully");
      else toast.success("Budget updated successfully");
      setNewBudget({ category: "", monthlyLimit: "" });
    } catch (error) {
      toast.error("Failed to update budget");
      throw error;
    }
  };

  if (budgetStatus === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Budget Overview -{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">Total Budget</p>
            <p className="text-2xl font-bold text-slate-900">
              ${budgetStatus.totalBudget.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">Total Spent</p>
            <p className="text-2xl font-bold text-red-600">
              ${budgetStatus.totalSpent.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">Remaining</p>
            <p className="text-2xl font-bold text-emerald-600">
              ${(budgetStatus?.totalRemaining ?? 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">
              Overall Progress
            </span>
            <span className="text-sm text-slate-600">
              {budgetStatus.totalBudget > 0
                ? (
                    (budgetStatus.totalSpent / budgetStatus.totalBudget) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${
                budgetStatus.totalSpent > budgetStatus.totalBudget
                  ? "bg-red-500"
                  : "bg-emerald-500"
              }`}
              style={{
                width: `${Math.min((budgetStatus.totalSpent / budgetStatus.totalBudget) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Category Budgets */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Category Budgets
        </h3>

        {budgetStatus.categories.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            No budgets set yet. Create your first budget below!
          </p>
        ) : (
          <div className="space-y-4">
            {budgetStatus.categories.map((budget) => (
              <div
                key={budget.category}
                className="group border border-slate-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-slate-900">
                    {budget.category}
                  </h4>
                  <div className="flex items-center">
                    <span className="text-sm text-slate-600">
                      ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                    </span>
                    <div className="w-5 md:w-0 md:group-hover:w-4 overflow-visible">
                      <DeleteButton
                        onDelete={() => handleDelete(budget)}
                        isDeleting={deletingId === budget.id}
                        itemName="budget"
                        size="md"
                        className="md:translate-x-2 md:group-hover:translate-x-0 transition-all duration-200 ease-out"
                      />
                    </div>
                    {/* <DeleteButton
                      onDelete={() => {
                        console.log("deleted");
                      }}
                      isDeleting={false}
                      itemName="Budget"
                    /> */}
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${
                      budget.percentage > 100
                        ? "bg-red-500"
                        : budget.percentage > 80
                          ? "bg-yellow-500"
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span
                    className={`${
                      budget.remaining < 0 ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {budget.remaining < 0 ? "Over budget by" : "Remaining:"} $
                    {Math.abs(budget.remaining).toFixed(2)}
                  </span>
                  <span className="text-slate-500">
                    {budget.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Budget */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Set Budget
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={newBudget.category}
                onChange={(e) =>
                  setNewBudget({ ...newBudget, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Monthly Limit
              </label>
              <input
                type="number"
                step="0.01"
                value={newBudget.monthlyLimit}
                onChange={(e) =>
                  setNewBudget({ ...newBudget, monthlyLimit: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors font-medium"
          >
            Set Budget
          </button>
        </form>
      </div>
      <div className="h-16" />
    </div>
  );
}
