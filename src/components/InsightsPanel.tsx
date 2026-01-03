import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function InsightsPanel() {
  const insights = useQuery(api.insights.getInsights);
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const markAsRead = useMutation(api.insights.markInsightAsRead);
  const markAllAsRead = useMutation(api.insights.markAllAsRead);
  const generateInsights = useAction(api.insights.generateInsights);
  const deleteAllInsights = useMutation(api.insights.deleteAllInsights);

  const handleGenerateInsights = () => {
    if (!loggedInUser) return;

    toast.promise(generateInsights({ userId: loggedInUser._id }), {
      loading: "Analyzing your financial data...",
      success: "New insights generated!",
      error: (err) => {
        const message = err?.message || "";

        if (message.includes("No Transactions Found")) {
          return "No Transactions Found.";
        }

        // Return cleaned message or fallback
        return message || "Failed to generate insights";
      },
    });
  };

  const handleMarkAsRead = (insightId: string) => {
    toast.promise(markAsRead({ insightId: insightId as any }), {
      loading: "Marking as read...",
      success: "Marked as read!",
      error: "Failed to mark insight as read",
    });
  };

  const handleMarkAllAsRead = () => {
    toast.promise(markAllAsRead(), {
      loading: "Marking all as read...",
      success: (result) => `Marked ${result.count} insights as read!`,
      error: (err) => {
        return err?.message?.includes("No unread insights")
          ? err?.message?.split("Error:")[1].split("at")[0] ||
              "Failed to mark all as read."
          : err?.message || "Failed to mark all as read 2.";
      },
    });
  };

  const handleDeleteAll = () => {
    // Optional: Confirm before delete
    if (
      !confirm(
        `Are you sure you want to delete all insights? This cannot be undone.`
      )
    )
      return;

    toast.promise(deleteAllInsights(), {
      loading: "Deleting insights...",
      success: (res) => res.message,
      error: (err) => err?.message || "Failed to delete insights",
    });
    // const result = await deleteAllInsights();

    // if (!result.success) {
    //   toast.info(result.message);
    //   return;
    // }

    // toast.success(`Deleted ${result.count} insights!`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-yellow-200 bg-yellow-50";
      case "low":
        return "border-emerald-200 bg-emerald-50";
      default:
        return "border-slate-200 bg-slate-50";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return "🚨";
      case "medium":
        return "⚠️";
      case "low":
        return "💡";
      default:
        return "ℹ️";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "spending_pattern":
        return "📊";
      case "budget_alert":
        return "🎯";
      case "savings_tip":
        return "💰";
      case "anomaly":
        return "🔍";
      default:
        return "💡";
    }
  };

  if (insights === undefined) {
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
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI Insights</h2>
          <p className="text-slate-600">
            Personalized financial analysis and recommendations
          </p>
        </div>
        <div>
          <button
            onClick={handleMarkAllAsRead}
            //   className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Mark all as Read
          </button>
          <button
            onClick={handleGenerateInsights}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors font-medium"
          >
            🧠 Generate New Insights
          </button>
        </div>
      </div>

      {/* Insights List */}
      {insights.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 text-center">
          <div className="text-slate-400 text-4xl mb-4">🧠</div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No insights yet
          </h3>
          <p className="text-slate-600 mb-4">
            Add some transactions and budgets, then generate AI-powered insights
            to understand your spending patterns and get personalized
            recommendations.
          </p>
          <button
            onClick={handleGenerateInsights}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors font-medium"
          >
            Generate Your First Insights
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight._id}
              className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                insight.isRead
                  ? "bg-white border-slate-200 opacity-75"
                  : getPriorityColor(insight.priority)
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getTypeIcon(insight.type)}</span>
                    <span className="text-lg">
                      {getPriorityIcon(insight.priority)}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {insight.title}
                    </h3>
                    {!insight.isRead && (
                      <span className="px-2 py-1 bg-emerald-600 text-white text-xs rounded-full">
                        New
                      </span>
                    )}
                  </div>

                  <p className="text-slate-700 leading-relaxed mb-3">
                    {insight.description}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <span className="capitalize">
                      {insight.type.replace("_", " ")}
                    </span>
                    <span>•</span>
                    <span className="capitalize">
                      {insight.priority} priority
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(insight._creationTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {!insight.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(insight._id)}
                    className="ml-4 px-3 py-1 text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {insights && insights.length > 0 && (
        <button
          onClick={handleDeleteAll}
          className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors"
        >
          {/* <Trash2 className="h-4 w-4" /> */}
          Delete All Insights
        </button>
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-lg border border-emerald-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          💡 About AI Insights
        </h3>
        <p className="text-slate-700 text-sm leading-relaxed">
          Our AI analyzes your spending patterns, budget performance, and
          financial behavior to provide personalized recommendations. Insights
          are generated based on your transaction history and can help you
          identify opportunities to save money, optimize your budget, and
          achieve your financial goals faster.
        </p>
      </div>
    </div>
  );
}
