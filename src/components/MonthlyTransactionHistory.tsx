import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, TrendingDown, Receipt } from "lucide-react";
import { SwipeableExpenseItem } from "@/components/SwipeableExpenseItem";
import { EmptyState } from "@/components/EmptyState";
import { getCategoriesForFilter } from "@/utils/categories";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import type { Expense } from "@/types/app";

interface MonthlyTransactionHistoryProps {
  expenses: Expense[];
  currentMonth: Date;
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (id: string) => void;
  onExpenseClick?: (expense: Expense) => void;
}

export const MonthlyTransactionHistory = ({
  expenses,
  currentMonth,
  onEditExpense,
  onDeleteExpense,
  onExpenseClick
}: MonthlyTransactionHistoryProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");

  // Filter expenses for current month (only expense type, exclude income)
  const monthExpenses = useMemo(() => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    return expenses.filter(expense =>
      expense.date >= monthStart &&
      expense.date <= monthEnd &&
      expense.type === 'expense'
    );
  }, [expenses, currentMonth]);

  // Filter by category
  const filteredExpenses = useMemo(() => {
    if (selectedCategory === "All Categories") {
      return monthExpenses;
    }
    return monthExpenses.filter(expense => expense.category === selectedCategory);
  }, [monthExpenses, selectedCategory]);

  // Group transactions by date
  const groupedByDate = useMemo(() => {
    const groups: { [key: string]: Expense[] } = {};

    filteredExpenses.forEach(expense => {
      const dateKey = expense.date.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(expense);
    });

    // Sort dates in descending order (newest first)
    return Object.entries(groups)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [filteredExpenses]);

  // Calculate summary stats (monthExpenses already filtered to expenses only)
  const summary = useMemo(() => {
    const totalExpense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      totalExpense,
      count: monthExpenses.length
    };
  }, [monthExpenses]);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (monthExpenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Expense History</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            type="expenses"
            title="No expenses this month"
            description="No expenses found"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Expense History
            </CardTitle>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center justify-center gap-3 mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-destructive">
              <TrendingDown className="w-4 h-4" />
              <p className="text-2xl font-bold">${summary.totalExpense.toFixed(0)}</p>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Total Expenses</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 mt-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {getCategoriesForFilter().map((category) => (
                <SelectItem key={category} value={category} className="text-sm">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCategory !== "All Categories" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory("All Categories")}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          )}
          <Badge variant="outline" className="ml-auto">
            {filteredExpenses.length} {filteredExpenses.length === 1 ? 'expense' : 'expenses'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {filteredExpenses.length > 0 ? (
          groupedByDate.map(([dateKey, dateExpenses]) => {
            const date = new Date(dateKey);
            const dayTotal = dateExpenses.reduce((sum, e) => sum + e.amount, 0);

            return (
              <div key={dateKey} className="space-y-2">
                {/* Date Header */}
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <h4 className="font-semibold text-sm">
                    {date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </h4>
                  <Badge variant="destructive" className="text-xs">
                    ${dayTotal.toFixed(2)}
                  </Badge>
                </div>

                {/* Transactions for this date */}
                <div className="space-y-2 ml-2">
                  {dateExpenses
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map((expense) => (
                      <SwipeableExpenseItem
                        key={expense.id}
                        expense={expense}
                        onDelete={onDeleteExpense || (() => {})}
                        onEdit={onEditExpense}
                        onClick={() => onExpenseClick?.(expense)}
                        readOnly={true}
                      />
                    ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No expenses found for "{selectedCategory}"</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory("All Categories")}
              className="mt-2"
            >
              Clear filter
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
