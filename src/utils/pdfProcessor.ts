export interface BankTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  category?: string;
  confidence: number;
}

export class PDFProcessor {
  static async extractTextFromPDF(file: File): Promise<string> {
    try {
      console.log(`Starting server-side PDF processing for file: ${file.name} (${file.size} bytes)`);
      
      // Validate file
      if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('File must be a PDF document');
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('PDF file is too large (maximum 10MB)');
      }

      // Use Supabase client to invoke edge function
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!
      );

      const formData = new FormData();
      formData.append('file', file);

      const { data: result, error } = await supabase.functions.invoke('process-pdf-text', {
        body: formData,
      });

      if (error) {
        throw new Error(`Server error: ${error.message}`);
      }
      
      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.text || result.text.length < 10) {
        throw new Error('No readable text found in PDF. The file might be image-based or scanned.');
      }

      console.log(`PDF processing completed via ${result.method}. Extracted ${result.text.length} characters`);
      return result.text.trim();
      
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('too large')) {
          throw new Error('PDF file is too large. Please try a smaller file (max 10MB).');
        } else if (error.message.includes('Server error')) {
          throw new Error('PDF processing service is temporarily unavailable. Please try again later.');
        } else {
          throw new Error(`PDF processing failed: ${error.message}`);
        }
      } else {
        throw new Error('Failed to extract text from PDF file. Please try with a different file.');
      }
    }
  }

  static preprocessStatementText(text: string): string {
    // Remove common header/footer noise
    const lines = text.split('\n')
      .filter(line => {
        const trimmed = line.trim();
        // Filter out common header/footer patterns
        return trimmed.length > 0 &&
               !trimmed.match(/^page \d+/i) &&
               !trimmed.match(/^statement period/i) &&
               !trimmed.match(/^account summary/i) &&
               !trimmed.match(/^previous balance/i) &&
               !trimmed.match(/^current balance/i);
      });
    
    return lines.join('\n');
  }

  static detectStatementFormat(text: string): 'bank' | 'credit_card' | 'unknown' {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('checking') || lowerText.includes('savings') || lowerText.includes('deposit')) {
      return 'bank';
    } else if (lowerText.includes('credit card') || lowerText.includes('purchase') || lowerText.includes('payment due')) {
      return 'credit_card';
    }
    
    return 'unknown';
  }
}