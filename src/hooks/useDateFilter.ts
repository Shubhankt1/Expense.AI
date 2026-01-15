import { useContext } from "react";
import { DateFilterContext } from "../contexts/DateFilterContext";

export function useDateFilter() {
  const context = useContext(DateFilterContext);
  if (!context) {
    throw new Error("useDateFilter must be used within DateFilterProvider");
  }
  return context;
}
