import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import type { Expense, Account, Budget } from '@/types/app';

export function useDevMode() {
  const { user } = useUser();
  const [devModeEnabled, setDevModeEnabled] = useState(() => 
    localStorage.getItem('dev_local_storage_fallback') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('dev_local_storage_fallback', devModeEnabled.toString());
  }, [devModeEnabled]);

  const saveExpenseLocally = (expense: Expense) => {
    if (!user?.id) return;
    const key = `${user.id}_dev_expenses`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const newExpenses = [expense, ...existing];
    localStorage.setItem(key, JSON.stringify(newExpenses));
  };

  const saveAccountLocally = (account: Account) => {
    if (!user?.id) return;
    const key = `${user.id}_dev_accounts`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const newAccounts = [...existing, account];
    localStorage.setItem(key, JSON.stringify(newAccounts));
  };

  const saveBudgetLocally = (budget: Budget) => {
    if (!user?.id) return;
    const key = `${user.id}_dev_budgets`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const newBudgets = [...existing, budget];
    localStorage.setItem(key, JSON.stringify(newBudgets));
  };

  const updateExpenseLocally = (id: string, updates: Partial<Expense>) => {
    if (!user?.id) return;
    const key = `${user.id}_dev_expenses`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = existing.map((exp: Expense) => 
      exp.id === id ? { ...exp, ...updates } : exp
    );
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const deleteExpenseLocally = (id: string) => {
    if (!user?.id) return;
    const key = `${user.id}_dev_expenses`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = existing.filter((exp: Expense) => exp.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
  };

  const getLocalExpenses = (): Expense[] => {
    if (!user?.id) return [];
    const key = `${user.id}_dev_expenses`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  };

  const getLocalAccounts = (): Account[] => {
    if (!user?.id) return [];
    const key = `${user.id}_dev_accounts`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  };

  const getLocalBudgets = (): Budget[] => {
    if (!user?.id) return [];
    const key = `${user.id}_dev_budgets`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  };

  const hasLocalData = () => {
    if (!user?.id) return false;
    return (
      getLocalExpenses().length > 0 ||
      getLocalAccounts().length > 0 ||
      getLocalBudgets().length > 0
    );
  };

  const clearLocalData = () => {
    if (!user?.id) return;
    localStorage.removeItem(`${user.id}_dev_expenses`);
    localStorage.removeItem(`${user.id}_dev_accounts`);
    localStorage.removeItem(`${user.id}_dev_budgets`);
  };

  const isRLSError = (error: any): boolean => {
    return (
      error?.code === '42501' ||
      error?.message?.includes('permission denied') ||
      error?.message?.includes('row-level security')
    );
  };

  const isJWTError = (error: any): boolean => {
    return (
      error?.message === 'JWSError JWSInvalidSignature' ||
      error?.code === 'PGRST301' ||
      error?.message?.includes('JWT')
    );
  };

  return {
    devModeEnabled,
    setDevModeEnabled,
    saveExpenseLocally,
    saveAccountLocally,
    saveBudgetLocally,
    updateExpenseLocally,
    deleteExpenseLocally,
    getLocalExpenses,
    getLocalAccounts,
    getLocalBudgets,
    hasLocalData,
    clearLocalData,
    isRLSError,
    isJWTError
  };
}