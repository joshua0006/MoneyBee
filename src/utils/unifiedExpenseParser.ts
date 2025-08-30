// Unified expense parser combining local parsing with AI fallback
import { EXPENSE_CATEGORIES, CATEGORY_KEYWORDS, suggestCategoryFromDescription } from '@/utils/categories';
import { supabase } from '@/integrations/supabase/client';

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
    overall: number;
  };
  merchant?: string;
  reasoning?: string;
  parsingMethod: 'local' | 'ai_enhanced' | 'manual_fallback';
}

export interface ParsingOptions {
  useAIFallback?: boolean;
  confidenceThreshold?: number;
  enableRealTimeValidation?: boolean;
}

export class UnifiedExpenseParser {
  private static readonly CONFIDENCE_THRESHOLD = 0.7;
  private static readonly AI_FALLBACK_THRESHOLD = 0.5;
  
  // Consolidated patterns from both parsers
  private static readonly patterns = {
    currency: /[\$€£¥₹₩]\s*([0-9,]+(?:\.[0-9]{1,2})?)/g,
    numberCurrency: /([0-9,]+(?:\.[0-9]{1,2})?)\s*(dollars?|bucks?|euros?|pounds?|sgd)/gi,
    multiplier: /([0-9,]+(?:\.[0-9]+)?)\s*([km])\b/gi,
    approximate: /(?:around|about|approximately|roughly)\s*[\$€£¥₹₩]?\s*([0-9,]+(?:\.[0-9]{1,2})?)/gi,
    standalone: /\b([0-9,]+(?:\.[0-9]{1,2})?)\b/g
  };

  // Enhanced Singapore-specific merchants
  private static readonly merchantCategories = {
    // Local Food
    'kopitiam': 'Food & Dining', 'hawker': 'Food & Dining', 'food court': 'Food & Dining',
    'ya kun': 'Food & Dining', 'toast box': 'Food & Dining', 'din tai fung': 'Food & Dining',
    'newton': 'Food & Dining', 'lau pa sat': 'Food & Dining', 'maxwell': 'Food & Dining',
    'old airport road': 'Food & Dining', 'tiong bahru': 'Food & Dining',
    
    // Local Transport
    'grab': 'Transportation', 'gojek': 'Transportation', 'comfort': 'Transportation',
    'mrt': 'Transportation', 'lrt': 'Transportation', 'ez link': 'Transportation',
    'cepas': 'Transportation', 'smrt': 'Transportation', 'sbs transit': 'Transportation',
    
    // Local Grocery
    'ntuc': 'Groceries', 'fairprice': 'Groceries', 'cold storage': 'Groceries',
    'giant': 'Groceries', 'sheng siong': 'Groceries', 'redmart': 'Groceries',
    
    // Local Health
    'guardian': 'Health', 'watsons': 'Health', 'unity': 'Health',
    'polyclinic': 'Health', 'sgh': 'Health', 'nuh': 'Health', 'ttsh': 'Health',
    
    // Local Utilities
    'sp group': 'Utilities', 'city gas': 'Utilities', 'pub': 'Utilities',
    'singtel': 'Utilities', 'starhub': 'Utilities', 'm1': 'Utilities',
    
    // International chains
    'starbucks': 'Food & Dining', 'mcdonalds': 'Food & Dining', 'kfc': 'Food & Dining',
    'uber': 'Transportation', 'netflix': 'Entertainment', 'spotify': 'Entertainment'
  };

  static async parseExpenseText(
    text: string, 
    options: ParsingOptions = {}
  ): Promise<ParsedExpense> {
    const { 
      useAIFallback = true, 
      confidenceThreshold = this.CONFIDENCE_THRESHOLD,
      enableRealTimeValidation = true 
    } = options;

    // Step 1: Local parsing
    const localResult = this.performLocalParsing(text);
    
    // Step 2: Validate and potentially enhance with AI
    if (useAIFallback && localResult.confidence.overall < this.AI_FALLBACK_THRESHOLD) {
      try {
        const aiResult = await this.performAIParsing(text, localResult);
        return { ...aiResult, parsingMethod: 'ai_enhanced' };
      } catch (error) {
        console.warn('AI parsing failed, using local result:', error);
        return { ...localResult, parsingMethod: 'local' };
      }
    }
    
    return { ...localResult, parsingMethod: 'local' };
  }

