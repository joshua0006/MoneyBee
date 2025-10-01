import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { Expense, Budget, Account, Goal } from '@/types/app';

interface CalendarViewProps {
  expenses: Expense[];
  budgets: Budget[];
  accounts: Account[];
  goals: Goal[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  onMonthChange?: (month: Date) => void;
}

export const CalendarView = ({ expenses, budgets, accounts, goals, onDateSelect, selectedDate, onMonthChange }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get expenses for a specific date
  const getExpensesForDate = (date: Date) => {
    return expenses.filter(expense => 
      expense.date.toDateString() === date.toDateString()
    );
  };

  // Get financial events for a specific date
  const getFinancialEventsForDate = (date: Date) => {
    const events = [];
    
    // Add expenses and income
    const dayExpenses = getExpensesForDate(date);
    events.push(...dayExpenses.map(expense => ({
      type: 'transaction' as const,
      subtype: expense.type,
      data: expense,
      amount: expense.amount,
      description: expense.description
    })));

    // Add goal deadlines
    const goalDeadlines = goals.filter(goal => 
      goal.deadline.toDateString() === date.toDateString()
    );
    events.push(...goalDeadlines.map(goal => ({
      type: 'goal' as const,
      subtype: 'deadline',
      data: goal,
      amount: goal.target - goal.current,
      description: `${goal.title} deadline`
    })));

    // Add budget period starts (monthly)
    const budgetStarts = budgets.filter(budget => {
      if (budget.period === 'monthly') {
        return budget.startDate.getDate() === date.getDate();
      }
      return false;
    });
    events.push(...budgetStarts.map(budget => ({
      type: 'budget' as const,
      subtype: 'period_start',
      data: budget,
      amount: budget.amount,
      description: `${budget.category} budget period`
    })));

    return events;
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
    const monthStart = new Date(currentMonth.getFullYear(), currentM  onth.getMonth(), 1);
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
    },
    hasGoalDeadline: (date: Date) => goals.some(goal => 
      goal.deadline.toDateString() === date.toDateString()
    ),
    hasBudgetEvent: (date: Date) => budgets.some(budget => 
      budget.period === 'monthly' && budget.startDate.getDate() === date.getDate()
    ),
    hasMultipleEvents: (date: Date) => {
      const events = getFinancialEventsForDate(date);
      return events.length > 1;
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
    },
    hasGoalDeadline: {
      backgroundColor: 'hsl(var(--warning) / 0.1)',
      color: 'hsl(var(--warning))',
      fontWeight: 'bold',
      border: '2px solid hsl(var(--warning) / 0.3)'
    },
    hasBudgetEvent: {
      backgroundColor: 'hsl(var(--info) / 0.1)',
      color: 'hsl(var(--info))',
      fontWeight: 'bold'
    },
    hasMultipleEvents: {
      backgroundColor: 'hsl(var(--primary) / 0.2)',
      color: 'hsl(var(--primary))',
      fontWeight: 'bold',
      border: '2px solid hsl(var(--primary) / 0.5)'
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
    onMonthChange?.(newMonth);
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
            onMonthChange={(month) => {
              setCurrentMonth(month);
              onMonthChange?.(month);
            }}
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
              const events = getFinancialEventsForDate(selectedDate);
              const dayTotal = getDayTotal(selectedDate);
              
              if (events.length === 0) {
                return (
                  <p className="text-muted-foreground text-center py-4">
                    No financial events on this date
                  </p>
                );
              }

              const transactions = events.filter(e => e.type === 'transaction');
              const goalEvents = events.filter(e => e.type === 'goal');
              const budgetEvents = events.filter(e => e.type === 'budget');

              return (
                <div className="space-y-4">
                  {/* Financial Summary */}
                  {transactions.length > 0 && (
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
                  )}

                  {/* Goal Events */}
                  {goalEvents.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-warning">
                        🎯 Goal Deadlines
                      </h4>
                      {goalEvents.map((event, index) => (
                        <div key={`goal-${index}`} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                          <div>
                            <p className="font-medium text-sm">{event.data.title}</p>
                            <p className="text-xs text-muted-foreground">
                              ${event.data.current.toFixed(0)} / ${event.data.target.toFixed(0)} saved
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-warning">
                              ${event.amount.toFixed(0)} left
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round((event.data.current / event.data.target) * 100)}% complete
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Budget Events */}
                  {budgetEvents.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-info">
                        📊 Budget Periods
                      </h4>
                      {budgetEvents.map((event, index) => (
                        <div key={`budget-${index}`} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                          <div>
                            <p className="font-medium text-sm">{event.data.category} Budget</p>
                            <p className="text-xs text-muted-foreground">
                              New {event.data.period} period starts
                            </p>
                          </div>
                          <p className="font-bold text-sm text-info">
                            ${event.amount.toFixed(0)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Recent Transactions */}
                  {transactions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        💳 Transactions
                      </h4>
                      {transactions.slice(0, 3).map((event, index) => (
                        <div key={`transaction-${index}`} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                          <div>
                            <p className="font-medium text-sm">{event.data.description}</p>
                            <p className="text-xs text-muted-foreground">{event.data.category}</p>
                          </div>
                          <p className={`font-bold text-sm ${
                            event.subtype === 'expense' ? 'text-destructive' : 'text-green-600'
                          }`}>
                            {event.subtype === 'expense' ? '-' : '+'}${event.amount.toFixed(2)}
                          </p>
                        </div>
                      ))}
                      
                      {transactions.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                          +{transactions.length - 3} more transactions
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};