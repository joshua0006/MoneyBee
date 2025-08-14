import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing PDF text extraction request');

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('File must be a PDF document');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('PDF file is too large (maximum 10MB)');
    }

    console.log(`Processing PDF file: ${file.name} (${file.size} bytes)`);

    // Convert file to base64 for processing
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Use a PDF processing API service
    const response = await fetch('https://api.pdf.co/v1/pdf/convert/to/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'demo' // Using demo key - would need proper API key for production
      },
      body: JSON.stringify({
        file: `data:application/pdf;base64,${base64}`,
        pages: '1-10', // Limit to first 10 pages
        async: false
      })
    });

    if (!response.ok) {
      // Fallback: Try to extract basic text using simple parsing
      console.log('PDF.co API failed, attempting basic text extraction');
      
      // Convert PDF bytes to string and look for text patterns
      const pdfText = new TextDecoder().decode(arrayBuffer);
      const textMatches = pdfText.match(/\(([^)]+)\)/g) || [];
      
      let extractedText = textMatches
        .map(match => match.slice(1, -1)) // Remove parentheses
        .filter(text => text.length > 2 && /[a-zA-Z]/.test(text)) // Filter meaningful text
        .join(' ');

      if (!extractedText || extractedText.length < 10) {
        throw new Error('Could not extract readable text from PDF. The file might be image-based or corrupted.');
      }

      return new Response(JSON.stringify({ 
        text: extractedText,
        method: 'basic_extraction'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();
    
    if (!result.body || result.body.length < 10) {
      throw new Error('No readable text found in PDF. The file might be image-based or scanned.');
    }

    console.log(`Successfully extracted ${result.body.length} characters from PDF`);

    return new Response(JSON.stringify({ 
      text: result.body,
      method: 'pdf_co_api'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-pdf-text function:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to process PDF file'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});