import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BankTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  category?: string;
  confidence: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, format, filename } = await req.json();

    if (!text || text.trim().length === 0) {
      throw new Error('No text content provided');
    }

    console.log(`Processing ${format} statement from ${filename}`);

    const systemPrompt = `You are an expert at parsing bank and credit card statements. Extract individual transactions from the provided statement text.

For each transaction, provide:
- date: in YYYY-MM-DD format
- description: clean merchant/transaction description
- amount: positive number (we'll determine expense vs income from context)
- type: "expense" or "income" (deposits/credits are income, withdrawals/purchases are expenses)
- category: best guess from: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Education, Travel, Business, Personal Care, Gifts & Donations, Other
- confidence: 0.0-1.0 confidence score

Rules:
1. Only extract actual transactions, not summaries or balances
2. Skip duplicate entries, headers, footers, and promotional text
3. For credit cards: purchases are expenses, payments/credits are income
4. For bank accounts: withdrawals/debits are expenses, deposits are income
5. Clean up merchant names (remove locations, reference numbers)
6. Be conservative with confidence scores

Return a JSON object with a "transactions" array.`;

    const userPrompt = `Parse this ${format} statement and extract all transactions:

${text}

Format: ${format}
Filename: ${filename}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Failed to parse AI response');
    }

    const transactions: BankTransaction[] = parsedResult.transactions || [];
    
    // Validate and clean transactions
    const validTransactions = transactions
      .filter(txn => {
        return txn.date && 
               txn.description && 
               typeof txn.amount === 'number' && 
               txn.amount > 0 &&
               ['expense', 'income'].includes(txn.type);
      })
      .map(txn => ({
        ...txn,
        description: txn.description.trim(),
        confidence: Math.max(0, Math.min(1, txn.confidence || 0.5))
      }));

    console.log(`Successfully parsed ${validTransactions.length} transactions`);

    return new Response(JSON.stringify({
      transactions: validTransactions,
      summary: {
        total: validTransactions.length,
        expenses: validTransactions.filter(t => t.type === 'expense').length,
        income: validTransactions.filter(t => t.type === 'income').length,
        format: format
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing bank statement:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      transactions: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});