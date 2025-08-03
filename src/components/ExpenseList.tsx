import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, Receipt } from "lucide-react";

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'expense' | 'income';
}

interface ExpenseListProps {
  expenses: Expense[];
  onExpenseClick?: (expense: Expense) => void;
}

const categoryColors: Record<string, string> = {
  "Food & Dining": "bg-orange-100 text-orange-800",
  "Transportation": "bg-blue-100 text-blue-800", 
  "Shopping": "bg-purple-100 text-purple-800",
  "Entertainment": "bg-pink-100 text-pink-800",
  "Bills & Utilities": "bg-red-100 text-red-800",
  "Healthcare": "bg-green-100 text-green-800",
  "Travel": "bg-cyan-100 text-cyan-800",
  "Education": "bg-indigo-100 text-indigo-800",
  "Personal Care": "bg-yellow-100 text-yellow-800",
  "Other": "bg-gray-100 text-gray-800"
};

export const ExpenseList = ({ expenses, onExpenseClick }: ExpenseListProps) => {
  const sortedExpenses = [...expenses].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (expenses.length === 0) {
    return (
      <Card className="shadow-soft border-0">
        <CardContent className="py-8 text-center">
          <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No transactions yet</p>
          <p className="text-sm text-muted-foreground">Add your first expense above</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedExpenses.map((expense) => (
          <div
            key={expense.id}
            onClick={() => onExpenseClick?.(expense)}
            className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-background to-muted/30 hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {/* Type Icon */}
              <div className={`p-2 rounded-full ${
                expense.type === 'expense' 
                  ? 'bg-expense-light text-expense' 
                  : 'bg-income-light text-income'
              }`}>
                {expense.type === 'expense' ? (
                  <ArrowDownCircle size={16} />
                ) : (
                  <ArrowUpCircle size={16} />
                )}
              </div>

              {/* Transaction Details */}
              <div className="space-y-1">
                <p className="font-medium text-sm">{expense.description}</p>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${categoryColors[expense.category] || categoryColors.Other}`}
                  >
                    {expense.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(expense.date, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="text-right">
              <p className={`font-semibold ${
                expense.type === 'expense' ? 'text-expense' : 'text-income'
              }`}>
                {expense.type === 'expense' ? '-' : '+'}${expense.amount.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};