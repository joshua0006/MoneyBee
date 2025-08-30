// Centralized category management for the expense tracking app
export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Groceries', 
  'Transportation',
  'Entertainment',
  'Housing',
  'Utilities',
  'Health',
  'Clothing',
  'Education',
  'Insurance',
  'Work',
  'Donations',
  'Other'
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

// Category colors for consistent UI theming
export const CATEGORY_COLORS: Record<ExpenseCategory | 'Income', string> = {
  'Food & Dining': 'hsl(20 88% 58%)',
  'Groceries': 'hsl(120 60% 50%)',
  'Transportation': 'hsl(220 85% 58%)',
  'Entertainment': 'hsl(340 80% 62%)',
  'Housing': 'hsl(15 85% 65%)',
  'Utilities': 'hsl(40 85% 60%)',
  'Health': 'hsl(158 65% 48%)',
  'Clothing': 'hsl(280 85% 65%)',
  'Education': 'hsl(240 75% 60%)',
  'Insurance': 'hsl(200 60% 55%)',
  'Work': 'hsl(43 92% 58%)',
  'Donations': 'hsl(300 60% 55%)',
  'Other': 'hsl(210 10% 50%)',
  'Income': 'hsl(142 76% 36%)'
};

// Tailwind classes for category badges
export const CATEGORY_BADGE_CLASSES: Record<ExpenseCategory | 'Income', string> = {
  'Food & Dining': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'Groceries': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Transportation': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Entertainment': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'Housing': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Utilities': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Health': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  'Clothing': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Education': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'Insurance': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  'Work': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  'Donations': 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  'Income': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
};

// Keywords for auto-categorization
export const CATEGORY_KEYWORDS: Record<ExpenseCategory, string[]> = {
  'Food & Dining': [
    'coffee', 'starbucks', 'mcdonalds', 'restaurant', 'lunch', 'dinner', 'breakfast',
    'food', 'pizza', 'burger', 'sandwich', 'cafe', 'bar', 'pub', 'drink', 'beer', 
    'wine', 'soda', 'snack', 'eat', 'meal', 'dine', 'dining', 'takeout', 'delivery',
    'chipotle', 'taco bell', 'kfc', 'subway', 'uber eats', 'doordash', 'grubhub',
    // Singapore-specific food items
    'nasi lemak', 'char kway teow', 'laksa', 'chicken rice', 'bak kut teh', 'roti prata',
    'mee goreng', 'satay', 'dim sum', 'zi char', 'wanton mee', 'hokkien mee', 'carrot cake',
    'rojak', 'cendol', 'ice kachang', 'kopitiam', 'hawker', 'food court', 'newton',
    'lau pa sat', 'maxwell', 'old airport road', 'tiong bahru', 'amoy street'
  ],
  'Groceries': [
    'grocery', 'groceries', 'supermarket', 'walmart', 'target', 'costco', 'safeway',
    'kroger', 'produce', 'vegetables', 'fruits', 'meat', 'dairy', 'bread', 'milk',
    'eggs', 'shopping', 'market', 'store', 'whole foods', 'trader joes'
  ],
  'Transportation': [
    'gas', 'fuel', 'uber', 'taxi', 'bus', 'train', 'parking', 'toll', 'lyft',
    'metro', 'flight', 'plane', 'airport', 'car', 'vehicle', 'maintenance', 'repair',
    'oil change', 'tire', 'insurance', 'registration', 'shell', 'bp', 'exxon', 'chevron'
  ],
  'Entertainment': [
    'movie', 'cinema', 'netflix', 'spotify', 'game', 'concert', 'theater', 'streaming',
    'hulu', 'disney', 'amazon prime', 'youtube', 'music', 'books', 'magazine', 'show'
  ],
  'Housing': [
    'rent', 'mortgage', 'property', 'hoa', 'maintenance', 'repair', 'home',
    'apartment', 'house', 'lawn', 'garden', 'furniture', 'appliance', 'renovation'
  ],
  'Utilities': [
    'electric', 'electricity', 'water', 'phone', 'internet', 'cable', 'utility', 'bill',
    'gas bill', 'power', 'wifi', 'cell phone', 'landline', 'trash', 'recycling', 'sewer'
  ],
  'Health': [
    'doctor', 'pharmacy', 'medicine', 'hospital', 'dental', 'prescription', 'gym', 'fitness',
    'medical', 'clinic', 'dentist', 'therapy', 'massage', 'vitamin', 'supplement', 'copay'
  ],
  'Clothing': [
    'clothes', 'clothing', 'shirt', 'pants', 'shoes', 'dress', 'fashion',
    'nike', 'adidas', 'zara', 'h&m', 'uniqlo', 'jacket', 'jeans', 'sneakers'
  ],
  'Education': [
    'school', 'book', 'course', 'tuition', 'university', 'college', 'training',
    'education', 'textbook', 'supplies', 'fee', 'student', 'learning', 'workshop'
  ],
  'Insurance': [
    'insurance', 'premium', 'coverage', 'policy', 'auto insurance', 'health insurance',
    'life insurance', 'home insurance', 'deductible', 'claim'
  ],
  'Work': [
    'office', 'supplies', 'business', 'work', 'conference', 'equipment',
    'laptop', 'computer', 'software', 'tools', 'meeting', 'travel', 'expense'
  ],
  'Donations': [
    'charity', 'donation', 'church', 'nonprofit', 'give', 'foundation',
    'tithe', 'offering', 'fundraiser', 'volunteer', 'help', 'support'
  ],
  'Other': []
};

// Helper function to suggest category based on description
export const suggestCategoryFromDescription = (description: string): ExpenseCategory => {
  const lowerDesc = description.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'Other') continue;
    
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      return category as ExpenseCategory;
    }
  }
  
  return 'Other';
};

// Get categories for dropdowns (with "All Categories" option for filtering)
export const getCategoriesForFilter = (): string[] => {
  return ['All Categories', ...EXPENSE_CATEGORIES];
};

// Validate if a string is a valid category
export const isValidCategory = (category: string): category is ExpenseCategory => {
  return EXPENSE_CATEGORIES.includes(category as ExpenseCategory);
};