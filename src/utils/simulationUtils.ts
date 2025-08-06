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
  const houseDownPayment = 50000;
  const firstHundredK = 100000;
  const comfortableRetirement = 250000;
  const financialFreedom = 500000;
  const wealthyLifestyle = 1000000;
  const legacyWealth = 2000000;

  const targets = [
    { 
      name: "Emergency Fund", 
      amount: emergencyFund, 
      icon: "🛡️",
      description: "Sleep soundly knowing you're protected",
      category: "Security"
    },
    { 
      name: "House Down Payment", 
      amount: houseDownPayment, 
      icon: "🏠",
      description: "Your own home awaits",
      category: "Lifestyle"
    },
    { 
      name: "First $100K", 
      amount: firstHundredK, 
      icon: "💰",
      description: "The hardest milestone - momentum builds from here",
      category: "Growth"
    },
    { 
      name: "Comfortable Retirement", 
      amount: comfortableRetirement, 
      icon: "🌅",
      description: "Retirement security within reach",
      category: "Security"
    },
    { 
      name: "Financial Freedom", 
      amount: financialFreedom, 
      icon: "🚀",
      description: "Work becomes optional",
      category: "Freedom"
    },
    { 
      name: "Wealthy Lifestyle", 
      amount: wealthyLifestyle, 
      icon: "💎",
      description: "Live life on your terms",
      category: "Lifestyle"
    },
    { 
      name: "Legacy Wealth", 
      amount: legacyWealth, 
      icon: "👑",
      description: "Generational impact and giving",
      category: "Legacy"
    }
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

export const getMotivationalMessage = (baseline: FinancialBaseline, projections: ProjectionResult[]): string => {
  const finalNetWorth = projections[projections.length - 1]?.netWorth || 0;
  const timeHorizon = projections.length - 1;
  
  if (baseline.monthlyNet <= 0) {
    return "Every journey begins with a single step. Start by tracking your expenses and finding small ways to save.";
  }
  
  if (finalNetWorth >= 1000000) {
    return `🎉 You're on track to become a millionaire in ${timeHorizon} years! Stay consistent with your financial habits.`;
  }
  
  if (finalNetWorth >= 500000) {
    return `🚀 Financial freedom is within reach! In ${timeHorizon} years, you could have enough to make work optional.`;
  }
  
  if (finalNetWorth >= 100000) {
    return `💪 You're building serious wealth! Your first $100K milestone shows the power of compound growth.`;
  }
  
  return `🌱 Your wealth is growing steadily. Small, consistent steps lead to big results over time.`;
};

export const getTimelineGoals = (projections: ProjectionResult[]) => {
  const goals = [];
  
  // Short-term (1-2 years)
  const shortTerm = projections.find(p => p.year >= 1 && p.year <= 2);
  if (shortTerm && shortTerm.netWorth > 10000) {
    goals.push({
      timeframe: "1-2 Years",
      goal: "Build Emergency Fund",
      amount: shortTerm.netWorth,
      description: "Establish financial security foundation"
    });
  }
  
  // Medium-term (5 years)
  const mediumTerm = projections.find(p => p.year === 5);
  if (mediumTerm) {
    goals.push({
      timeframe: "5 Years", 
      goal: mediumTerm.netWorth >= 100000 ? "Reach $100K+ Milestone" : "Significant Savings Growth",
      amount: mediumTerm.netWorth,
      description: mediumTerm.netWorth >= 100000 ? "Join the six-figure club" : "Build substantial savings"
    });
  }
  
  // Long-term (10+ years)
  const longTerm = projections[projections.length - 1];
  if (longTerm) {
    let goalName = "Wealth Accumulation";
    let description = "Continue building financial strength";
    
    if (longTerm.netWorth >= 1000000) {
      goalName = "Millionaire Status";
      description = "Achieve true financial independence";
    } else if (longTerm.netWorth >= 500000) {
      goalName = "Financial Freedom";
      description = "Have the option to work by choice";
    }
    
    goals.push({
      timeframe: `${projections.length - 1} Years`,
      goal: goalName,
      amount: longTerm.netWorth,
      description
    });
  }
  
  return goals;
};

export const getInspirationalQuotes = () => [
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Compound interest is the eighth wonder of the world. Those who understand it, earn it.",
  "It's not how much money you make, but how much money you keep.",
  "The real measure of your wealth is how much you'd be worth if you lost all your money.",
  "An investment in knowledge pays the best interest.",
  "The stock market is a device for transferring money from the impatient to the patient."
];

export const getAchievementCards = (projections: ProjectionResult[], baseline: FinancialBaseline) => {
  const cards = [];
  const finalProjection = projections[projections.length - 1];
  const timeHorizon = projections.length - 1;
  
  // Net Worth Achievement
  cards.push({
    title: "Your Future Net Worth",
    value: formatCurrency(finalProjection?.netWorth || 0),
    subtitle: `In ${timeHorizon} years`,
    icon: "💰",
    color: "from-green-500 to-emerald-600"
  });
  
  // Monthly Growth
  const avgMonthlyGrowth = (finalProjection?.netWorth || 0) / timeHorizon / 12;
  cards.push({
    title: "Average Monthly Growth",
    value: formatCurrency(avgMonthlyGrowth),
    subtitle: "Building wealth consistently",
    icon: "📈",
    color: "from-blue-500 to-cyan-600"
  });
  
  // Financial Freedom Timeline
  const freedomProjection = projections.find(p => p.netWorth >= 500000);
  if (freedomProjection) {
    cards.push({
      title: "Financial Freedom",
      value: `${freedomProjection.year} Years`,
      subtitle: "When work becomes optional",
      icon: "🗽",
      color: "from-purple-500 to-pink-600"
    });
  }
  
  // Retirement Readiness
  if (finalProjection?.netWorth >= 250000) {
    cards.push({
      title: "Retirement Ready",
      value: "Secured",
      subtitle: "Your future self will thank you",
      icon: "🌅",
      color: "from-orange-500 to-red-600"
    });
  }
  
  return cards;
};