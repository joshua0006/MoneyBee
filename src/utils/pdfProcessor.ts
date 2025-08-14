import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker with proper fallback handling
let workerInitialized = false;

function initializePDFWorker(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (workerInitialized) {
      resolve();
      return;
    }

    if (typeof window === 'undefined') {
      reject(new Error('PDF processing is only available in browser environment'));
      return;
    }

    try {
      const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      console.log(`Initializing PDF.js worker from: ${workerSrc}`);
      
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
      
      // Test worker by creating a simple document
      const testData = new Uint8Array([
        0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, // %PDF-1.4
        0x0a, 0x31, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, // \n1 0 obj
        0x0a, 0x3c, 0x3c, 0x0a, 0x2f, 0x54, 0x79, 0x70, // \n<<\n/Typ
        0x65, 0x20, 0x2f, 0x43, 0x61, 0x74, 0x61, 0x6c, // e /Catal
        0x6f, 0x67, 0x0a, 0x3e, 0x3e, 0x0a, 0x65, 0x6e, // og\n>>\nen
        0x64, 0x6f, 0x62, 0x6a, 0x0a, 0x78, 0x72, 0x65, // dobj\nxre
        0x66, 0x0a, 0x30, 0x20, 0x32, 0x0a, 0x30, 0x30, // f\n0 2\n00
        0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, // 00000000
        0x20, 0x36, 0x35, 0x35, 0x33, 0x35, 0x20, 0x66, //  65535 f
        0x20, 0x0a, 0x74, 0x72, 0x61, 0x69, 0x6c, 0x65, //  \ntraile
        0x72, 0x0a, 0x3c, 0x3c, 0x0a, 0x2f, 0x53, 0x69, // r\n<<\n/Si
        0x7a, 0x65, 0x20, 0x32, 0x0a, 0x2f, 0x52, 0x6f, // ze 2\n/Ro
        0x6f, 0x74, 0x20, 0x31, 0x20, 0x30, 0x20, 0x52, // ot 1 0 R
        0x0a, 0x3e, 0x3e, 0x0a, 0x73, 0x74, 0x61, 0x72, // \n>>\nstar
        0x74, 0x78, 0x72, 0x65, 0x66, 0x0a, 0x39, 0x0a, // txref\n9\n
        0x25, 0x25, 0x45, 0x4f, 0x46 // %%EOF
      ]);

      pdfjsLib.getDocument({ data: testData }).promise
        .then(() => {
          console.log('PDF.js worker initialized successfully');
          workerInitialized = true;
          resolve();
        })
        .catch((error) => {
          console.error('PDF.js worker test failed:', error);
          reject(new Error(`PDF worker initialization failed: ${error.message}`));
        });
      
    } catch (error) {
      console.error('Failed to initialize PDF.js worker:', error);
      reject(new Error(`PDF worker setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
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
      
      // Initialize worker first
      await initializePDFWorker();
      
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
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/cmaps/',
        cMapPacked: true
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
        } else if (error.message.includes('network')) {
          throw new Error('Network error while loading PDF worker. Please check your internet connection.');
        } else if (error.message.includes('worker')) {
          throw new Error('PDF processing service is unavailable. Please try again later.');
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