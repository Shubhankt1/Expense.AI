import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorUtils";

export function SavingsGoals() {
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
    category: "",
  });

  const savingsGoals = useQuery(api.savings.getSavingsGoals);
  const createSavingsGoal = useMutation(api.savings.createSavingsGoal);
  const updateSavingsProgress = useMutation(api.savings.updateSavingsProgress);

  const categories = [
    "Emergency Fund",
    "Vacation",
    "Home Down Payment",
    "Car Purchase",
    "Education",
    "Retirement",
    "Investment",
    "Other",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newGoal.name ||
      !newGoal.targetAmount ||
      !newGoal.targetDate ||
      !newGoal.category
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createSavingsGoal({
        name: newGoal.name,
        targetAmount: parseFloat(newGoal.targetAmount),
        targetDate: newGoal.targetDate,
        category: newGoal.category,
      });

      toast.success("Savings goal created successfully");
      setNewGoal({ name: "", targetAmount: "", targetDate: "", category: "" });
      setShowForm(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error("Failed to create savings goal:", error);
    }
  };

  const handleAddMoney = async (goalId: string, amount: string) => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await updateSavingsProgress({ goalId: goalId as any, amount: amountNum });
      toast.success("Progress updated successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error("Failed to update progress:", error);
    }
  };

  if (savingsGoals === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Savings Goals</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors font-medium"
        >
          {showForm ? "Cancel" : "+ New Goal"}
        </button>
      </div>

      {/* New Goal Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Create New Savings Goal
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Emergency Fund"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Target Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newGoal.targetAmount}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, targetAmount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newGoal.category}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, category: e.target.value })
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
                  Target Date
                </label>
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, targetDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors font-medium"
            >
              Create Goal
            </button>
          </form>
        </div>
      )}

      {/* Goals List */}
      {savingsGoals.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 text-center">
          <div className="text-slate-400 text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No savings goals yet
          </h3>
          <p className="text-slate-600 mb-4">
            Create your first savings goal to start tracking your progress
            toward financial milestones.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors font-medium"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savingsGoals.map((goal) => (
            <SavingsGoalCard
              key={goal._id}
              goal={goal}
              onAddMoney={handleAddMoney}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SavingsGoalCard({
  goal,
  onAddMoney,
}: {
  goal: any;
  onAddMoney: (goalId: string, amount: string) => void;
}) {
  const [addAmount, setAddAmount] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = () => {
    onAddMoney(goal._id, addAmount);
    setAddAmount("");
    setShowAddForm(false);
  };

  const daysLeft = Math.ceil(
    (new Date(goal.targetDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{goal.name}</h3>
          <p className="text-sm text-slate-600">{goal.category}</p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            daysLeft > 30
              ? "bg-emerald-100 text-emerald-800"
              : daysLeft > 0
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {daysLeft > 0 ? `${daysLeft} days left` : "Overdue"}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">Progress</span>
          <span className="text-sm text-slate-600">
            ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div
            className="h-3 bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(goal.progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2 text-sm">
          <span className="text-emerald-600 font-medium">
            {goal.progress.toFixed(1)}% complete
          </span>
          <span className="text-slate-500">
            ${goal.remaining.toFixed(2)} remaining
          </span>
        </div>
      </div>

      {showAddForm ? (
        <div className="space-y-3">
          <input
            type="number"
            step="0.01"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Amount to add"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleAdd}
              className="flex-1 py-2 px-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              Add Money
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2 text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-2 px-4 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors font-medium"
        >
          + Add Money
        </button>
      )}
    </div>
  );
}