  private static performLocalParsing(text: string): ParsedExpense {
    const normalizedText = text.toLowerCase().trim();
    
    // Extract components
    const amountResult = this.extractAmount(normalizedText);
    const typeResult = this.detectTransactionType(normalizedText);
    const categoryResult = this.suggestCategory(normalizedText, typeResult.type);
    const descriptionResult = this.extractDescription(normalizedText, amountResult.extractedText);
    const merchantResult = this.extractMerchant(normalizedText);
    
    // Calculate overall confidence
    const confidenceScores = {
      amount: amountResult.confidence,
      description: descriptionResult.confidence,
      category: categoryResult.confidence,
      type: typeResult.confidence,
      overall: 0
    };
    
    confidenceScores.overall = this.calculateOverallConfidence(confidenceScores);
    
    return {
      amount: amountResult.amount,
      description: descriptionResult.description,
      category: categoryResult.category,
      type: typeResult.type,
      confidence: confidenceScores,
      merchant: merchantResult.merchant,
      reasoning: this.generateReasoning(normalizedText, confidenceScores),
      parsingMethod: 'local'
    };
  }

  private static async performAIParsing(text: string, localResult: ParsedExpense): Promise<ParsedExpense> {
    const { data, error } = await supabase.functions.invoke('parse-expense', {
      body: { text, categories: EXPENSE_CATEGORIES }
    });

    if (error) throw error;
    
    // Merge AI result with local result, preferring higher confidence values
    const mergedResult: ParsedExpense = {
      amount: data.confidence.amount > localResult.confidence.amount ? data.amount : localResult.amount,
      description: data.confidence.description > localResult.confidence.description ? data.description : localResult.description,
      category: data.confidence.category > localResult.confidence.category ? data.category : localResult.category,
      type: data.confidence.type > localResult.confidence.type ? data.type : localResult.type,
      confidence: {
        amount: Math.max(data.confidence.amount, localResult.confidence.amount),
        description: Math.max(data.confidence.description, localResult.confidence.description),
        category: Math.max(data.confidence.category, localResult.confidence.category),
        type: Math.max(data.confidence.type, localResult.confidence.type),
        overall: 0
      },
      merchant: data.merchant || localResult.merchant,
      reasoning: data.reasoning || localResult.reasoning,
      parsingMethod: 'ai_enhanced'
    };
    
    mergedResult.confidence.overall = this.calculateOverallConfidence(mergedResult.confidence);
    
    return mergedResult;
  }

  private static extractAmount(text: string): { amount: number; confidence: number; extractedText: string[] } {
    const extracted: string[] = [];
    let bestAmount = 0;
    let bestConfidence = 0;

    // Try each pattern in order of confidence
    const patternTests = [
      { pattern: this.patterns.currency, confidence: 0.95 },
      { pattern: this.patterns.numberCurrency, confidence: 0.9 },
      { pattern: this.patterns.multiplier, confidence: 0.85 },
      { pattern: this.patterns.approximate, confidence: 0.75 },
      { pattern: this.patterns.standalone, confidence: 0.6 }
    ];

    for (const { pattern, confidence } of patternTests) {
      let match;
      pattern.lastIndex = 0; // Reset regex
      
      while ((match = pattern.exec(text)) !== null) {
        let amount = parseFloat(match[1].replace(/,/g, ''));
        
        // Handle multipliers
        if (pattern === this.patterns.multiplier) {
          const multiplier = match[2].toLowerCase() === 'k' ? 1000 : 1000000;
          amount *= multiplier;
        }
        
        if (!isNaN(amount) && amount > 0 && amount < 1000000) {
          if (amount > bestAmount || (amount === bestAmount && confidence > bestConfidence)) {
            bestAmount = amount;
            bestConfidence = confidence;
            extracted.push(match[0]);
          }
        }
      }
      
      if (bestAmount > 0 && bestConfidence >= confidence) break;
    }

    return { amount: bestAmount, confidence: bestConfidence, extractedText: extracted };
  }

