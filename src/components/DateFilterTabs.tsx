import { useDateFilter } from "@/hooks/useDateFilter";

export function DateFilterTabs() {
  const { filter, setFilter } = useDateFilter();

  const tabs = [
    { id: "this_month", label: "This Month" },
    { id: "last_month", label: "Last Month" },
    { id: "last_3_months", label: "Last 3 Months" },
    { id: "last_6_months", label: "Last 6 Months" },
    { id: "all_time", label: "All Time" },
  ] as const;

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-2 bg-white border border-slate-200 rounded-3xl p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter({ type: tab.id })}
            className={`px-3 py-1 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap ${
              filter.type === tab.id
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
