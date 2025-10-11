interface SpendingData {
  category: string;
  amount: number;
}

interface SpendingChartProps {
  data: SpendingData[];
}

export function SpendingChart({ data }: SpendingChartProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  
  const colors = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-green-500",
  ];

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Spending by Category</h3>
        <div className="text-center py-8 text-slate-500">
          <p>No spending data available for this month.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Spending by Category</h3>
      
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = (item.amount / total) * 100;
          return (
            <div key={item.category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">{item.category}</span>
                <span className="text-sm text-slate-600">${item.amount.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${colors[index % colors.length]}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="text-xs text-slate-500">{percentage.toFixed(1)}%</div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-900">Total Spending</span>
          <span className="font-semibold text-slate-900">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
