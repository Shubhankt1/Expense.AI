import {
  dateToMonthLocaleString,
  getCurrentMonth,
  getMonthEndISO,
  getMonthStartISO,
} from "@/lib/dateUtils";
import { useDateFilter } from "../hooks/useDateFilter";
import { useState, useEffect } from "react";

export function MonthSlider() {
  const { filter, setFilter } = useDateFilter();
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  // Generate available months
  useEffect(() => {
    const months: string[] = [];
    const now = new Date();

    // Generate last 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.push(monthStr);
    }

    setAvailableMonths(months);
  }, []);

  // Sync slider with filter changes
  useEffect(() => {
    if (!availableMonths.length) return;

    if (filter.type === "last_3_months") {
      // Jump to 3 months ago
      setCurrentMonthIndex(2);
    } else if (filter.type === "last_6_months") {
      // Jump to 6 months ago
      setCurrentMonthIndex(5);
    } else if (filter.type === "all_time") {
      // Show current month in slider
      setCurrentMonthIndex(0);
    } else if (filter.type === "custom" && filter.customStart) {
      // Find the month in available months
      const month = filter.customStart.substring(0, 7);
      const index = availableMonths.indexOf(month);
      if (index !== -1) {
        setCurrentMonthIndex(index);
      }
    }
  }, [filter, availableMonths]);

  const handlePrevMonth = () => {
    if (currentMonthIndex >= availableMonths.length - 1) return;

    const newIndex = currentMonthIndex + 1;
    setCurrentMonthIndex(newIndex);
    const month = availableMonths[newIndex];

    setFilter({
      type: "custom",
      customStart: getMonthStartISO(month),
      customEnd: getMonthEndISO(month),
    });
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 0) return;

    const newIndex = currentMonthIndex - 1;
    setCurrentMonthIndex(newIndex);
    const month = availableMonths[newIndex];

    setFilter({
      type: "custom",
      customStart: getMonthStartISO(month),
      customEnd: getMonthEndISO(month),
    });
  };

  const handleToday = () => {
    setCurrentMonthIndex(0);
    const currentMonth = getCurrentMonth();
    setFilter({
      type: "custom",
      customStart: getMonthStartISO(currentMonth),
      customEnd: getMonthEndISO(currentMonth),
    });
  };

  const isCurrentMonth = currentMonthIndex === 0;

  if (availableMonths.length === 0) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-3xl px-3 py-2">
        <button
          onClick={handlePrevMonth}
          disabled={currentMonthIndex >= availableMonths.length - 1}
          className="p-1 text-slate-600 hover:text-slate-900 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
          title="Previous month"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <span className="text-sm font-medium text-slate-900 min-w-[140px] text-center">
          {dateToMonthLocaleString(availableMonths[currentMonthIndex])}
        </span>

        <button
          onClick={handleNextMonth}
          disabled={currentMonthIndex === 0}
          className="p-1 text-slate-600 hover:text-slate-900 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
          title="Next month"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Today Button - Hidden when current month */}
      {!isCurrentMonth && (
        <button
          onClick={handleToday}
          className="px-5 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-3xl hover:bg-emerald-100 transition-colors"
        >
          Jump to Today
        </button>
      )}
    </div>
  );
}
