import * as pdfjsLib from 'pdfjs-dist';

// Set worker path for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
      }
      
      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF file');
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