  private static detectTransactionType(text: string): { type: 'expense' | 'income'; confidence: number } {
    const incomeKeywords = ['salary', 'wage', 'income', 'earned', 'received', 'bonus', 'refund', 'sold', 'commission'];
    const expenseKeywords = ['bought', 'paid', 'spent', 'cost', 'bill', 'fee', 'subscription', 'rent'];
    
    let incomeScore = 0;
    let expenseScore = 0;

    incomeKeywords.forEach(keyword => {
      if (text.includes(keyword)) incomeScore += keyword.length > 5 ? 2 : 1;
    });

    expenseKeywords.forEach(keyword => {
      if (text.includes(keyword)) expenseScore += keyword.length > 5 ? 2 : 1;
    });

    const type = incomeScore > expenseScore ? 'income' : 'expense';
    const totalScore = incomeScore + expenseScore;
    const confidence = totalScore > 0 ? Math.max(incomeScore, expenseScore) / totalScore : 0.5;

    return { type, confidence: Math.min(0.95, confidence) };
  }

  private static suggestCategory(text: string, type: 'expense' | 'income'): { category: string; confidence: number } {
    if (type === 'income') {
      return { category: 'Income', confidence: 0.8 };
    }

    // Check merchants first (highest confidence)
    for (const [merchant, category] of Object.entries(this.merchantCategories)) {
      if (text.includes(merchant)) {
        return { category, confidence: 0.95 };
      }
    }

    // Use existing category suggestion logic
    const suggestedCategory = suggestCategoryFromDescription(text);
    const confidence = suggestedCategory === 'Other' ? 0.3 : 0.7;
    
    return { category: suggestedCategory, confidence };
  }

  private static extractDescription(text: string, extractedAmounts: string[]): { description: string; confidence: number } {
    let cleanText = text;
    
    // Remove amounts and noise words
    extractedAmounts.forEach(amount => {
      cleanText = cleanText.replace(amount, '');
    });

    const noiseWords = ['spent', 'paid', 'bought', 'for', 'on', 'at', 'in', 'to', 'the', 'a', 'an'];
    const words = cleanText.split(/\s+/).filter(word => {
      const clean = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      return clean.length > 0 && !noiseWords.includes(clean);
    });

    const description = words.join(' ').trim() || 'Transaction';
    const confidence = Math.min(0.9, 0.4 + (description.length / 30));

    return { description, confidence };
  }

  private static extractMerchant(text: string): { merchant?: string } {
    // Check known merchants
    for (const merchant of Object.keys(this.merchantCategories)) {
      if (text.includes(merchant)) {
        return { merchant: merchant.charAt(0).toUpperCase() + merchant.slice(1) };
      }
    }

    // Extract potential merchant (capitalized words)
    const words = text.split(/\s+/);
    const merchantCandidate = words.find(word => /^[A-Z][a-z]+/.test(word) && word.length > 2);
    
    return merchantCandidate ? { merchant: merchantCandidate } : {};
  }

  private static calculateOverallConfidence(confidence: Omit<ParsedExpense['confidence'], 'overall'>): number {
    const weights = { amount: 0.4, description: 0.2, category: 0.3, type: 0.1 };
    return (
      confidence.amount * weights.amount +
      confidence.description * weights.description +
      confidence.category * weights.category +
      confidence.type * weights.type
    );
  }

  private static generateReasoning(text: string, confidence: ParsedExpense['confidence']): string {
    const reasons = [];
    
    if (confidence.amount > 0.8) reasons.push('Amount clearly identified');
    if (confidence.category > 0.8) reasons.push('Category matched from context');
    if (confidence.overall < 0.5) reasons.push('Low confidence - manual review suggested');
    
    return reasons.join('. ') || 'Basic parsing applied';
  }

  // Utility methods
  static getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  }

  static getConfidenceColor(confidence: number): string {
    const level = this.getConfidenceLevel(confidence);
    return {
      'high': 'bg-success/10 text-success border-success/20',
      'medium': 'bg-warning/10 text-warning border-warning/20',
      'low': 'bg-destructive/10 text-destructive border-destructive/20'
    }[level];
  }

  static validateParsedExpense(parsed: ParsedExpense): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!parsed.amount || parsed.amount <= 0) errors.push('Invalid amount');
    if (!parsed.description || parsed.description.trim().length === 0) errors.push('Missing description');
    if (!EXPENSE_CATEGORIES.includes(parsed.category as any)) errors.push('Invalid category');
    if (parsed.confidence.overall < 0.3) errors.push('Very low confidence');
    
    return { isValid: errors.length === 0, errors };
  }
}