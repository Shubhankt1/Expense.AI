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
          className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                transaction.type === "income" ? "bg-emerald-500" : "bg-red-500"
              }`} />
              <div>
                <p className="font-medium text-slate-900">{transaction.description}</p>
                <p className="text-sm text-slate-500">{transaction.category}</p>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className={`font-semibold ${
              transaction.type === "income" ? "text-emerald-600" : "text-red-600"
            }`}>
              {transaction.type === "income" ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
            </p>
            <p className="text-sm text-slate-500">
              {new Date(transaction.date).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
