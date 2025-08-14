import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js to use local worker bundled with the library
if (typeof window !== 'undefined') {
  // Use the bundled worker that comes with pdfjs-dist
  // This avoids CDN loading issues
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url
  ).toString();
  
  console.log('PDF.js worker configured to use local bundled worker');
}

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
      console.log(`Starting PDF processing for file: ${file.name} (${file.size} bytes)`);
      
      // Validate file
      if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('File must be a PDF document');
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        throw new Error('PDF file is too large (maximum 50MB)');
      }
      
      console.log('Converting file to array buffer...');
      const arrayBuffer = await file.arrayBuffer();
      
      if (arrayBuffer.byteLength === 0) {
        throw new Error('PDF file appears to be empty');
      }
      
      console.log('Loading PDF document...');
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        // Remove external cMap dependency to avoid network issues
        disableFontFace: true,
      }).promise;
      
      console.log(`PDF loaded successfully. Pages: ${pdf.numPages}`);
      
      if (pdf.numPages === 0) {
        throw new Error('PDF file contains no pages');
      }
      
      let fullText = '';
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`Processing page ${pageNum}/${pdf.numPages}`);
        
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .map((item: any) => {
              if (item && typeof item.str === 'string') {
                return item.str;
              }
              return '';
            })
            .filter(str => str.length > 0)
            .join(' ');
          
          if (pageText.trim()) {
            fullText += pageText + '\n';
          }
          
          // Clean up page resources
          page.cleanup();
        } catch (pageError) {
          console.warn(`Error processing page ${pageNum}:`, pageError);
          // Continue with other pages
        }
      }
      
      // Clean up PDF resources
      pdf.destroy();
      
      if (!fullText.trim()) {
        throw new Error('No text content found in PDF. The file might be image-based or corrupted.');
      }
      
      console.log(`PDF processing completed. Extracted ${fullText.length} characters from ${pdf.numPages} pages`);
      return fullText;
      
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      
      if (error instanceof Error) {
        // Provide more specific error messages
        if (error.message.includes('Invalid PDF')) {
          throw new Error('Invalid PDF file. Please ensure the file is not corrupted.');
        } else if (error.message.includes('password')) {
          throw new Error('Password-protected PDFs are not supported.');
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