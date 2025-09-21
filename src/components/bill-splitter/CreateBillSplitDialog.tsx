import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Users, DollarSign, Percent, Hash } from 'lucide-react';
import { BillSplit, Participant, SplitMethod, SplitCalculation } from '@/types/app';
import { ParticipantManager } from './ParticipantManager';
import { SplitCalculator } from './SplitCalculator';
import { useToast } from '@/hooks/use-toast';

interface CreateBillSplitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSplit: (split: Omit<BillSplit, 'id' | 'createdBy' | 'date' | 'status'>) => void;
}

const CATEGORIES = [
  'Restaurant', 'Groceries', 'Entertainment', 'Travel', 'Utilities', 
  'Transportation', 'Shopping', 'Other'
];

export const CreateBillSplitDialog = ({ open, onOpenChange, onCreateSplit }: CreateBillSplitDialogProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [category, setCategory] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal');
  const [splitCalculations, setSplitCalculations] = useState<SplitCalculation[]>([]);

  const resetForm = () => {
    setStep(1);
    setTitle('');
    setDescription('');
    setTotalAmount('');
    setCategory('');
    setParticipants([]);
    setSplitMethod('equal');
    setSplitCalculations([]);
  };

  const handleNext = () => {
    if (step === 1) {
      // Validate basic info
      if (!title.trim()) {
        toast({
          title: "Missing Information",
          description: "Please enter a title for the bill",
          variant: "destructive"
        });
        return;
      }
      if (!totalAmount || parseFloat(totalAmount) <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid total amount",
          variant: "destructive"
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate participants
      if (participants.length === 0) {
        toast({
          title: "No Participants",
          description: "Please add at least one participant",
          variant: "destructive"
        });
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(Math.max(1, step - 1));
  };

  const handleCreate = () => {
    // Validate final calculations
    const total = parseFloat(totalAmount);
    const calculatedTotal = participants.reduce((sum, p) => sum + p.amountOwed, 0);
    
    if (Math.abs(total - calculatedTotal) > 0.01) {
      toast({
        title: "Amount Mismatch",
        description: "Individual amounts don't match the total amount",
        variant: "destructive"
      });
      return;
    }

    const newSplit: Omit<BillSplit, 'id' | 'createdBy' | 'date' | 'status'> = {
      title: title.trim(),
      description: description.trim() || undefined,
      totalAmount: total,
      participants: participants.map(p => ({
        ...p,
        amountPaid: 0,
        status: 'pending' as const
      })),
      splitMethod,
      category: category || undefined
    };

    onCreateSplit(newSplit);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const getSplitMethodIcon = (method: SplitMethod) => {
    switch (method) {
      case 'equal': return <Users className="h-4 w-4" />;
      case 'manual': return <DollarSign className="h-4 w-4" />;
      case 'percentage': return <Percent className="h-4 w-4" />;
      case 'shares': return <Hash className="h-4 w-4" />;
    }
  };

  const getSplitMethodLabel = (method: SplitMethod) => {
    switch (method) {
      case 'equal': return 'Equal Split';
      case 'manual': return 'Custom Amounts';
      case 'percentage': return 'Percentage Split';
      case 'shares': return 'Share Based';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Create Bill Split - Step {step} of 3
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Enter the basic information for your bill"}
            {step === 2 && "Add participants and choose how to split"}
            {step === 3 && "Review and adjust individual amounts"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Bill Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Dinner at Restaurant"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Total Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Optional description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}

          {/* Step 2: Participants and Split Method */}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Split Method</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['equal', 'manual', 'percentage', 'shares'] as SplitMethod[]).map(method => (
                    <Button
                      key={method}
                      variant={splitMethod === method ? "default" : "outline"}
                      onClick={() => setSplitMethod(method)}
                      className="h-auto p-3 flex flex-col gap-1"
                    >
                      {getSplitMethodIcon(method)}
                      <span className="text-xs">{getSplitMethodLabel(method)}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <ParticipantManager
                participants={participants}
                onParticipantsChange={setParticipants}
                totalAmount={parseFloat(totalAmount) || 0}
                splitMethod={splitMethod}
              />
            </>
          )}

          {/* Step 3: Review and Calculate */}
          {step === 3 && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Total: ${parseFloat(totalAmount).toFixed(2)}</span>
                    <Badge variant="outline">{getSplitMethodLabel(splitMethod)}</Badge>
                  </div>
                </CardHeader>
              </Card>

              <SplitCalculator
                participants={participants}
                totalAmount={parseFloat(totalAmount)}
                splitMethod={splitMethod}
                onParticipantsChange={setParticipants}
              />
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step < 3 ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button onClick={handleCreate} className="bg-primary">
              Create Split
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};