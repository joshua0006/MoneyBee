import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js with a minimal inline worker to avoid loading issues
if (typeof window !== 'undefined') {
  // Create a minimal worker using data URL to avoid fetch issues
  const workerCode = `
    importScripts('https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js');
  `;
  const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(workerBlob);
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  
  console.log('PDF.js worker configured with blob URL');
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
      
      if (file.size > 10 * 1024 * 1024) { // Reduce to 10MB limit for stability
        throw new Error('PDF file is too large (maximum 10MB)');
      }
      
      console.log('Converting file to array buffer...');
      const arrayBuffer = await file.arrayBuffer();
      
      if (arrayBuffer.byteLength === 0) {
        throw new Error('PDF file appears to be empty');
      }
      
      console.log('Loading PDF document without worker...');
      // Simplified configuration without worker dependencies
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        disableFontFace: true,
        disableAutoFetch: true,
        disableStream: true
      }).promise;
      
      console.log(`PDF loaded successfully. Pages: ${pdf.numPages}`);
      
      if (pdf.numPages === 0) {
        throw new Error('PDF file contains no pages');
      }
      
      let fullText = '';
      const maxPages = Math.min(pdf.numPages, 10); // Limit to first 10 pages for stability
      
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        console.log(`Processing page ${pageNum}/${maxPages}`);
        
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .map((item: any) => {
              if (item && typeof item.str === 'string' && item.str.trim()) {
                return item.str;
              }
              return '';
            })
            .filter(str => str.length > 0)
            .join(' ');
          
          if (pageText.trim()) {
            fullText += pageText + '\n\n';
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
        throw new Error('No text content found in PDF. The file might be image-based, scanned, or corrupted.');
      }
      
      console.log(`PDF processing completed. Extracted ${fullText.length} characters from ${maxPages} pages`);
      return fullText.trim();
      
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid PDF') || error.message.includes('PDF header')) {
          throw new Error('Invalid PDF file. Please ensure the file is not corrupted.');
        } else if (error.message.includes('password') || error.message.includes('encrypted')) {
          throw new Error('Password-protected or encrypted PDFs are not supported.');
        } else if (error.message.includes('too large')) {
          throw new Error('PDF file is too large. Please try a smaller file (max 10MB).');
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