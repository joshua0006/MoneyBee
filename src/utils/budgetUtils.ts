import type { Expense, Budget } from '@/types/app';

// Budget calculations
export const calculateBudgetUsage = (expenses: Expense[], budget: Budget): number => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  return expenses
    .filter(e => 
      e.type === 'expense' && 
      e.category === budget.category &&
      e.date.getMonth() === currentMonth &&
      e.date.getFullYear() === currentYear
    )
    .reduce((sum, e) => sum + e.amount, 0);
};