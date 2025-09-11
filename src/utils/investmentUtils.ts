import { supabase } from '@/integrations/supabase/client';

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  investment_type: string;
  current_value: number;
  expected_return: number;
  risk_level: string;
  created_at: string;
  updated_at: string;
}

export const INVESTMENT_TYPES = [
  { value: 'stock', label: 'Stocks' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'etf', label: 'ETF' },
  { value: 'bond', label: 'Bonds' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'other', label: 'Other' }
];

export const RISK_LEVELS = [
  { value: 'low', label: 'Low Risk', color: 'text-green-600' },
  { value: 'moderate', label: 'Moderate Risk', color: 'text-yellow-600' },
  { value: 'high', label: 'High Risk', color: 'text-red-600' }
];

// Load investments from database
export const loadInvestmentsFromDatabase = async (userId: string): Promise<Investment[]> => {
  const { data, error } = await supabase
    .from('user_investments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading investments:', error);
    throw error;
  }

  return data || [];
};

// Save investment to database
export const saveInvestmentToDatabase = async (investment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>): Promise<Investment> => {
  const { data, error } = await supabase
    .from('user_investments')
    .insert(investment)
    .select()
    .single();

  if (error) {
    console.error('Error saving investment:', error);
    throw error;
  }

  return data;
};

// Update investment in database
export const updateInvestmentInDatabase = async (id: string, updates: Partial<Investment>): Promise<Investment> => {
  const { data, error } = await supabase
    .from('user_investments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating investment:', error);
    throw error;
  }

  return data;
};

// Delete investment from database
export const deleteInvestmentFromDatabase = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('user_investments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting investment:', error);
    throw error;
  }
};

// Calculate portfolio metrics
export const calculatePortfolioMetrics = (investments: Investment[]) => {
  const totalValue = investments.reduce((sum, inv) => sum + inv.current_value, 0);
  const averageReturn = investments.length > 0 
    ? investments.reduce((sum, inv) => sum + inv.expected_return, 0) / investments.length 
    : 0;

  // Calculate portfolio breakdown by type
  const byType = investments.reduce((acc, inv) => {
    if (!acc[inv.investment_type]) {
      acc[inv.investment_type] = { count: 0, value: 0, percentage: 0 };
    }
    acc[inv.investment_type].count++;
    acc[inv.investment_type].value += inv.current_value;
    return acc;
  }, {} as Record<string, { count: number; value: number; percentage: number }>);

  // Add percentages
  Object.keys(byType).forEach(type => {
    byType[type].percentage = totalValue > 0 ? (byType[type].value / totalValue) * 100 : 0;
  });

  // Calculate portfolio breakdown by risk level
  const byRisk = investments.reduce((acc, inv) => {
    if (!acc[inv.risk_level]) {
      acc[inv.risk_level] = { count: 0, value: 0, percentage: 0 };
    }
    acc[inv.risk_level].count++;
    acc[inv.risk_level].value += inv.current_value;
    return acc;
  }, {} as Record<string, { count: number; value: number; percentage: number }>);

  // Add percentages for risk levels
  Object.keys(byRisk).forEach(risk => {
    byRisk[risk].percentage = totalValue > 0 ? (byRisk[risk].value / totalValue) * 100 : 0;
  });

  return {
    totalValue,
    averageReturn,
    totalInvestments: investments.length,
    byType,
    byRisk
  };
};

// Get investment type display name
export const getInvestmentTypeLabel = (type: string): string => {
  const investmentType = INVESTMENT_TYPES.find(t => t.value === type);
  return investmentType?.label || type.replace('_', ' ');
};

// Get risk level display info
export const getRiskLevelInfo = (level: string) => {
  return RISK_LEVELS.find(r => r.value === level) || RISK_LEVELS[1]; // default to moderate
};

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format percentage for display
export const formatPercentage = (percentage: number, decimals: number = 1): string => {
  return `${percentage.toFixed(decimals)}%`;
};