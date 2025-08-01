import nlp from 'compromise';

export interface ParsedExpense {
  amount: number;
  description: string;
  category: string;
  confidence: {
    amount: number;
    description: number;
    category: number;
  };
}

export class AIExpenseParser {
  private static categoryKeywords = {
    'Food & Dining': [
      'coffee', 'starbucks', 'mcdonalds', 'restaurant', 'lunch', 'dinner', 'breakfast',
      'food', 'pizza', 'burger', 'sandwich', 'grocery', 'supermarket', 'cafe',
      'bar', 'pub', 'drink', 'beer', 'wine', 'soda', 'snack', 'eat', 'meal'
    ],
    'Transportation': [
      'gas', 'fuel', 'uber', 'taxi', 'bus', 'train', 'parking', 'toll',
      'subway', 'metro', 'flight', 'airline', 'car', 'garage', 'shell', 'bp',
      'exxon', 'chevron', 'station'
    ],
    'Shopping': [
      'amazon', 'target', 'walmart', 'store', 'shopping', 'buy', 'purchase',
      'clothes', 'shirt', 'shoes', 'electronics', 'phone', 'computer', 'book'
    ],
    'Entertainment': [
      'movie', 'cinema', 'netflix', 'spotify', 'game', 'concert', 'ticket',
      'theater', 'show', 'entertainment', 'fun', 'hobby'
    ],
    'Healthcare': [
      'doctor', 'hospital', 'pharmacy', 'medicine', 'dentist', 'clinic',
      'health', 'medical', 'prescription', 'insurance'
    ],
    'Bills & Utilities': [
      'electric', 'electricity', 'water', 'internet', 'phone', 'cable',
      'utility', 'bill', 'rent', 'mortgage', 'insurance'
    ],
    'Other': []
  };

  static parseExpenseText(text: string): ParsedExpense {
    const normalizedText = text.toLowerCase().trim();
    
    // Extract amount
    const amountResult = this.extractAmount(normalizedText);
    
    // Extract and clean description
    const descriptionResult = this.extractDescription(normalizedText, amountResult.extracted);
    
    // Suggest category
    const categoryResult = this.suggestCategory(normalizedText);
    
    return {
      amount: amountResult.amount,
      description: descriptionResult.description,
      category: categoryResult.category,
      confidence: {
        amount: amountResult.confidence,
        description: descriptionResult.confidence,
        category: categoryResult.confidence
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
        const extractedAmount = parseFloat(match[1] || match[0].replace('$', ''));
        
        if (!isNaN(extractedAmount) && extractedAmount > 0) {
          amount = extractedAmount;
          confidence = 1 - (i * 0.15); // Higher confidence for more specific patterns
          extractedAmounts.push(match[0]);
          break;
        }
      }
    }

    // Try to extract written numbers using NLP
    if (amount === 0) {
      const doc = nlp(text);
      const numbers = doc.numbers();
      
      if (numbers.length > 0) {
        const numberText = numbers.text();
        const numValue = parseFloat(numberText);
        if (!isNaN(numValue) && numValue > 0) {
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

  private static suggestCategory(text: string): { category: string; confidence: number } {
    const words = text.toLowerCase().split(/\s+/);
    let bestCategory = 'Other';
    let bestScore = 0;
    let bestConfidence = 0;

    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      if (category === 'Other') continue;
      
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