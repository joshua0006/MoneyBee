import type { Expense, Budget } from '@/types/app';

// Budget calculations
export const calculateBudgetUsage = (expenses: Expense[], budget: Budget): number => {
  const now = new Date();
  const budgetStart = new Date(budget.startDate);
  
  let periodStart: Date;
  let periodEnd: Date;
  
  switch (budget.period) {
    case 'weekly':
      // Find the start of the current week from budget start
      const daysSinceStart = Math.floor((now.getTime() - budgetStart.getTime()) / (1000 * 60 * 60 * 24));
      const weeksSinceStart = Math.floor(daysSinceStart / 7);
      periodStart = new Date(budgetStart.getTime() + (weeksSinceStart * 7 * 24 * 60 * 60 * 1000));
      periodEnd = new Date(periodStart.getTime() + (7 * 24 * 60 * 60 * 1000) - 1);
      break;
    
    case 'yearly':
      periodStart = new Date(now.getFullYear(), 0, 1);
      periodEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      break;
    
    case 'monthly':
    default:
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
  }
  
  return expenses
    .filter(e => {
      const expenseDate = new Date(e.date);
      return e.type === 'expense' && 
             e.category === budget.category &&
             expenseDate >= periodStart &&
             expenseDate <= periodEnd;
    })
    .reduce((sum, e) => sum + e.amount, 0);
};