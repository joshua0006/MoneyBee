import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  processing: boolean;
  error?: string;
}

export class OCRService {
  private static worker: Tesseract.Worker | null = null;

  static async initializeWorker(): Promise<void> {
    if (this.worker) return;

    try {
      this.worker = await Tesseract.createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      // Configure for receipt optimization
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,()-$€£¥₹ ',
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        preserve_interword_spaces: '1',
      });
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      throw error;
    }
  }

  static async processImage(
    imageFile: File,
    onProgress?: (progress: number) => void
  ): Promise<OCRResult> {
    try {
      await this.initializeWorker();
      
      if (!this.worker) {
        throw new Error('OCR worker not initialized');
      }

      // Preprocess image for better OCR results
      const processedImage = await this.preprocessImage(imageFile);

      const { data } = await this.worker.recognize(processedImage);

      return {
        text: data.text.trim(),
        confidence: data.confidence,
        processing: false,
      };
    } catch (error) {
      console.error('OCR processing failed:', error);
      return {
        text: '',
        confidence: 0,
        processing: false,
        error: error instanceof Error ? error.message : 'OCR processing failed',
      };
    }
  }

  private static async preprocessImage(file: File): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply contrast and brightness adjustments
        for (let i = 0; i < data.length; i += 4) {
          // Increase contrast and brightness for better OCR
          const contrast = 1.2;
          const brightness = 10;

          data[i] = Math.min(255, Math.max(0, contrast * (data[i] - 128) + 128 + brightness)); // Red
          data[i + 1] = Math.min(255, Math.max(0, contrast * (data[i + 1] - 128) + 128 + brightness)); // Green
          data[i + 2] = Math.min(255, Math.max(0, contrast * (data[i + 2] - 128) + 128 + brightness)); // Blue
        }

        // Put the processed image data back
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  static async terminateWorker(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }

  static extractReceiptData(text: string): {
    merchant?: string;
    total?: number;
    date?: string;
    items?: string[];
  } {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Find merchant (usually at the top)
    const merchant = lines[0]?.trim();

    // Find total amount
    const totalRegex = /(?:total|sum|amount)[:\s]*\$?([0-9]+\.?[0-9]*)/i;
    let total: number | undefined;
    
    for (const line of lines) {
      const match = line.match(totalRegex);
      if (match) {
        total = parseFloat(match[1]);
        break;
      }
    }

    // Find date
    const dateRegex = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/;
    let date: string | undefined;
    
    for (const line of lines) {
      const match = line.match(dateRegex);
      if (match) {
        date = match[1];
        break;
      }
    }

    // Extract items (simple heuristic)
    const items = lines.filter(line => {
      const hasPrice = /\$?[0-9]+\.?[0-9]*/.test(line);
      const notTotal = !totalRegex.test(line);
      const notDate = !dateRegex.test(line);
      return hasPrice && notTotal && notDate && line.length > 3;
    });

    return {
      merchant: merchant || undefined,
      total,
      date,
      items: items.length > 0 ? items : undefined,
    };
  }
}