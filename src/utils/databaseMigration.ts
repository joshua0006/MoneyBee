import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ExpenseRow = Database['public']['Tables']['expenses']['Row'];
type AccountRow = Database['public']['Tables']['accounts']['Row'];
type BudgetRow = Database['public']['Tables']['budgets']['Row'];

// Helper to convert database expense to local expense format
export const convertDatabaseExpenseToLocal = (dbExpense: ExpenseRow) => ({
  id: dbExpense.id,
  amount: parseFloat(dbExpense.amount.toString()),
  description: dbExpense.description,
  category: dbExpense.category,
  date: new Date(dbExpense.date),
  type: dbExpense.type as 'expense' | 'income',
  accountId: dbExpense.account_id || '',
});

// Helper to convert local expense to database format
export const convertLocalExpenseToDatabase = (localExpense: any, userId: string) => ({
  user_id: userId,
  amount: parseFloat(localExpense.amount.toString()),
  description: localExpense.description,
  category: localExpense.category,
  date: localExpense.date instanceof Date ? localExpense.date.toISOString().split('T')[0] : localExpense.date,
  type: localExpense.type,
  account_id: localExpense.accountId || null,
});

// Helper to convert database account to local account format
export const convertDatabaseAccountToLocal = (dbAccount: AccountRow) => ({
  id: dbAccount.id,
  name: dbAccount.name,
  type: dbAccount.type as 'checking' | 'savings' | 'credit' | 'cash',
  balance: parseFloat(dbAccount.balance.toString()),
  color: dbAccount.color,
});

// Helper to convert local account to database format
export const convertLocalAccountToDatabase = (localAccount: any, userId: string) => ({
  user_id: userId,
  name: localAccount.name,
  type: localAccount.type,
  balance: parseFloat(localAccount.balance.toString()),
  color: localAccount.color,
});

// Helper to convert database budget to local budget format
export const convertDatabaseBudgetToLocal = (dbBudget: BudgetRow) => ({
  id: dbBudget.id,
  category: dbBudget.category,
  amount: parseFloat(dbBudget.amount.toString()),
  period: dbBudget.period as 'weekly' | 'monthly' | 'yearly',
  startDate: new Date(dbBudget.start_date),
});

// Helper to convert local budget to database format
export const convertLocalBudgetToDatabase = (localBudget: any, userId: string) => ({
  user_id: userId,
  category: localBudget.category,
  amount: parseFloat(localBudget.amount.toString()),
  period: localBudget.period,
  start_date: localBudget.startDate instanceof Date ? localBudget.startDate.toISOString().split('T')[0] : localBudget.startDate,
});

// Check if user has data in database
export const checkUserHasData = async (userId: string) => {
  const [{ data: expenses }, { data: accounts }, { data: budgets }] = await Promise.all([
    supabase.from('expenses').select('id').eq('user_id', userId).limit(1),
    supabase.from('accounts').select('id').eq('user_id', userId).limit(1),
    supabase.from('budgets').select('id').eq('user_id', userId).limit(1),
  ]);

  return {
    hasExpenses: (expenses?.length || 0) > 0,
    hasAccounts: (accounts?.length || 0) > 0,
    hasBudgets: (budgets?.length || 0) > 0,
  };
};