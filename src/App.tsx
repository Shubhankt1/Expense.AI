import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./components/SignInForm";
import { SignOutButton } from "./components/SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Authenticated>
        <AppContent />
      </Authenticated>
      <Unauthenticated>
        <LandingPage />
      </Unauthenticated>
      <Toaster />
    </div>
  );
}

function AppContent() {
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
            <span className="text-sm text-slate-600">
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

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">$</span>
            </div>
            <h1 className="text-xl font-semibold text-slate-900">FinanceAI</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Smart Financial Management
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              Track expenses, set budgets, and get AI-powered insights to
              achieve your financial goals.
            </p>
            <div className="grid grid-cols-1 gap-4 text-sm text-slate-600 mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>AI-powered spending analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Smart budget tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Savings goal management</span>
              </div>
            </div>
          </div>
          <SignInForm />
        </div>
      </main>
    </div>
  );
}
