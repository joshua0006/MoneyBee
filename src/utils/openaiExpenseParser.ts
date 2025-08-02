import { supabase } from '@/integrations/supabase/client';

export interface OpenAIParsedExpense {
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

export class OpenAIExpenseParser {
  static async parseExpenseText(
    text: string, 
    categories: string[]
  ): Promise<OpenAIParsedExpense | null> {

    if (!text.trim()) {
      throw new Error('Empty text provided');
    }

    try {
      const { data, error } = await supabase.functions.invoke('parse-expense', {
        body: {
          text: text.trim(),
          categories
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to parse expense with OpenAI');
      }

      if (!data) {
        throw new Error('No data returned from OpenAI parser');
      }

      // Validate the response structure
      if (!this.isValidParsedExpense(data)) {
        throw new Error('Invalid response structure from OpenAI parser');
      }

      return data;
    } catch (error) {
      console.error('OpenAI parsing error:', error);
      throw error;
    }
  }

  private static isValidParsedExpense(data: any): data is OpenAIParsedExpense {
    return (
      data &&
      typeof data.amount === 'number' &&
      typeof data.description === 'string' &&
      typeof data.category === 'string' &&
      (data.type === 'expense' || data.type === 'income') &&
      data.confidence &&
      typeof data.confidence.amount === 'number' &&
      typeof data.confidence.description === 'number' &&
      typeof data.confidence.category === 'number' &&
      typeof data.confidence.type === 'number'
    );
  }

  static getOverallConfidence(confidence: OpenAIParsedExpense['confidence']): number {
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

  static isAvailable(): boolean {
    return true;
  }
}