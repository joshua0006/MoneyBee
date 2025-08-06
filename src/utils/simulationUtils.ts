import type { Expense } from '@/types/app';

export interface SimulationParams {
  incomeGrowthRate: number;
  expenseInflationRate: number;
  additionalSavings: number;
  investmentReturn: number;
  timeHorizon: number;
}

export interface ProjectionResult {
  year: number;
  income: number;
  expenses: number;
  netWorth: number;
  savings: number;
  monthlyNet: number;
}

export interface FinancialBaseline {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNet: number;
}

export interface SimulationScenario {
  name: string;
  description: string;
  params: SimulationParams;
  color: string;
}

export const calculateFinancialBaseline = (expenses: Expense[]): FinancialBaseline => {
  if (expenses.length === 0) {
    return { monthlyIncome: 0, monthlyExpenses: 0, monthlyNet: 0 };
  }

  // Get the last 6 months of data for more accurate averages
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const recentExpenses = expenses.filter(expense => expense.date >= sixMonthsAgo);
  
  const totalIncome = recentExpenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
    
  const totalExpenses = recentExpenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  // Calculate monthly averages
  const monthsOfData = Math.max(1, Math.ceil((new Date().getTime() - sixMonthsAgo.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  
  const monthlyIncome = totalIncome / monthsOfData;
  const monthlyExpenses = totalExpenses / monthsOfData;
  const monthlyNet = monthlyIncome - monthlyExpenses;

  return { monthlyIncome, monthlyExpenses, monthlyNet };
};

export const projectFinancialGrowth = (
  baseline: FinancialBaseline,
  params: SimulationParams
): ProjectionResult[] => {
  const results: ProjectionResult[] = [];
  let currentIncome = baseline.monthlyIncome;
  let currentExpenses = baseline.monthlyExpenses;
  let netWorth = 0;
  let totalSavings = 0;

  for (let year = 0; year <= params.timeHorizon; year++) {
    if (year > 0) {
      // Apply growth rates
      currentIncome *= (1 + params.incomeGrowthRate / 100);
      currentExpenses *= (1 + params.expenseInflationRate / 100);
    }

    const monthlyNet = currentIncome - currentExpenses + params.additionalSavings;
    const annualNet = monthlyNet * 12;
    
    // Calculate investment growth
    if (year > 0 && monthlyNet > 0) {
      totalSavings = (totalSavings + annualNet) * (1 + params.investmentReturn / 100);
    } else if (year === 0) {
      totalSavings = Math.max(0, annualNet);
    }

    netWorth = totalSavings;

    results.push({
      year,
      income: currentIncome * 12,
      expenses: currentExpenses * 12,
      netWorth,
      savings: totalSavings,
      monthlyNet
    });
  }

  return results;
};

export const getDefaultScenarios = (): SimulationScenario[] => [
  {
    name: "Conservative",
    description: "Steady growth with minimal risk",
    params: {
      incomeGrowthRate: 3,
      expenseInflationRate: 2.5,
      additionalSavings: 0,
      investmentReturn: 5,
      timeHorizon: 10
    },
    color: "hsl(var(--chart-1))"
  },
  {
    name: "Moderate",
    description: "Balanced growth approach",
    params: {
      incomeGrowthRate: 5,
      expenseInflationRate: 3,
      additionalSavings: 200,
      investmentReturn: 7,
      timeHorizon: 10
    },
    color: "hsl(var(--chart-2))"
  },
  {
    name: "Aggressive",
    description: "High growth with higher risk",
    params: {
      incomeGrowthRate: 7,
      expenseInflationRate: 3.5,
      additionalSavings: 500,
      investmentReturn: 9,
      timeHorizon: 10
    },
    color: "hsl(var(--chart-3))"
  }
];

export const calculateMilestones = (projections: ProjectionResult[]) => {
  const milestones = [];
  
  const emergencyFund = projections[0]?.expenses * 0.5; // 6 months expenses
  const firstHundredK = 100000;
  const quarterMillion = 250000;
  const halfMillion = 500000;
  const oneMillion = 1000000;

  const targets = [
    { name: "Emergency Fund", amount: emergencyFund, icon: "🛡️" },
    { name: "First $100K", amount: firstHundredK, icon: "💰" },
    { name: "$250K", amount: quarterMillion, icon: "🎯" },
    { name: "$500K", amount: halfMillion, icon: "🚀" },
    { name: "$1 Million", amount: oneMillion, icon: "💎" }
  ];

  targets.forEach(target => {
    const milestone = projections.find(p => p.netWorth >= target.amount);
    if (milestone) {
      milestones.push({
        ...target,
        year: milestone.year,
        achieved: true
      });
    } else {
      milestones.push({
        ...target,
        year: null,
        achieved: false
      });
    }
  });

  return milestones;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatLargeCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return formatCurrency(amount);
};