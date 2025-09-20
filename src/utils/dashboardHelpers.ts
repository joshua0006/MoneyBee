// Mock goals data (in a real app, this would come from the database)
export const getMockGoals = () => [
  {
    id: '1',
    title: 'Emergency Fund',
    target: 5000,
    current: 2500,
    category: 'savings',
    deadline: new Date('2024-12-31'),
    description: 'Build a 6-month emergency fund'
  },
  {
    id: '2',
    title: 'Vacation Fund',
    target: 2000,
    current: 800,
    category: 'travel',
    deadline: new Date('2024-08-15'),
    description: 'Save for summer vacation'
  }
];

// Onboarding steps configuration
export const getOnboardingSteps = () => [
  {
    id: 'welcome',
    title: 'Welcome to MoneyBee! 🐝',
    description: 'Your smart expense tracking companion. Let\'s get you started with the basics.',
  },
  {
    id: 'add-expense',
    title: 'Add Your First Expense',
    description: 'Tap the golden bee button to add expenses quickly. You can type naturally or scan receipts!',
  },
  {
    id: 'features',
    title: 'Explore Features',
    description: 'Use the menu (☰) to access budgets, analytics, and more. The bottom tabs switch between different views.',
  },
  {
    id: 'ready',
    title: 'You\'re All Set! ✨',
    description: 'Start tracking your expenses and watch your financial insights grow.',
  }
];