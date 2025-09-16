import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Upload, FileText, X, Check, AlertTriangle } from 'lucide-react';
import { PDFProcessor, BankTransaction } from '../utils/pdfProcessor';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from './ui/use-toast';
import { Expense } from '../types/app';

interface BankStatementUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionsAdded: (transactions: Omit<Expense, 'id'>[]) => void;
}

const CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities',
  'Healthcare', 'Education', 'Travel', 'Business', 'Personal Care', 'Gifts & Donations', 'Other'
];

export function BankStatementUploader({ isOpen, onClose, onTransactionsAdded }: BankStatementUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(new Set());
  const [processingStep, setProcessingStep] = useState<string>('');
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setTransactions([]);
      setSelectedTransactions(new Set());
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
    }
  };

  const processStatement = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProcessingStep('Extracting text from PDF...');
    
    try {
      // Extract text from PDF
      const text = await PDFProcessor.extractTextFromPDF(file);
      const preprocessedText = PDFProcessor.preprocessStatementText(text);
      const format = PDFProcessor.detectStatementFormat(text);
      
      setProcessingStep('Analyzing transactions with AI...');
      
      // Process with AI via edge function
      const { data, error } = await supabase.functions.invoke('process-bank-statement', {
        body: {
          text: preprocessedText,
          format,
          filename: file.name
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const parsedTransactions = data.transactions || [];
      setTransactions(parsedTransactions);
      
      // Select all transactions by default
      setSelectedTransactions(new Set(parsedTransactions.map((_: any, index: number) => index)));
      
      setProcessingStep('');
      toast({
        title: "Statement processed successfully",
        description: `Found ${parsedTransactions.length} transactions`,
      });
    } catch (error) {
      console.error('Error processing statement:', error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to process statement",
        variant: "destructive",
      });
      setProcessingStep('');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleTransaction = (index: number) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTransactions(newSelected);
  };

  const updateTransactionCategory = (index: number, category: string) => {
    const updatedTransactions = [...transactions];
    updatedTransactions[index] = { ...updatedTransactions[index], category };
    setTransactions(updatedTransactions);
  };

  const importSelectedTransactions = () => {
    const selectedTxns = transactions
      .filter((_, index) => selectedTransactions.has(index))
      .map(txn => ({
        amount: Math.abs(txn.amount),
        description: txn.description,
        category: txn.category || 'Other',
        date: new Date(txn.date),
        type: txn.type,
      }));

    onTransactionsAdded(selectedTxns);
    
    toast({
      title: "Transactions imported",
      description: `Added ${selectedTxns.length} transactions`,
    });
    
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setTransactions([]);
    setSelectedTransactions(new Set());
    setProcessingStep('');
    setIsProcessing(false);
    onClose();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Import Bank Statement
          </DialogTitle>
          <DialogDescription>
            Upload and process your bank statement to import transactions automatically
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 overflow-hidden">
          <div className="space-y-4 pr-4">
          {!file ? (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload Bank Statement</h3>
              <p className="text-muted-foreground mb-4">
                Select a PDF file of your bank or credit card statement
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload">
                <Button asChild>
                  <span>Select PDF File</span>
                </Button>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {!isProcessing && transactions.length === 0 && (
                <Button onClick={processStatement} className="w-full">
                  Process Statement
                </Button>
              )}

              {isProcessing && (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">{processingStep}</p>
                </div>
              )}

              {transactions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      Found {transactions.length} transactions
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTransactions(new Set(transactions.map((_, i) => i)))}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTransactions(new Set())}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="h-96 border rounded-lg">
                    <div className="space-y-2 p-4">
                      {transactions.map((transaction, index) => (
                        <div
                          key={index}
                          className={`p-3 border rounded-lg ${
                            selectedTransactions.has(index) ? 'bg-primary/5 border-primary' : 'bg-background'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedTransactions.has(index)}
                              onCheckedChange={() => toggleTransaction(index)}
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{transaction.description}</p>
                                <div className="flex items-center gap-2">
                                  <Badge className={getConfidenceColor(transaction.confidence)}>
                                    {Math.round(transaction.confidence * 100)}%
                                  </Badge>
                                  <span className={`font-medium ${
                                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{transaction.date}</span>
                                <Select
                                  value={transaction.category || ''}
                                  onValueChange={(value) => updateTransactionCategory(index, value)}
                                >
                                  <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CATEGORIES.map(category => (
                                      <SelectItem key={category} value={category}>
                                        {category}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      {selectedTransactions.size} of {transactions.length} transactions selected
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleClose}>
                        Cancel
                      </Button>
                      <Button
                        onClick={importSelectedTransactions}
                        disabled={selectedTransactions.size === 0}
                      >
                        Import {selectedTransactions.size} Transactions
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}