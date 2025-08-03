import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FallbackRequest {
  text: string;
  localCategory: string;
  localConfidence: number;
}

interface FallbackResponse {
  suggestedCategory: string;
  confidence: number;
  reasoning: string;
  shouldUpdate: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, localCategory, localConfidence }: FallbackRequest = await req.json()

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Missing text parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Only use OpenAI fallback if local parser suggested "Other" with low confidence
    if (localCategory !== 'Other' || localConfidence > 0.6) {
      return new Response(
        JSON.stringify({ 
          suggestedCategory: localCategory,
          confidence: localConfidence,
          reasoning: 'Local parser confidence sufficient',
          shouldUpdate: false
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

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

    const categories = [
      'Food', 'Entertainment', 'Transport', 'Groceries', 'Housing', 'Clothing', 
      'Utilities', 'Health', 'Education', 'Insurance', 'Tax', 'Work', 'Donations', 'Other'
    ]

    const prompt = `You are categorizing an expense that a local parser couldn't confidently categorize.

Text: "${text}"
Available categories: ${categories.join(', ')}

The local parser suggested "Other" with low confidence. Please suggest a better category if possible.

Return ONLY a JSON object with this structure:
{
  "suggestedCategory": "<category from the list>",
  "confidence": <0-1 confidence score>,
  "reasoning": "<brief explanation>",
  "shouldUpdate": <true if you suggest a different category than Other>
}

Focus on finding the most appropriate category. If truly unclear, keep "Other" but explain why.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 200
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

    let fallbackResult: FallbackResponse
    try {
      // Clean and parse JSON response
      let cleanContent = content.trim()
      cleanContent = cleanContent.replace(/```json\n?|\n?```|```\n?/g, '')
      
      const jsonStart = cleanContent.indexOf('{')
      const jsonEnd = cleanContent.lastIndexOf('}')
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1)
      }
      
      const rawResult = JSON.parse(cleanContent)
      
      fallbackResult = {
        suggestedCategory: String(rawResult.suggestedCategory || 'Other'),
        confidence: Number(rawResult.confidence) || 0.5,
        reasoning: String(rawResult.reasoning || 'AI categorization'),
        shouldUpdate: Boolean(rawResult.shouldUpdate) || false
      }
      
      console.log('OpenAI fallback result:', JSON.stringify(fallbackResult, null, 2))
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', {
        error: parseError.message,
        rawContent: content
      })
      throw new Error(`Failed to parse OpenAI response: ${parseError.message}`)
    }

    // Validate the suggested category
    if (!categories.includes(fallbackResult.suggestedCategory)) {
      fallbackResult.suggestedCategory = 'Other'
      fallbackResult.shouldUpdate = false
      fallbackResult.reasoning = 'Invalid category suggested, defaulting to Other'
    }

    return new Response(
      JSON.stringify(fallbackResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in parse-expense-fallback function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process fallback request', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})