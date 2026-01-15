import { createContext, useState, ReactNode } from "react";

interface DateFilter {
  type:
    | "this_month"
    | "last_month"
    | "last_3_months"
    | "last_6_months"
    | "custom"
    | "all_time";
  customStart?: string;
  customEnd?: string;
}

interface DateRange {
  startDate: string | undefined;
  endDate: string | undefined;
}

interface DateFilterContextType {
  filter: DateFilter;
  setFilter: (filter: DateFilter) => void;
  dateRange: DateRange;
  getMonthString: () => string;
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(
  undefined
);

export function DateFilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<DateFilter>({ type: "this_month" });

  const getDateRange = (): DateRange => {
    const now = new Date();

    switch (filter.type) {
      case "this_month": {
        const year = now.getFullYear();
        // const month = String(now.getMonth() + 1).padStart(2, "0");
        const lastDay = new Date(year, now.getMonth() + 1, 0);
        return {
          startDate: `${now.toISOString().substring(0, 7)}-01T00:00:00.000Z`,
          endDate: `${lastDay.toISOString().split("T")[0]}T23:59:59.999Z`,
        };
      }

      case "last_month": {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const year = lastMonth.getFullYear();
        // const month = String(lastMonth.getMonth() + 1).padStart(2, "0");
        const lastDay = new Date(year, lastMonth.getMonth() + 1, 0);
        return {
          startDate: `${lastMonth.toISOString().substring(0, 7)}-01T00:00:00.000Z`,
          endDate: `${lastDay.toISOString().split("T")[0]}T23:59:59.999Z`,
        };
      }

      case "last_3_months": {
        const threeMonthsAgo = new Date(
          now.getFullYear(),
          now.getMonth() - 2,
          1
        );
        // const year = threeMonthsAgo.getFullYear();
        // const month = String(threeMonthsAgo.getMonth() + 1).padStart(2, "0");
        const endYear = now.getFullYear();
        // const endMonth = String(now.getMonth() + 1).padStart(2, "0");
        const endDay = new Date(endYear, now.getMonth() + 1, 0);
        return {
          startDate: `${threeMonthsAgo.toISOString().substring(0, 7)}-01T00:00:00.000Z`,
          endDate: `${endDay.toISOString().split("T")[0]}T23:59:59.999Z`,
        };
      }

      case "last_6_months": {
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        // const year = sixMonthsAgo.getFullYear();
        // const month = String(sixMonthsAgo.getMonth() + 1).padStart(2, "0");
        const endYear = now.getFullYear();
        // const endMonth = String(now.getMonth() + 1).padStart(2, "0");
        const endDay = new Date(endYear, now.getMonth() + 1, 0);
        return {
          startDate: `${sixMonthsAgo.toISOString().substring(0, 7)}-01T00:00:00.000Z`,
          endDate: `${endDay.toISOString().split("T")[0]}T23:59:59.999Z`,
        };
      }

      case "custom":
        return {
          startDate: filter.customStart || undefined,
          endDate: filter.customEnd || undefined,
        };

      case "all_time":
      default:
        return {
          startDate: undefined,
          endDate: undefined,
        };
    }
  };

  const getMonthString = (): string => {
    if (filter.type === "this_month") {
      const now = new Date().toISOString();
      return now.substring(0, 7);
    }
    if (filter.type === "last_month") {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return lastMonth.toISOString().substring(0, 7);
      //   return `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;
    }
    const now = new Date();
    return now.toISOString().substring(0, 7);
  };

  return (
    <DateFilterContext.Provider
      value={{
        filter,
        setFilter,
        dateRange: getDateRange(),
        getMonthString,
      }}
    >
      {children}
    </DateFilterContext.Provider>
  );
}

export { DateFilterContext };
