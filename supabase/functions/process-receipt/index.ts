import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessReceiptRequest {
  ocrText: string;
  merchantData?: {
    merchant?: string;
    total?: number;
    date?: string;
    items?: string[];
  };
}

interface ProcessReceiptResponse {
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
  date?: string;
  reasoning?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ocrText, merchantData }: ProcessReceiptRequest = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Processing receipt with OCR text:', ocrText.substring(0, 200));

    const prompt = `
You are an expert at parsing receipt and expense data. Parse the following receipt text and extract structured expense information.

OCR Text:
${ocrText}

Additional merchant data (if available):
${merchantData ? JSON.stringify(merchantData, null, 2) : 'None'}

Instructions:
1. Extract the total amount spent (this should be the final total, not individual items)
2. Determine an appropriate description based on the merchant and items
3. Categorize the expense using these categories:
   - Food (restaurants, groceries, cafes)
   - Transportation (gas, uber, parking, public transport)
   - Shopping (retail, clothing, electronics)
   - Entertainment (movies, concerts, games)
   - Healthcare (medical, pharmacy, dental)
   - Utilities (phone, internet, electricity)
   - Travel (hotels, flights, vacation)
   - Education (books, courses, tuition)
   - Business (office supplies, software, meetings)
   - Other (anything else)

4. This should almost always be an expense (not income)
5. Provide confidence scores (0-1) for each field
6. Include the merchant name if clearly identifiable
7. Extract the date if available in a standard format

Respond with valid JSON only:
{
  "amount": number,
  "description": "string",
  "category": "string",
  "type": "expense",
  "confidence": {
    "amount": number,
    "description": number,
    "category": number,
    "type": number
  },
  "merchant": "string or null",
  "date": "YYYY-MM-DD or null",
  "reasoning": "Brief explanation of parsing decisions"
}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a receipt parsing expert. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log('OpenAI response:', content);

    // Parse the JSON response
    let parsedExpense: ProcessReceiptResponse;
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsedExpense = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Invalid response format from AI');
    }

    // Validate required fields
    if (!parsedExpense.amount || !parsedExpense.description || !parsedExpense.category) {
      throw new Error('Missing required fields in parsed response');
    }

    console.log('Successfully parsed expense:', parsedExpense);

    return new Response(JSON.stringify(parsedExpense), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-receipt function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});