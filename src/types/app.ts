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
  accountId?: string;
  creditCardId?: string;
  milesEarned?: number;
  milesRate?: number;
  photos?: string[];
  location?: string;
  tags?: string[];
  valueTags?: string[];
  recurring?: boolean;
  recurringId?: string;
}

export interface CreditCard {
  id: string;
  userId: string;
  name: string;
  network: 'visa' | 'mastercard' | 'amex' | 'other';
  lastFourDigits: string;
  color?: string;
  isActive: boolean;
}

export interface CardRewardCategory {
  id: string;
  cardId: string;
  category: string;
  milesPerDollar: number;
  monthlyCapAmount?: number;
  capResetDay: number;
  isActive: boolean;
}

export interface MonthlyCardSpending {
  id: string;
  cardId: string;
  category: string;
  year: number;
  month: number;
  totalSpent: number;
  milesEarned: number;
  capReachedDate?: Date;
}

export interface MicrosavingsChallenge {
  id: string;
  title: string;
  description: string;
  dailySavings: number;
  category: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // days
  isActive: boolean;
  streak: number;
  totalSaved: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash';
  balance: number;
  color?: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  category: string;
  deadline: Date;
  description?: string;
}

// Bill Splitter Types
export interface BillSplit {
  id: string;
  title: string;
  totalAmount: number;
  description?: string;
  participants: Participant[];
  splitMethod: SplitMethod;
  date: Date;
  status: 'pending' | 'partial' | 'completed';
  category?: string;
  createdBy: string;
  settledAt?: Date;
}

export interface Participant {
  id: string;
  name: string;
  email?: string;
  amountOwed: number;
  amountPaid: number;
  status: 'pending' | 'paid';
  paidAt?: Date;
  shares?: number; // For share-based splitting
}

export type SplitMethod = 'equal' | 'manual' | 'percentage' | 'shares';

export interface SplitCalculation {
  participantId: string;
  amount: number;
  percentage?: number;
  shares?: number;
}

// Conversion utilities
export const convertDbExpenseToApp = (dbExpense: DbExpense): Expense => ({
  id: dbExpense.id,
  amount: dbExpense.amount,
  description: dbExpense.description,
  category: dbExpense.category,
  date: new Date(dbExpense.date),
  type: dbExpense.type as 'expense' | 'income',
  accountId: dbExpense.account_id || undefined,
  creditCardId: dbExpense.credit_card_id || undefined,
  milesEarned: dbExpense.miles_earned || undefined,
  milesRate: dbExpense.miles_rate || undefined,
  valueTags: dbExpense.value_tags || undefined
});

export const convertAppExpenseToDb = (expense: Omit<Expense, 'id'>, userId: string): Omit<DbExpense, 'id' | 'created_at' | 'updated_at'> => ({
  user_id: userId,
  amount: expense.amount,
  description: expense.description,
  category: expense.category,
  date: expense.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
  type: expense.type,
  account_id: expense.accountId || null,
  credit_card_id: expense.creditCardId || null,
  miles_earned: expense.milesEarned || 0,
  miles_rate: expense.milesRate || 0,
  value_tags: expense.valueTags || null
});

export const convertDbAccountToApp = (dbAccount: DbAccount): Account => ({
  id: dbAccount.id,
  name: dbAccount.name,
  type: dbAccount.type as 'checking' | 'savings' | 'credit' | 'cash',
  balance: dbAccount.balance,
  color: dbAccount.color || undefined
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