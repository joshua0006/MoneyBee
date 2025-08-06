import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Expense = Database['public']['Tables']['expenses']['Row'];
type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];

type Account = Database['public']['Tables']['accounts']['Row'];
type AccountInsert = Database['public']['Tables']['accounts']['Insert'];
type AccountUpdate = Database['public']['Tables']['accounts']['Update'];

type Budget = Database['public']['Tables']['budgets']['Row'];
type BudgetInsert = Database['public']['Tables']['budgets']['Insert'];
type BudgetUpdate = Database['public']['Tables']['budgets']['Update'];

type RecurringTransaction = Database['public']['Tables']['recurring_transactions']['Row'];
type RecurringTransactionInsert = Database['public']['Tables']['recurring_transactions']['Insert'];
type RecurringTransactionUpdate = Database['public']['Tables']['recurring_transactions']['Update'];

// Expense operations
export const saveExpenseToDatabase = async (expense: ExpenseInsert): Promise<Expense | null> => {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single();

  if (error) {
    console.error('Error saving expense:', error);
    throw error;
  }
  return data;
};

export const loadExpensesFromDatabase = async (userId: string): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error loading expenses:', error);
    throw error;
  }
  return data || [];
};

export const updateExpenseInDatabase = async (id: string, updates: ExpenseUpdate): Promise<Expense | null> => {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
  return data;
};

export const deleteExpenseFromDatabase = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// Account operations
export const saveAccountToDatabase = async (account: AccountInsert): Promise<Account | null> => {
  const { data, error } = await supabase
    .from('accounts')
    .insert(account)
    .select()
    .single();

  if (error) {
    console.error('Error saving account:', error);
    throw error;
  }
  return data;
};

export const loadAccountsFromDatabase = async (userId: string): Promise<Account[]> => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading accounts:', error);
    throw error;
  }
  return data || [];
};

export const updateAccountInDatabase = async (id: string, updates: AccountUpdate): Promise<Account | null> => {
  const { data, error } = await supabase
    .from('accounts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating account:', error);
    throw error;
  }
  return data;
};

export const deleteAccountFromDatabase = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};

// Budget operations
export const saveBudgetToDatabase = async (budget: BudgetInsert): Promise<Budget | null> => {
  const { data, error } = await supabase
    .from('budgets')
    .insert(budget)
    .select()
    .single();

  if (error) {
    console.error('Error saving budget:', error);
    throw error;
  }
  return data;
};

export const loadBudgetsFromDatabase = async (userId: string): Promise<Budget[]> => {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading budgets:', error);
    throw error;
  }
  return data || [];
};

export const updateBudgetInDatabase = async (id: string, updates: BudgetUpdate): Promise<Budget | null> => {
  const { data, error } = await supabase
    .from('budgets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
  return data;
};

export const deleteBudgetFromDatabase = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
};

// Recurring transaction operations
export const saveRecurringTransactionToDatabase = async (transaction: RecurringTransactionInsert): Promise<RecurringTransaction | null> => {
  const { data, error } = await supabase
    .from('recurring_transactions')
    .insert(transaction)
    .select()
    .single();

  if (error) {
    console.error('Error saving recurring transaction:', error);
    throw error;
  }
  return data;
};

export const loadRecurringTransactionsFromDatabase = async (userId: string): Promise<RecurringTransaction[]> => {
  const { data, error } = await supabase
    .from('recurring_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading recurring transactions:', error);
    throw error;
  }
  return data || [];
};

export const updateRecurringTransactionInDatabase = async (id: string, updates: RecurringTransactionUpdate): Promise<RecurringTransaction | null> => {
  const { data, error } = await supabase
    .from('recurring_transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating recurring transaction:', error);
    throw error;
  }
  return data;
};

export const deleteRecurringTransactionFromDatabase = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('recurring_transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting recurring transaction:', error);
    throw error;
  }
};

// Migration helper to move data from localStorage to database
export const migrateLocalStorageToDatabase = async (userId: string) => {
  try {
    // Load existing data from localStorage
    const existingExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const existingAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const existingBudgets = JSON.parse(localStorage.getItem('budgets') || '[]');

    // Migrate expenses
    for (const expense of existingExpenses) {
      await saveExpenseToDatabase({
        ...expense,
        user_id: userId,
        amount: parseFloat(expense.amount),
      });
    }

    // Migrate accounts
    for (const account of existingAccounts) {
      await saveAccountToDatabase({
        ...account,
        user_id: userId,
        balance: parseFloat(account.balance),
      });
    }

    // Migrate budgets
    for (const budget of existingBudgets) {
      await saveBudgetToDatabase({
        ...budget,
        user_id: userId,
        amount: parseFloat(budget.amount),
      });
    }

    // Clear localStorage after successful migration
    localStorage.removeItem('expenses');
    localStorage.removeItem('accounts');
    localStorage.removeItem('budgets');
    
    console.log('Data migration completed successfully');
  } catch (error) {
    console.error('Error migrating data:', error);
    throw error;
  }
};