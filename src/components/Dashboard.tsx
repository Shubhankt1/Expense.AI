import { useState } from "react";
import { BudgetManager } from "./BudgetManager";
import { SavingsGoals } from "./SavingsGoals";
import { InsightsPanel } from "./InsightsPanel";
import { StatementUpload } from "./StatementUpload";
import { useDateFilter } from "@/hooks/useDateFilter";
import { DateFilterTabs } from "./DateFilterTabs";
import { MonthSlider } from "./MonthSlider";
import { NavigationTab, NavigationTabs } from "./NavigationTabs";
import { DashboardOverview } from "./DashboardOverview";
import { DashboardTransactions } from "./DashboardTransactions";

/**
 * Navigation tab definitions
 */
const NAVIGATION_TABS = Object.freeze([
  new NavigationTab("overview", "Overview", "📊"),
  new NavigationTab("transactions", "Transactions", "💳"),
  new NavigationTab("upload", "Upload Statement", "📄"),
  new NavigationTab("budgets", "Budgets", "🎯"),
  new NavigationTab("savings", "Savings", "💰"),
  new NavigationTab("insights", "Insights", "🧠"),
]);

/**
 * Tab configuration mapping tab IDs to components
 */
const TAB_CONFIG: Record<string, React.FC> = {
  overview: DashboardOverview,
  transactions: DashboardTransactions,
  upload: StatementUpload,
  budgets: BudgetManager,
  savings: SavingsGoals,
  insights: InsightsPanel,
};

/**
 * Dashboard - Lightweight router managing navigation and tab content
 * Individual tabs manage their own data fetching and loading states
 */
export function Dashboard() {
  useDateFilter(); // Keep provider context active

  const [activeTab, setActiveTab] = useState("overview");

  const ActiveComponent = TAB_CONFIG[activeTab] || DashboardOverview;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Navigation */}
      <NavigationTabs
        tabs={NAVIGATION_TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Date Filter Section */}
      <div className="mb-6 space-y-3">
        {/* Desktop: Slider left, Tabs right */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MonthSlider />
          </div>
          <DateFilterTabs />
        </div>
      </div>

      {/* Active Tab Content */}
      <ActiveComponent />
    </div>
  );
}
