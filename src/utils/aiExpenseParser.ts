export interface ParsedExpense {
  amount: number;
  description: string;
  category: string;
  type: 'expense' | 'income';
  confidence: {
    amount: number;
    description: number;
    category: number;
    type: number;
  };
}

export class AIExpenseParser {
  private static incomeKeywords = [
    'salary', 'wage', 'pay', 'bonus', 'received', 'deposit', 'refund',
    'freelance', 'consulting', 'dividend', 'interest', 'sold', 'income'
  ];

  private static expenseKeywords = [
    'paid', 'bought', 'spent', 'purchase', 'cost', 'fee', 'charge',
    'bill', 'rent', 'subscription', 'expense'
  ];

import { CATEGORY_KEYWORDS } from '@/utils/categories';

  private static categoryKeywords: Record<string, string[]> = CATEGORY_KEYWORDS;

  static parseExpenseText(text: string): ParsedExpense {
    const normalizedText = text.toLowerCase().trim();
    
    // Extract amount
    const amountResult = this.extractAmount(normalizedText);
    
    // Extract and clean description
    const descriptionResult = this.extractDescription(normalizedText, amountResult.extracted);
    
    // Detect transaction type
    const typeResult = this.detectTransactionType(normalizedText);
    
    // Suggest category (context-aware based on type)
    const categoryResult = this.suggestCategory(normalizedText, typeResult.type);
    
    return {
      amount: amountResult.amount,
      description: descriptionResult.description,
      category: categoryResult.category,
      type: typeResult.type,
      confidence: {
        amount: amountResult.confidence,
        description: descriptionResult.confidence,
        category: categoryResult.confidence,
        type: typeResult.confidence
      }
    };
  }

  private static extractAmount(text: string): { amount: number; confidence: number; extracted: string[] } {
    const extractedAmounts: string[] = [];
    let amount = 0;
    let confidence = 0;

    // Regex patterns for different amount formats
    const patterns = [
      /\$(\d+(?:\.\d{2})?)/g,                    // $15.99, $15
      /(\d+(?:\.\d{2})?)\s*dollars?/g,           // 15 dollars, 15.99 dollar
      /(\d+(?:\.\d{2})?)\s*bucks?/g,             // 15 bucks, 5 buck
      /(\d+(?:\.\d{2})?)\s*usd/g,                // 15 usd
      /(\d+(?:\.\d{2})?)\s*\$/g,                 // 15$
      /(\d+(?:\.\d{2})?)/g                       // 15.99, 15 (fallback)
    ];

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const matches = Array.from(text.matchAll(pattern));
      
      if (matches.length > 0) {
        const match = matches[0];
        const numValue = parseFloat(match[1]);
        
        if (!isNaN(numValue) && numValue > 0) {
          amount = numValue;
          confidence = Math.max(0.9 - (i * 0.15), 0.3); // Higher confidence for earlier patterns
          extractedAmounts.push(match[0]);
          break;
        }
      }
    }

    // Handle written numbers (basic)
    if (amount === 0) {
      const writtenNumbers = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
        'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
        'hundred': 100, 'thousand': 1000
      };

      for (const [numberText, numValue] of Object.entries(writtenNumbers)) {
        if (text.includes(numberText)) {
          amount = numValue;
          confidence = 0.6;
          extractedAmounts.push(numberText);
        }
      }
    }

    return { amount, confidence, extracted: extractedAmounts };
  }

  private static extractDescription(text: string, extractedAmounts: string[]): { description: string; confidence: number } {
    let description = text;
    
    // Remove extracted amounts and common amount-related words
    extractedAmounts.forEach(amount => {
      description = description.replace(new RegExp(amount.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '');
    });
    
    // Remove common amount words
    const amountWords = ['dollars?', 'bucks?', 'usd', '\\$', 'paid', 'cost', 'spent', 'for'];
    amountWords.forEach(word => {
      description = description.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
    });
    
    // Clean up the description
    description = description
      .replace(/\s+/g, ' ')
      .replace(/^(at|for|on|in)\s+/i, '')
      .trim();
    
    // Capitalize first letter
    if (description.length > 0) {
      description = description.charAt(0).toUpperCase() + description.slice(1);
    }
    
    const confidence = description.length > 0 ? 0.8 : 0.3;
    
    return { description: description || 'Expense', confidence };
  }

  private static detectTransactionType(text: string): { type: 'expense' | 'income'; confidence: number } {
    const words = text.toLowerCase().split(/\s+/);
    let incomeScore = 0;
    let expenseScore = 0;

    // Check for income keywords
    for (const keyword of this.incomeKeywords) {
      if (words.some(word => word.includes(keyword) || keyword.includes(word))) {
        incomeScore += 1;
      }
    }

    // Check for expense keywords
    for (const keyword of this.expenseKeywords) {
      if (words.some(word => word.includes(keyword) || keyword.includes(word))) {
        expenseScore += 1;
      }
    }

    // Determine type and confidence
    if (incomeScore > expenseScore) {
      return {
        type: 'income',
        confidence: Math.min(0.9, 0.4 + (incomeScore * 0.2))
      };
    } else if (expenseScore > incomeScore) {
      return {
        type: 'expense',
        confidence: Math.min(0.9, 0.4 + (expenseScore * 0.2))
      };
    } else {
      // Default to expense with low confidence
      return {
        type: 'expense',
        confidence: 0.3
      };
    }
  }

  private static suggestCategory(text: string, type: 'expense' | 'income' = 'expense'): { category: string; confidence: number } {
    const words = text.toLowerCase().split(/\s+/);
    let bestCategory = 'Other';
    let bestScore = 0;
    let bestConfidence = 0;

    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      if (category === 'Other') continue;
      
      // Skip income categories for expenses and vice versa
      const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Business Income'];
      if (type === 'expense' && incomeCategories.includes(category)) continue;
      if (type === 'income' && !incomeCategories.includes(category)) continue;
      
      let score = 0;
      let matches = 0;
      
      for (const keyword of keywords) {
        if (words.some(word => word.includes(keyword) || keyword.includes(word))) {
          score += 1;
          matches++;
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
        bestConfidence = Math.min(0.9, 0.3 + (matches * 0.2));
      }
    }
    
    return {
      category: bestCategory,
      confidence: bestConfidence
    };
  }

  static getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.4) return 'medium';
    return 'low';
  }

  static getConfidenceColor(confidence: number): string {
    if (confidence >= 0.7) return 'text-green-600';
    if (confidence >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  }
}