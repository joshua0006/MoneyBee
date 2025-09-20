import { useMemo } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import type { Expense } from '@/types/app';

interface UseDashboardDataProps {
  allExpenses: Expense[];
  selectedMonth: Date;
}

export const useDashboardData = ({ allExpenses, selectedMonth }: UseDashboardDataProps) => {
  // Filter expenses by selected month
  const monthlyExpenses = useMemo(() => 
    allExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    }), [allExpenses, selectedMonth]
  );

  // Calculate totals
  const totalIncome = useMemo(() => 
    monthlyExpenses
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0), 
    [monthlyExpenses]
  );

  const totalExpenses = useMemo(() => 
    monthlyExpenses
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0), 
    [monthlyExpenses]
  );

  return {
    monthlyExpenses,
    totalIncome,
    totalExpenses
  };
};