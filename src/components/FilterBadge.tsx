import { useDateFilter } from "../hooks/useDateFilter";

export function FilterBadge() {
  const { filter } = useDateFilter();

  // Don't show badge for custom (single month view via slider)
  if (filter.type === "custom") return null;

  const labels = {
    last_3_months: "📊 Viewing: Last 3 Months",
    last_6_months: "📊 Viewing: Last 6 Months",
    all_time: "📊 Viewing: All Time",
  };

  const label = labels[filter.type as keyof typeof labels];
  if (!label) return null;

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-3xl text-sm font-medium text-blue-700">
      {label}
    </div>
  );
}
