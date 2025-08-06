import { supabase } from '@/integrations/supabase/client';
import { 
  convertDatabaseExpenseToLocal, 
  convertDatabaseAccountToLocal, 
  convertDatabaseBudgetToLocal,
  convertLocalExpenseToDatabase,
  convertLocalAccountToDatabase,
  convertLocalBudgetToDatabase
} from './databaseMigration';
import type { Expense, Account, Budget } from './expenseUtils';

// Load expenses from database in local format
export const loadExpensesFromSupabase = async (userId: string): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data || []).map(convertDatabaseExpenseToLocal);
};

// Load accounts from database in local format
export const loadAccountsFromSupabase = async (userId: string): Promise<Account[]> => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map(convertDatabaseAccountToLocal);
};

// Load budgets from database in local format
export const loadBudgetsFromSupabase = async (userId: string): Promise<Budget[]> => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map(convertDatabaseBudgetToLocal);
};

// Save expense to database
export const saveExpenseToSupabase = async (expense: Omit<Expense, 'id'>, userId: string) => {
  const dbExpense = convertLocalExpenseToDatabase(expense, userId);
  const { data, error } = await supabase
    .from('expenses')
    .insert(dbExpense)
    .select()
    .single();

  if (error) throw error;
  return convertDatabaseExpenseToLocal(data);
};

// Update expense in database
export const updateExpenseInSupabase = async (id: string, updates: Partial<Expense>) => {
  const { data, error } = await supabase
    .from('expenses')
    .update({
      amount: updates.amount ? parseFloat(updates.amount.toString()) : undefined,
      description: updates.description,
      category: updates.category,
      date: updates.date instanceof Date ? updates.date.toISOString().split('T')[0] : updates.date,
      type: updates.type,
      account_id: updates.accountId || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return convertDatabaseExpenseToLocal(data);
};

// Delete expense from database
export const deleteExpenseFromSupabase = async (id: string) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Save account to database
export const saveAccountToSupabase = async (account: Omit<Account, 'id'>, userId: string) => {
  const dbAccount = convertLocalAccountToDatabase(account, userId);
  const { data, error } = await supabase
    .from('accounts')
    .insert(dbAccount)
    .select()
    .single();

  if (error) throw error;
  return convertDatabaseAccountToLocal(data);
};

// Update account in database
export const updateAccountInSupabase = async (id: string, updates: Partial<Account>) => {
  const { data, error } = await supabase
    .from('accounts')
    .update({
      name: updates.name,
      type: updates.type,
      balance: updates.balance ? parseFloat(updates.balance.toString()) : undefined,
      color: updates.color,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return convertDatabaseAccountToLocal(data);
};

// Delete account from database
export const deleteAccountFromSupabase = async (id: string) => {
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Save budget to database
export const saveBudgetToSupabase = async (budget: Omit<Budget, 'id'>, userId: string) => {
  const dbBudget = convertLocalBudgetToDatabase(budget, userId);
  const { data, error } = await supabase
    .from('budgets')
    .insert(dbBudget)
    .select()
    .single();

  if (error) throw error;
  return convertDatabaseBudgetToLocal(data);
};

// Update budget in database
export const updateBudgetInSupabase = async (id: string, updates: Partial<Budget>) => {
  const { data, error } = await supabase
    .from('budgets')
    .update({
      category: updates.category,
      amount: updates.amount ? parseFloat(updates.amount.toString()) : undefined,
      period: updates.period,
      start_date: updates.startDate instanceof Date ? updates.startDate.toISOString().split('T')[0] : updates.startDate,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return convertDatabaseBudgetToLocal(data);
};

// Delete budget from database
export const deleteBudgetFromSupabase = async (id: string) => {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);

  if (error) throw error;
};