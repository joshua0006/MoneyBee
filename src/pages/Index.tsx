import { useState } from "react";
import { ExpenseOverview } from "@/components/ExpenseOverview";
import { QuickAddExpense } from "@/components/QuickAddExpense";
import { ExpenseList } from "@/components/ExpenseList";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { Wallet, TrendingUp, BarChart3 } from "lucide-react";

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'expense' | 'income';
}

const Index = () => {
  const [expenses, setExpenses] = useState<Expense[]>([
    // Sample data to show the app in action
    {
      id: '1',
      amount: 15.50,
      description: 'Coffee and pastry',
      category: 'Food & Dining',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      type: 'expense'
    },
    {
      id: '2',
      amount: 45.00,
      description: 'Gas station',
      category: 'Transportation',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      type: 'expense'
    },
    {
      id: '3',
      amount: 3200.00,
      description: 'Monthly salary',
      category: 'Other',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      type: 'income'
    }
  ]);

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString()
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const totalIncome = expenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = expenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-card to-muted/30 border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-expense/10 rounded-full">
                <Wallet className="h-6 w-6 text-expense" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Expense Tracker</h1>
                <p className="text-sm text-muted-foreground">Smart expense management</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="p-2 bg-income/10 rounded-full">
                <TrendingUp className="h-5 w-5 text-income" />
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Overview */}
        <ExpenseOverview 
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
        />

        {/* Quick Add */}
        <QuickAddExpense onAddExpense={handleAddExpense} />

        {/* Category Breakdown */}
        <CategoryBreakdown expenses={expenses} />

        {/* Transactions List */}
        <ExpenseList expenses={expenses} />
      </div>
    </div>
  );
};

export default Index;
