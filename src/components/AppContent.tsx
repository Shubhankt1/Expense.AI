import { useQuery } from "convex/react";
import { SignOutButton } from "./SignOutButton";
import { api } from "../../convex/_generated/api";
import { Dashboard } from "./Dashboard";

export function AppContent() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">$</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-900">FinanceAI</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600 max-w-[150px] md:max-w-none truncate">
              `{loggedInUser?.email} | {loggedInUser?._id}`
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <Dashboard />
    </div>
  );
}
