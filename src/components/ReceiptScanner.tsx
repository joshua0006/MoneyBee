import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, X, Eye, EyeOff, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { OCRService, OCRResult } from '@/utils/ocrService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReceiptData {
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

interface ReceiptScannerProps {
  onExpenseExtracted: (expense: ReceiptData) => void;
  onClose: () => void;
}

export const ReceiptScanner: React.FC<ReceiptScannerProps> = ({
  onExpenseExtracted,
  onClose,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOcrText, setShowOcrText] = useState(false);
  const [editedText, setEditedText] = useState('');

  const { capturePhoto, selectFromGallery, isCapturing } = useCamera();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Focus management for accessibility
  useEffect(() => {
    if (isProcessing && statusRef.current) {
      statusRef.current.focus();
    }
  }, [isProcessing]);

  const handleCameraCapture = async () => {
    const result = await capturePhoto();
    if (result.dataUrl && result.file) {
      setImagePreview(result.dataUrl);
      await processImage(result.file);
    } else if (result.error) {
      toast.error(`Camera error: ${result.error}. Please try uploading an image instead.`);
    }
  };

  const handleGallerySelect = async () => {
    const result = await selectFromGallery();
    if (result.dataUrl && result.file) {
      setImagePreview(result.dataUrl);
      await processImage(result.file);
    } else if (result.error) {
      toast.error(`Gallery error: ${result.error}. Please check permissions and try again.`);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file (JPG, PNG, etc.)');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImagePreview(dataUrl);
        processImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setOcrProgress(0);

    try {
      // Upload image to Supabase storage first
      const fileName = `receipt_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        // Continue with OCR even if storage fails
      }

      // Process with OCR
      const result = await OCRService.processImage(file, setOcrProgress);
      setOcrResult(result);
      setEditedText(result.text);

      if (result.text && !result.error) {
        // Process with AI
        await processWithAI(result.text, fileName);
      } else {
        toast.error(result.error || 'OCR processing failed. You can manually enter the text.');
      }
    } catch (error) {
      console.error('Image processing error:', error);
      toast.error('Failed to process image. Please try again or manually enter the information.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processWithAI = async (ocrText: string, fileName?: string) => {
    try {
      setIsProcessing(true);

      // Use unified parser for consistent parsing
      const { UnifiedExpenseParser } = await import('@/utils/unifiedExpenseParser');
      const parsed = await UnifiedExpenseParser.parseExpenseText(ocrText, {
        useAIFallback: true,
        confidenceThreshold: 0.6,
        enableRealTimeValidation: true
      });

      const receiptData: ReceiptData = {
        amount: parsed.amount,
        description: parsed.description,
        category: parsed.category,
        type: parsed.type,
        confidence: parsed.confidence,
        merchant: parsed.merchant,
        reasoning: parsed.reasoning
      };

      // Add the storage file name if available
      if (fileName) {
        (receiptData as any).receiptImage = fileName;
      }

      toast.success(`Receipt processed successfully using ${parsed.parsingMethod} method!`);
      onExpenseExtracted(receiptData);

    } catch (error) {
      console.error('Unified parsing error:', error);
      toast.error('Failed to process receipt. Please check the extracted text and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryWithEditedText = async () => {
    if (editedText.trim()) {
      await processWithAI(editedText.trim());
    } else {
      toast.error('Please enter some text to process');
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle2 className="w-4 h-4" aria-hidden="true" />;
    if (confidence >= 0.6) return <Info className="w-4 h-4" aria-hidden="true" />;
    return <AlertCircle className="w-4 h-4" aria-hidden="true" />;
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High confidence';
    if (confidence >= 0.6) return 'Medium confidence';
    return 'Low confidence';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold" id="scanner-heading">Receipt Scanner</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Close scanner"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Live region for screen reader announcements */}
        <div
          ref={statusRef}
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          tabIndex={-1}
        >
          {isProcessing && `Processing receipt, ${Math.round(ocrProgress)}% complete`}
          {ocrResult && !isProcessing && `OCR complete with ${Math.round(ocrResult.confidence)}% confidence`}
        </div>

        {!imagePreview ? (
          <div className="space-y-6" role="region" aria-labelledby="scanner-heading">
            <p className="text-center text-muted-foreground text-base">
              Capture or select a receipt image to extract expense data
            </p>

            <div className="grid grid-cols-1 gap-4">
              {/* Camera Button - Large touch target */}
              <Button
                onClick={handleCameraCapture}
                disabled={isCapturing}
                className="h-16 text-base flex items-center justify-center gap-3 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Capture receipt photo with camera"
              >
                <Camera className="h-6 w-6" aria-hidden="true" />
                {isCapturing ? 'Opening Camera...' : 'Take Photo'}
              </Button>

              {/* Upload Button - Large touch target */}
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isCapturing}
                variant="outline"
                className="h-16 text-base flex items-center justify-center gap-3 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Upload receipt image from device"
              >
                <Upload className="h-6 w-6" aria-hidden="true" />
                Upload Image
              </Button>

              {/* Hidden file input for keyboard accessibility */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="sr-only"
                aria-label="Select image file"
              />

              <p className="text-sm text-muted-foreground text-center" role="note">
                Supports bank statements, receipts, and credit card statements (JPG, PNG, max 10MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="relative" role="img" aria-label="Receipt preview">
              <img
                src={imagePreview}
                alt="Scanned receipt preview - the image you uploaded or captured"
                className="w-full max-h-64 object-contain rounded-lg border shadow-sm"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2 focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-md"
                onClick={() => {
                  setImagePreview(null);
                  setOcrResult(null);
                  setEditedText('');
                }}
                aria-label="Remove image and start over"
              >
                <X className="h-4 w-4 mr-1" aria-hidden="true" />
                Remove
              </Button>
            </div>

            {/* OCR Progress */}
            {isProcessing && (
              <div className="space-y-3" role="region" aria-label="Processing status">
                <div className="flex justify-between text-base">
                  <span className="font-medium">Processing receipt...</span>
                  <span className="tabular-nums" aria-label={`${Math.round(ocrProgress)} percent complete`}>
                    {Math.round(ocrProgress)}%
                  </span>
                </div>
                <Progress
                  value={ocrProgress}
                  className="w-full h-3"
                  aria-valuenow={ocrProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Processing progress"
                />
              </div>
            )}

            {/* OCR Results */}
            {ocrResult && (
              <div className="space-y-4" role="region" aria-labelledby="ocr-results-heading">
                <h3 id="ocr-results-heading" className="sr-only">OCR Results</h3>

                <div className="flex items-center justify-between gap-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">Scan Confidence:</span>
                    <Badge
                      variant="secondary"
                      className="gap-2 py-1.5 px-3"
                      aria-label={`${getConfidenceLabel(ocrResult.confidence / 100)}, ${Math.round(ocrResult.confidence)} percent`}
                    >
                      <div className={`w-3 h-3 rounded-full ${getConfidenceColor(ocrResult.confidence / 100)}`} aria-hidden="true" />
                      {getConfidenceIcon(ocrResult.confidence / 100)}
                      <span className="tabular-nums">{Math.round(ocrResult.confidence)}%</span>
                    </Badge>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOcrText(!showOcrText)}
                    className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-expanded={showOcrText}
                    aria-controls="ocr-text-section"
                    aria-label={showOcrText ? "Hide extracted text" : "Show extracted text"}
                  >
                    {showOcrText ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" aria-hidden="true" />
                        Hide Text
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                        Show Text
                      </>
                    )}
                  </Button>
                </div>

                {showOcrText && (
                  <div id="ocr-text-section" className="space-y-3">
                    <label htmlFor="ocr-text-editor" className="text-sm font-medium block">
                      Extracted Text
                      <span className="text-muted-foreground font-normal ml-2">
                        (You can edit if needed)
                      </span>
                    </label>
                    <Textarea
                      id="ocr-text-editor"
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      placeholder="OCR extracted text will appear here..."
                      className="min-h-32 text-base leading-relaxed focus:ring-2 focus:ring-ring"
                      aria-describedby="ocr-text-hint"
                    />
                    <p id="ocr-text-hint" className="text-sm text-muted-foreground">
                      Edit the text if the scanner missed any information, then click "Process Edited Text"
                    </p>

                    <Button
                      onClick={handleRetryWithEditedText}
                      disabled={isProcessing || !editedText.trim()}
                      className="w-full h-12 text-base focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      aria-label="Process the edited text to extract expense details"
                    >
                      {isProcessing ? 'Processing...' : 'Process Edited Text'}
                    </Button>
                  </div>
                )}

                {ocrResult.error && (
                  <div
                    className="text-destructive text-sm p-4 bg-destructive/10 rounded-lg border border-destructive/20"
                    role="alert"
                    aria-live="assertive"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <div>
                        <strong className="block mb-1">Processing Error</strong>
                        <p>{ocrResult.error}</p>
                        <p className="mt-2">Try editing the text above or upload a clearer image.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};