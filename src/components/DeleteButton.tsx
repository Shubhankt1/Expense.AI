interface DeleteButtonProps {
  onDelete: () => void | Promise<void>;
  isDeleting: boolean;
  itemName?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function DeleteButton({
  onDelete,
  isDeleting,
  itemName = "item",
  className = "",
  size = "md",
}: DeleteButtonProps) {
  const sizeClasses = {
    sm: "p-1",
    md: "p-2",
    lg: "p-3",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const spinnerSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <button
      onClick={onDelete}
      disabled={isDeleting}
      className={`p-1 text-slate-400 hover:text-red-600 rounded-md disabled:opacity-50 md:opacity-0 md:group-hover:opacity-100 ${className}`}
      title={`Delete ${itemName}`}
    >
      {isDeleting ? (
        <div
          className={`animate-spin ${spinnerSizes[size]} border-2 border-red-600 border-t-transparent rounded-full`}
        />
      ) : (
        <svg
          className={iconSizes[size]}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      )}
    </button>
  );
}
