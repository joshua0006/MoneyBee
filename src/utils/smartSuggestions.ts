import type { Expense } from '@/types/app';

export const getSmartSuggestions = (expenses: Expense[], currentInput: string): string[] => {
  if (currentInput.length < 2) return [];
  
  const lowercaseInput = currentInput.toLowerCase();
  
  // Get unique descriptions that match the input
  const matchingDescriptions = expenses
    .map(expense => expense.description)
    .filter(description => 
      description.toLowerCase().includes(lowercaseInput) && 
      description.toLowerCase() !== lowercaseInput
    )
    .filter((description, index, array) => array.indexOf(description) === index) // Remove duplicates
    .slice(0, 5); // Limit to 5 suggestions
  
  return matchingDescriptions;
};