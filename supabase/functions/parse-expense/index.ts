import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ParseExpenseRequest {
  text: string;
  categories: string[];
}

interface ParsedExpenseResponse {
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, categories }: ParseExpenseRequest = await req.json()

    if (!text || !categories) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get OpenAI API key from Supabase secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const prompt = `You are an expert financial expense parser. Parse the following text into a structured expense:

Text: "${text}"

Available categories: ${categories.join(', ')}

Extract and return ONLY a JSON object with this exact structure:
{
  "amount": <number>,
  "description": "<clean, concise description>",
  "category": "<category from the list above>",
  "type": "<expense or income>",
  "confidence": {
    "amount": <0-1 confidence score>,
    "description": <0-1 confidence score>,
    "category": <0-1 confidence score>,
    "type": <0-1 confidence score>
  },
  "merchant": "<merchant/store name if identifiable>",
  "reasoning": "<brief explanation of categorization>"
}

Rules:
- Amount should be a positive number (extract from text like "$5", "5 bucks", "twenty dollars", "around 15", etc.)
- Description should be clean and descriptive (e.g., "Coffee at Starbucks" not "coffee 5 bucks starbucks")
- Category MUST be one from the provided list
- Type should be "expense" for spending or "income" for earnings
- Confidence scores should reflect how certain you are (0.0-1.0)
- Merchant should be the business name if identifiable
- If multiple expenses, parse the first/main one

Examples:
- "coffee 5 bucks starbucks" → amount: 5, description: "Coffee at Starbucks", category: "Food & Dining"
- "uber ride downtown 12.50" → amount: 12.5, description: "Uber ride downtown", category: "Transportation"
- "salary deposit 2500" → amount: 2500, description: "Salary deposit", type: "income", category: "Other"`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const openaiData = await response.json()
    const content = openaiData.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response from OpenAI
    let parsedResult: ParsedExpenseResponse
    try {
      // Clean the response in case OpenAI adds extra formatting
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim()
      parsedResult = JSON.parse(cleanContent)
    } catch (parseError) {
      throw new Error(`Failed to parse OpenAI response: ${parseError.message}`)
    }

    // Validate the response structure
    if (!parsedResult.amount || !parsedResult.description || !parsedResult.category) {
      throw new Error('Invalid response structure from OpenAI')
    }

    return new Response(
      JSON.stringify(parsedResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in parse-expense function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to parse expense', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})