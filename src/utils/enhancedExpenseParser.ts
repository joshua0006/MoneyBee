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
  merchant?: string;
  reasoning?: string;
}

export class EnhancedExpenseParser {
  private static readonly currencySymbols = ['$', '€', '£', '¥', '₹', '₩'];
  private static readonly currencyWords = ['dollars', 'dollar', 'bucks', 'buck', 'euros', 'euro', 'pounds', 'pound', 'yen'];
  
  private static readonly incomeKeywords = [
    'salary', 'wage', 'income', 'earned', 'received', 'got paid', 'paycheck', 
    'bonus', 'refund', 'cashback', 'gift', 'sold', 'commission', 'freelance',
    'dividend', 'interest', 'tip', 'tips', 'allowance', 'rebate', 'settlement'
  ];

  private static readonly expenseKeywords = [
    'bought', 'purchased', 'paid', 'spent', 'cost', 'bill', 'fee', 'charge',
    'subscription', 'membership', 'rent', 'mortgage', 'loan', 'debt', 'tax',
    'fine', 'penalty', 'donation', 'investment', 'loss', 'repair'
  ];

import { CATEGORY_KEYWORDS } from '@/utils/categories';

  private static readonly merchantCategories = {
    // Food & Dining
    'starbucks': 'Food & Dining', 'mcdonalds': 'Food & Dining', 'subway': 'Food & Dining',
    'pizza': 'Food & Dining', 'restaurant': 'Food & Dining', 'cafe': 'Food & Dining',
    'uber eats': 'Food & Dining', 'doordash': 'Food & Dining', 'grubhub': 'Food & Dining',
    'chipotle': 'Food & Dining', 'taco bell': 'Food & Dining', 'kfc': 'Food & Dining',
    
    // Transportation
    'uber': 'Transportation', 'lyft': 'Transportation', 'taxi': 'Transportation',
    'gas station': 'Transportation', 'shell': 'Transportation', 'bp': 'Transportation',
    'exxon': 'Transportation', 'chevron': 'Transportation', 'bus': 'Transportation',
    'metro': 'Transportation', 'parking': 'Transportation', 'toll': 'Transportation',
    
    // Shopping
    'amazon': 'Shopping', 'walmart': 'Shopping', 'target': 'Shopping',
    'costco': 'Shopping', 'best buy': 'Shopping', 'apple store': 'Shopping',
    'mall': 'Shopping', 'grocery': 'Shopping', 'supermarket': 'Shopping',
    
    // Entertainment
    'netflix': 'Entertainment', 'spotify': 'Entertainment', 'cinema': 'Entertainment',
    'movie': 'Entertainment', 'concert': 'Entertainment', 'theater': 'Entertainment',
    'gym': 'Entertainment', 'fitness': 'Entertainment',
    
    // Healthcare
    'hospital': 'Healthcare', 'pharmacy': 'Healthcare', 'doctor': 'Healthcare',
    'dentist': 'Healthcare', 'clinic': 'Healthcare', 'medical': 'Healthcare',
    
    // Utilities
    'electric': 'Utilities', 'gas bill': 'Utilities', 'water': 'Utilities',
    'internet': 'Utilities', 'phone': 'Utilities', 'cable': 'Utilities'
  };

  private static readonly categoryKeywords = CATEGORY_KEYWORDS;

