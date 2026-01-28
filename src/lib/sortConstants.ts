export type SortOption = {
  id: string;
  label: string;
};

export const SORT_OPTIONS: SortOption[] = [
  { id: "date-desc", label: "Latest" },
  { id: "date-asc", label: "Oldest" },
  { id: "amount-desc", label: "Amount: High to Low" },
  { id: "amount-asc", label: "Amount: Low to High" },
];
