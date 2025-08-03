import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, X, Eye, EyeOff } from 'lucide-react';
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

  const handleCameraCapture = async () => {
    const result = await capturePhoto();
    if (result.dataUrl && result.file) {
      setImagePreview(result.dataUrl);
      await processImage(result.file);
    } else if (result.error) {
      toast.error(`Camera error: ${result.error}`);
    }
  };

  const handleGallerySelect = async () => {
    const result = await selectFromGallery();
    if (result.dataUrl && result.file) {
      setImagePreview(result.dataUrl);
      await processImage(result.file);
    } else if (result.error) {
      toast.error(`Gallery error: ${result.error}`);
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
        toast.error(result.error || 'OCR processing failed');
      }
    } catch (error) {
      console.error('Image processing error:', error);
      toast.error('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const processWithAI = async (ocrText: string, fileName?: string) => {
    try {
      setIsProcessing(true);

      // Extract basic receipt data using our OCR service
      const merchantData = OCRService.extractReceiptData(ocrText);

      // Call our Supabase function to process with OpenAI
      const { data, error } = await supabase.functions.invoke('process-receipt', {
        body: {
          ocrText,
          merchantData,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      const receiptData: ReceiptData = data;
      
      // Add the storage file name if available
      if (fileName) {
        (receiptData as any).receiptImage = fileName;
      }

      toast.success('Receipt processed successfully!');
      onExpenseExtracted(receiptData);
      
    } catch (error) {
      console.error('AI processing error:', error);
      toast.error('Failed to process receipt with AI');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryWithEditedText = async () => {
    if (editedText.trim()) {
      await processWithAI(editedText.trim());
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Receipt Scanner</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!imagePreview ? (
          <div className="space-y-4">
            <div className="text-center text-muted-foreground mb-6">
              Capture or select a receipt image to extract expense data
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={handleCameraCapture}
                disabled={isCapturing}
                className="h-20 flex-col gap-2"
              >
                <Camera className="h-6 w-6" />
                Take Photo
              </Button>
              
              <Button 
                onClick={handleGallerySelect}
                disabled={isCapturing}
                variant="outline"
                className="h-20 flex-col gap-2"
              >
                <Upload className="h-6 w-6" />
                Select Image
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Receipt preview" 
                className="w-full max-h-64 object-contain rounded-lg border"
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImagePreview(null);
                  setOcrResult(null);
                  setEditedText('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* OCR Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing receipt...</span>
                  <span>{Math.round(ocrProgress)}%</span>
                </div>
                <Progress value={ocrProgress} className="w-full" />
              </div>
            )}

            {/* OCR Results */}
            {ocrResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">OCR Confidence:</span>
                    <Badge variant="secondary">
                      <div className={`w-2 h-2 rounded-full mr-2 ${getConfidenceColor(ocrResult.confidence / 100)}`} />
                      {Math.round(ocrResult.confidence)}%
                    </Badge>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOcrText(!showOcrText)}
                  >
                    {showOcrText ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Hide Text
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Show Text
                      </>
                    )}
                  </Button>
                </div>

                {showOcrText && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Extracted Text (you can edit if needed):
                    </label>
                    <Textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      placeholder="OCR extracted text will appear here..."
                      className="min-h-32"
                    />
                    
                    <Button
                      onClick={handleRetryWithEditedText}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      Process Edited Text
                    </Button>
                  </div>
                )}

                {ocrResult.error && (
                  <div className="text-red-500 text-sm p-3 bg-red-50 rounded">
                    {ocrResult.error}
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