  private static readonly writtenNumbers = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
    'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
    'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
    'eighty': 80, 'ninety': 90, 'hundred': 100, 'thousand': 1000, 'million': 1000000
  };

  static parseExpenseText(text: string): ParsedExpense {
    const normalizedText = text.toLowerCase().trim();
    
    const amountResult = this.extractAmount(normalizedText);
    const descriptionResult = this.extractDescription(normalizedText, amountResult.extracted);
    const typeResult = this.detectTransactionType(normalizedText);
    const categoryResult = this.suggestCategory(normalizedText, typeResult.type);
    const merchantResult = this.extractMerchant(normalizedText);

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
      },
      merchant: merchantResult.merchant,
      reasoning: this.generateReasoning(normalizedText, amountResult, categoryResult, typeResult)
    };
  }

  private static extractAmount(text: string): { amount: number; confidence: number; extracted: string[] } {
    const extracted: string[] = [];
    let bestAmount = 0;
    let bestConfidence = 0;

    // Pattern 1: Currency symbols with numbers ($50, €25.50, £100)
    const currencyPattern = /[\$€£¥₹₩]\s*([0-9,]+(?:\.[0-9]{1,2})?)/g;
    let match;
    while ((match = currencyPattern.exec(text)) !== null) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount) && amount > bestAmount) {
        bestAmount = amount;
        bestConfidence = 0.95;
        extracted.push(match[0]);
      }
    }

    // Pattern 2: Numbers followed by currency words (50 dollars, 25 bucks)
    const numberCurrencyPattern = /([0-9,]+(?:\.[0-9]{1,2})?)\s*(dollars?|bucks?|euros?|pounds?)/g;
    while ((match = numberCurrencyPattern.exec(text)) !== null) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount) && (amount > bestAmount || bestConfidence < 0.9)) {
        bestAmount = amount;
        bestConfidence = 0.9;
        extracted.push(match[0]);
      }
    }

    // Pattern 3: Numbers with k/m multipliers (5k, 2.5m, 1.5K)
    const multiplierPattern = /([0-9,]+(?:\.[0-9]+)?)\s*([km])\b/gi;
    while ((match = multiplierPattern.exec(text)) !== null) {
      const baseAmount = parseFloat(match[1].replace(/,/g, ''));
      const multiplier = match[2].toLowerCase() === 'k' ? 1000 : 1000000;
      const amount = baseAmount * multiplier;
      if (!isNaN(amount) && (amount > bestAmount || bestConfidence < 0.85)) {
        bestAmount = amount;
        bestConfidence = 0.85;
        extracted.push(match[0]);
      }
    }

    // Pattern 4: Standalone numbers (fallback)
    const numberPattern = /\b([0-9,]+(?:\.[0-9]{1,2})?)\b/g;
    while ((match = numberPattern.exec(text)) !== null) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount) && amount > 0 && amount < 100000 && bestConfidence < 0.6) {
        bestAmount = amount;
        bestConfidence = 0.6;
        extracted.push(match[0]);
      }
    }

    // Pattern 5: Written numbers (twenty dollars, fifty bucks)
    const writtenNumberPattern = /\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)\s*(dollars?|bucks?)/g;
    while ((match = writtenNumberPattern.exec(text)) !== null) {
      const writtenNumber = this.writtenNumbers[match[1] as keyof typeof this.writtenNumbers];
      if (writtenNumber && (writtenNumber > bestAmount || bestConfidence < 0.8)) {
        bestAmount = writtenNumber;
        bestConfidence = 0.8;
        extracted.push(match[0]);
      }
    }

    // Pattern 6: Approximate amounts (around $20, about 15)
    const approximatePattern = /(?:around|about|approximately|roughly)\s*[\$€£¥₹₩]?\s*([0-9,]+(?:\.[0-9]{1,2})?)/g;
    while ((match = approximatePattern.exec(text)) !== null) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount) && (amount > bestAmount || bestConfidence < 0.75)) {
        bestAmount = amount;
        bestConfidence = 0.75;
        extracted.push(match[0]);
      }
    }

    return {
      amount: bestAmount,
      confidence: bestConfidence,
      extracted
    };
  }

  private static extractDescription(text: string, extractedAmounts: string[]): { description: string; confidence: number } {
    let cleanText = text;
    
    // Remove extracted amounts
    extractedAmounts.forEach(amount => {
      cleanText = cleanText.replace(amount, '');
    });

    // Remove common transaction words that don't add value
    const noiseWords = [
      'spent', 'paid', 'bought', 'purchased', 'for', 'on', 'at', 'in', 'to',
      'from', 'with', 'and', 'the', 'a', 'an', 'is', 'was', 'were', 'be',
      'today', 'yesterday', 'just', 'now', 'then'
    ];
    
    const words = cleanText.split(/\s+/).filter(word => {
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      return cleanWord.length > 0 && !noiseWords.includes(cleanWord);
    });

    const description = words.join(' ').trim();
    
    const confidence = description.length > 0 ? 
      Math.min(0.9, 0.5 + (description.length / 50)) : 0.1;

    return {
      description: description || 'Transaction',
      confidence
    };
  }

  private static detectTransactionType(text: string): { type: 'expense' | 'income'; confidence: number } {
    let incomeScore = 0;
    let expenseScore = 0;

    // Check for income keywords
    this.incomeKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        incomeScore += keyword.length > 5 ? 2 : 1;
      }
    });

    // Check for expense keywords
    this.expenseKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        expenseScore += keyword.length > 5 ? 2 : 1;
      }
    });

    // Verb-based analysis
    const incomeVerbs = ['earned', 'received', 'got', 'made', 'won', 'found'];
    const expenseVerbs = ['spent', 'paid', 'bought', 'purchased', 'lost', 'owe'];
    
    incomeVerbs.forEach(verb => {
      if (text.includes(verb)) incomeScore += 3;
    });
    
    expenseVerbs.forEach(verb => {
      if (text.includes(verb)) expenseScore += 3;
    });

    const totalScore = incomeScore + expenseScore;
    const type = incomeScore > expenseScore ? 'income' : 'expense';
    const confidence = totalScore > 0 ? 
      Math.max(incomeScore, expenseScore) / totalScore : 0.5;

    return {
      type,
      confidence: Math.min(0.95, confidence)
    };
  }

  private static suggestCategory(text: string, type: 'expense' | 'income' = 'expense'): { category: string; confidence: number } {
    let bestCategory = 'Other';
    let bestScore = 0;
    let totalMatches = 0;

    // First check merchant categories for exact matches
    for (const [merchant, category] of Object.entries(this.merchantCategories)) {
      if (text.includes(merchant)) {
        return { category, confidence: 0.95 };
      }
    }

    // Then check keyword-based categories
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      let categoryScore = 0;
      
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          // Weight longer keywords more heavily
          const weight = Math.max(1, keyword.length / 5);
          categoryScore += weight;
          totalMatches++;
        }
      });

      if (categoryScore > bestScore) {
        bestScore = categoryScore;
        bestCategory = category;
      }
    }

    // Special handling for income
    if (type === 'income') {
      bestCategory = 'Income';
      return { category: bestCategory, confidence: 0.8 };
    }

    const confidence = totalMatches > 0 ? 
      Math.min(0.9, 0.4 + (bestScore / totalMatches * 0.5)) : 0.3;

    return {
      category: bestCategory,
      confidence
    };
  }

  private static extractMerchant(text: string): { merchant?: string } {
    // Check for known merchants
    for (const merchant of Object.keys(this.merchantCategories)) {
      if (text.includes(merchant)) {
        return { merchant: merchant.charAt(0).toUpperCase() + merchant.slice(1) };
      }
    }

    // Extract potential merchant names (proper nouns)
    const words = text.split(/\s+/);
    const capitalizedWords = words.filter(word => 
      /^[A-Z][a-z]+/.test(word) && word.length > 2
    );

    if (capitalizedWords.length > 0) {
      return { merchant: capitalizedWords[0] };
    }

    return {};
  }

  private static generateReasoning(
    text: string, 
    amountResult: any, 
    categoryResult: any, 
    typeResult: any
  ): string {
    const reasons = [];
    
    if (amountResult.confidence > 0.8) {
      reasons.push(`Amount detected with high confidence`);
    } else if (amountResult.confidence > 0.5) {
      reasons.push(`Amount detected with medium confidence`);
    }

    if (categoryResult.confidence > 0.8) {
      reasons.push(`Category matched based on keywords`);
    }

    if (typeResult.confidence > 0.7) {
      reasons.push(`Transaction type determined from context`);
    }

    return reasons.join('. ') || 'Basic parsing applied';
  }

  static getOverallConfidence(confidence: ParsedExpense['confidence']): number {
    return (confidence.amount + confidence.description + confidence.category + confidence.type) / 4;
  }

  static getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  }

  static getConfidenceColor(confidence: number): string {
    const level = this.getConfidenceLevel(confidence);
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
    }
  }
}