import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { Expense } from '@/types/app';

interface CalendarViewProps {
  expenses: Expense[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export const CalendarView = ({ expenses, onDateSelect, selectedDate }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get expenses for a specific date
  const getExpensesForDate = (date: Date) => {
    return expenses.filter(expense => 
      expense.date.toDateString() === date.toDateString()
    );
  };

  // Calculate daily totals
  const getDayTotal = (date: Date) => {
    const dayExpenses = getExpensesForDate(date);
    const totalExpense = dayExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = dayExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    return { totalExpense, totalIncome, net: totalIncome - totalExpense };
  };

  // Get month summary
  const getMonthSummary = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const monthExpenses = expenses.filter(expense => 
      expense.date >= monthStart && expense.date <= monthEnd
    );

    const totalExpense = monthExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = monthExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    
    return { totalExpense, totalIncome, net: totalIncome - totalExpense, count: monthExpenses.length };
  };

  const monthSummary = getMonthSummary();

  const modifiers = {
    hasExpense: (date: Date) => getExpensesForDate(date).some(e => e.type === 'expense'),
    hasIncome: (date: Date) => getExpensesForDate(date).some(e => e.type === 'income'),
    hasBoth: (date: Date) => {
      const dayExpenses = getExpensesForDate(date);
      return dayExpenses.some(e => e.type === 'expense') && dayExpenses.some(e => e.type === 'income');
    }
  };

  const modifiersStyles = {
    hasExpense: { 
      backgroundColor: 'hsl(var(--destructive) / 0.1)',
      color: 'hsl(var(--destructive))',
      fontWeight: 'bold'
    },
    hasIncome: { 
      backgroundColor: 'hsl(var(--success) / 0.1)',
      color: 'hsl(var(--success))',
      fontWeight: 'bold'
    },
    hasBoth: { 
      backgroundColor: 'hsl(var(--primary) / 0.1)',
      color: 'hsl(var(--primary))',
      fontWeight: 'bold'
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  return (
    <div className="space-y-4">
      {/* Month Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon size={20} />
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-destructive">
                ${monthSummary.totalExpense.toFixed(0)}
              </p>
              <p className="text-sm text-muted-foreground">Expenses</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                ${monthSummary.totalIncome.toFixed(0)}
              </p>
              <p className="text-sm text-muted-foreground">Income</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${monthSummary.net >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                ${monthSummary.net.toFixed(0)}
              </p>
              <p className="text-sm text-muted-foreground">Net</p>
            </div>
          </div>
          <div className="mt-3 text-center">
            <Badge variant="outline">
              {monthSummary.count} transactions
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateSelect(date)}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md border-0"
            showOutsideDays={false}
          />
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {(() => {
              const dayExpenses = getExpensesForDate(selectedDate);
              const dayTotal = getDayTotal(selectedDate);
              
              if (dayExpenses.length === 0) {
                return (
                  <p className="text-muted-foreground text-center py-4">
                    No transactions on this date
                  </p>
                );
              }

              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <p className="font-bold text-destructive">
                        ${dayTotal.totalExpense.toFixed(2)}
                      </p>
                      <p className="text-muted-foreground">Spent</p>
                    </div>
                    <div>
                      <p className="font-bold text-green-600">
                        ${dayTotal.totalIncome.toFixed(2)}
                      </p>
                      <p className="text-muted-foreground">Earned</p>
                    </div>
                    <div>
                      <p className={`font-bold ${dayTotal.net >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        ${dayTotal.net.toFixed(2)}
                      </p>
                      <p className="text-muted-foreground">Net</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {dayExpenses.slice(0, 3).map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div>
                          <p className="font-medium text-sm">{expense.description}</p>
                          <p className="text-xs text-muted-foreground">{expense.category}</p>
                        </div>
                        <p className={`font-bold text-sm ${
                          expense.type === 'expense' ? 'text-destructive' : 'text-green-600'
                        }`}>
                          {expense.type === 'expense' ? '-' : '+'}${expense.amount.toFixed(2)}
                        </p>
                      </div>
                    ))}
                    
                    {dayExpenses.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        +{dayExpenses.length - 3} more transactions
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};