import { dateToMonthLocaleString, formatDate } from "@/lib/dateUtils";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { DeleteButton } from "./DeleteButton";

interface Transaction {
  _id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: "income" | "expense";
  _creationTime: number;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const deleteTransaction = useMutation(api.transactions.deleteTransactionTask);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (transac: Transaction) => {
    if (
      !confirm(
        `Delete transaction?\n${transac.description}: $${transac.amount}.\n\n` +
          `Deleting will recalculate your budget:\n${transac.category}:${dateToMonthLocaleString(transac.date)}`
      )
    )
      return;
    setDeletingId(transac._id);
    toast.promise(
      deleteTransaction({ id: transac._id as Id<"transactions"> }).finally(() =>
        setDeletingId(null)
      ),
      {
        success: `Deleted ${transac.description.substring(0, 10)}... of $${transac.amount.toFixed(2)}`,
        error: (error) => {
          const message = error?.message || "";
          const match = message.match(/Uncaught Error: (.+?)(?:\n|at handler)/);
          const cleanError = match
            ? match[1].trim()
            : "Failed to delete transaction";
          return cleanError;
        },
      }
    );
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No transactions yet. Add your first transaction to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction._id}
          className="group flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  transaction.type === "income"
                    ? "bg-emerald-500"
                    : "bg-red-500"
                }`}
              />
              <div>
                <p className="font-medium text-slate-900">
                  {transaction.description}
                </p>
                <p className="text-sm text-slate-500">{transaction.category}</p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p
              className={`font-semibold ${
                transaction.type === "income"
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {transaction.type === "income" ? "+" : "-"}$
              {Math.abs(transaction.amount).toFixed(2)}
            </p>
            <p className="text-sm text-slate-500">
              {formatDate(transaction.date)}
            </p>
          </div>
          <DeleteButton
            onDelete={() => handleDelete(transaction)}
            isDeleting={deletingId === transaction._id}
            className="ml-4"
            itemName="transaction"
          />
        </div>
      ))}
    </div>
  );
}
