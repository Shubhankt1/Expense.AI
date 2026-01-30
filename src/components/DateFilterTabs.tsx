import { useDateFilter } from "../hooks/useDateFilter";
import { useState } from "react";

export function DateFilterTabs() {
  const { filter, setFilter } = useDateFilter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const tabs = [
    { id: "last_3_months", label: "Last 3 Months" },
    { id: "last_6_months", label: "Last 6 Months" },
    { id: "all_time", label: "All Time" },
  ] as const;

  const handleTabClick = (tabId: (typeof tabs)[number]["id"]) => {
    setFilter({ type: tabId });
    setIsDropdownOpen(false);
  };

  return (
    <>
      {/* Desktop: Regular tabs */}
      <div className="hidden md:block">
        <div className="inline-flex gap-2 bg-white border border-slate-200 rounded-3xl p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
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

      {/* Mobile: Dropdown menu */}
      <div className="md:hidden relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 rounded-3xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <svg
            className="h-4 w-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          Filters
        </button>

        {/* Dropdown */}
        {isDropdownOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsDropdownOpen(false)}
            />

            {/* Menu */}
            <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden mx-auto max-w-[12rem]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    filter.type === tab.id
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
