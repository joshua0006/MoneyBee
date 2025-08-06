import type { Database } from '@/integrations/supabase/types';

// Database types
export type DbExpense = Database['public']['Tables']['expenses']['Row'];
export type DbAccount = Database['public']['Tables']['accounts']['Row'];
export type DbBudget = Database['public']['Tables']['budgets']['Row'];

// App types (converted from database types)
export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'expense' | 'income';
  accountId: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash';
  balance: number;
  color: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
}

// Conversion utilities
export const convertDbExpenseToApp = (dbExpense: DbExpense): Expense => ({
  id: dbExpense.id,
  amount: dbExpense.amount,
  description: dbExpense.description,
  category: dbExpense.category,
  date: new Date(dbExpense.date),
  type: dbExpense.type as 'expense' | 'income',
  accountId: dbExpense.account_id || ''
});

export const convertAppExpenseToDb = (expense: Omit<Expense, 'id'>, userId: string): Omit<DbExpense, 'id' | 'created_at' | 'updated_at'> => ({
  user_id: userId,
  amount: expense.amount,
  description: expense.description,
  category: expense.category,
  date: expense.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
  type: expense.type,
  account_id: expense.accountId || null
});

export const convertDbAccountToApp = (dbAccount: DbAccount): Account => ({
  id: dbAccount.id,
  name: dbAccount.name,
  type: dbAccount.type as 'checking' | 'savings' | 'credit' | 'cash',
  balance: dbAccount.balance,
  color: dbAccount.color || '#3B82F6'
});

export const convertAppAccountToDb = (account: Omit<Account, 'id'>, userId: string): Omit<DbAccount, 'id' | 'created_at' | 'updated_at'> => ({
  user_id: userId,
  name: account.name,
  type: account.type,
  balance: account.balance,
  color: account.color || null
});

export const convertDbBudgetToApp = (dbBudget: DbBudget): Budget => ({
  id: dbBudget.id,
  category: dbBudget.category,
  amount: dbBudget.amount,
  period: dbBudget.period as 'weekly' | 'monthly' | 'yearly',
  startDate: new Date(dbBudget.start_date)
});

export const convertAppBudgetToDb = (budget: Omit<Budget, 'id'>, userId: string): Omit<DbBudget, 'id' | 'created_at' | 'updated_at'> => ({
  user_id: userId,
  category: budget.category,
  amount: budget.amount,
  period: budget.period,
  start_date: budget.startDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
});