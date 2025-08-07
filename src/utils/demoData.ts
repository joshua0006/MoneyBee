export interface DemoExpense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  merchant: string;
  paymentMethod: string;
}

export interface DemoCategory {
  name: string;
  icon: string;
  color: string;
  spent: number;
  budget: number;
  percentage: number;
}

export interface DemoFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  benefit: string;
  demoAction: string;
  position: [number, number, number];
}

export const demoExpenses: DemoExpense[] = [
  {
    id: '1',
    amount: 24.99,
    description: 'Organic Coffee Beans',
    category: 'Food & Dining',
    date: '2024-01-15',
    merchant: 'Local Coffee Roasters',
    paymentMethod: 'Credit Card'
  },
  {
    id: '2',
    amount: 89.50,
    description: 'Weekly Groceries',
    category: 'Groceries',
    date: '2024-01-14',
    merchant: 'Whole Foods Market',
    paymentMethod: 'Debit Card'
  },
  {
    id: '3',
    amount: 15.75,
    description: 'Lunch Meeting',
    category: 'Business',
    date: '2024-01-13',
    merchant: 'Café Downtown',
    paymentMethod: 'Credit Card'
  },
  {
    id: '4',
    amount: 45.00,
    description: 'Gas Station Fill-up',
    category: 'Transportation',
    date: '2024-01-12',
    merchant: 'Shell Station',
    paymentMethod: 'Credit Card'
  },
  {
    id: '5',
    amount: 129.99,
    description: 'Monthly Gym Membership',
    category: 'Health & Fitness',
    date: '2024-01-10',
    merchant: 'FitLife Gym',
    paymentMethod: 'Bank Transfer'
  }
];

export const demoCategories: DemoCategory[] = [
  {
    name: 'Food & Dining',
    icon: '🍽️',
    color: 'hsl(var(--primary))',
    spent: 420.50,
    budget: 500.00,
    percentage: 84.1
  },
  {
    name: 'Transportation',
    icon: '🚗',
    color: 'hsl(217, 92%, 65%)',
    spent: 280.00,
    budget: 350.00,
    percentage: 80.0
  },
  {
    name: 'Groceries',
    icon: '🛒',
    color: 'hsl(142, 71%, 45%)',
    spent: 320.75,
    budget: 400.00,
    percentage: 80.2
  },
  {
    name: 'Health & Fitness',
    icon: '💪',
    color: 'hsl(291, 64%, 42%)',
    spent: 189.99,
    budget: 200.00,
    percentage: 95.0
  },
  {
    name: 'Entertainment',
    icon: '🎬',
    color: 'hsl(48, 96%, 53%)',
    spent: 125.50,
    budget: 200.00,
    percentage: 62.8
  }
];

export const demoFeatures: DemoFeature[] = [
  {
    id: 'ai-scanning',
    title: 'Smart Receipt Scanning',
    description: 'Snap a photo and AI instantly extracts all expense details',
    icon: '📸',
    benefit: 'Save 5 minutes per receipt',
    demoAction: 'Try scanning a receipt',
    position: [-4, 2, 1]
  },
  {
    id: 'ai-categorization',
    title: 'Intelligent Categorization',
    description: 'Machine learning automatically sorts your expenses',
    icon: '🧠',
    benefit: '95% accuracy rate',
    demoAction: 'See AI in action',
    position: [4, 1, 1]
  },
  {
    id: 'smart-budgets',
    title: 'Predictive Budgeting',
    description: 'Get AI-powered spending insights and recommendations',
    icon: '🎯',
    benefit: 'Reduce overspending by 30%',
    demoAction: 'Explore budget insights',
    position: [-3, -2, 1]
  },
  {
    id: 'wealth-tracking',
    title: 'Wealth Simulation',
    description: 'Visualize your financial future with investment projections',
    icon: '📈',
    benefit: 'Plan 10+ years ahead',
    demoAction: 'Run wealth simulation',
    position: [3, -1, 1]
  },
  {
    id: 'real-time-sync',
    title: 'Multi-Device Sync',
    description: 'Access your data anywhere, anytime, on any device',
    icon: '🔄',
    benefit: 'Never lose data again',
    demoAction: 'See sync in action',
    position: [0, -3, 1]
  }
];

export const demoStats = {
  totalExpenses: 1486.73,
  monthlyBudget: 2000.00,
  categoriesTracked: 12,
  receiptsScanned: 45,
  timesSaved: '2.5 hours/week',
  accuracyRate: '95%'
};

export const demoUserJourney = [
  {
    step: 1,
    title: 'Snap & Scan',
    description: 'Take a photo of any receipt',
    action: 'AI extracts all details instantly',
    time: '3 seconds'
  },
  {
    step: 2,
    title: 'Auto-Categorize',
    description: 'Smart AI sorts your expense',
    action: 'No manual entry required',
    time: 'Instant'
  },
  {
    step: 3,
    title: 'Track & Budget',
    description: 'Monitor spending in real-time',
    action: 'Get alerts before overspending',
    time: 'Ongoing'
  },
  {
    step: 4,
    title: 'Grow Wealth',
    description: 'Simulate investment scenarios',
    action: 'Plan your financial future',
    time: 'Long-term'
  }
];