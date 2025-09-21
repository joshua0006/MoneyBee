import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, Percent, Hash, AlertCircle, CheckCircle } from 'lucide-react';
import { Participant, SplitMethod } from '@/types/app';

interface SplitCalculatorProps {
  participants: Participant[];
  totalAmount: number;
  splitMethod: SplitMethod;
  onParticipantsChange: (participants: Participant[]) => void;
}

export const SplitCalculator = ({ 
  participants, 
  totalAmount, 
  splitMethod, 
  onParticipantsChange 
}: SplitCalculatorProps) => {
  
  const updateParticipantAmount = (participantId: string, value: number) => {
    const updatedParticipants = participants.map(p => 
      p.id === participantId ? { ...p, amountOwed: Math.max(0, value) } : p
    );
    onParticipantsChange(updatedParticipants);
  };

  const updateParticipantPercentage = (participantId: string, percentage: number) => {
    const amount = (Math.max(0, Math.min(100, percentage)) / 100) * totalAmount;
    updateParticipantAmount(participantId, amount);
  };

  const updateParticipantShares = (participantId: string, shares: number) => {
    const updatedParticipants = participants.map(p => 
      p.id === participantId ? { ...p, shares: Math.max(0, shares) } : p
    );
    
    const totalShares = updatedParticipants.reduce((sum, p) => sum + (p.shares || 0), 0);
    
    if (totalShares > 0) {
      const finalParticipants = updatedParticipants.map(p => ({
        ...p,
        amountOwed: ((p.shares || 0) / totalShares) * totalAmount
      }));
      onParticipantsChange(finalParticipants);
    } else {
      onParticipantsChange(updatedParticipants);
    }
  };

  // Calculate totals
  const calculatedTotal = participants.reduce((sum, p) => sum + p.amountOwed, 0);
  const difference = Math.abs(totalAmount - calculatedTotal);
  const isBalanced = difference < 0.01;

  const getIcon = () => {
    switch (splitMethod) {
      case 'manual': return <DollarSign className="h-4 w-4" />;
      case 'percentage': return <Percent className="h-4 w-4" />;
      case 'shares': return <Hash className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getInputLabel = () => {
    switch (splitMethod) {
      case 'manual': return 'Amount ($)';
      case 'percentage': return 'Percentage (%)';
      case 'shares': return 'Shares';
      default: return 'Amount ($)';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {getIcon()}
        <Label className="text-base font-medium">Individual Amounts</Label>
      </div>

      <div className="space-y-3">
        {participants.map((participant) => (
          <Card key={participant.id} className="border-muted">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium">{participant.name}</div>
                  {participant.email && (
                    <div className="text-xs text-muted-foreground">{participant.email}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">${participant.amountOwed.toFixed(2)}</div>
                  {splitMethod === 'percentage' && (
                    <div className="text-xs text-muted-foreground">
                      {((participant.amountOwed / totalAmount) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>

              {splitMethod !== 'equal' && (
                <div className="space-y-2">
                  <Label className="text-sm">{getInputLabel()}</Label>
                  {splitMethod === 'manual' && (
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={participant.amountOwed.toFixed(2)}
                      onChange={(e) => updateParticipantAmount(participant.id, parseFloat(e.target.value) || 0)}
                      className="text-right"
                    />
                  )}
                  {splitMethod === 'percentage' && (
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={((participant.amountOwed / totalAmount) * 100).toFixed(1)}
                      onChange={(e) => updateParticipantPercentage(participant.id, parseFloat(e.target.value) || 0)}
                      className="text-right"
                    />
                  )}
                  {splitMethod === 'shares' && (
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={participant.shares || 1}
                      onChange={(e) => updateParticipantShares(participant.id, parseInt(e.target.value) || 0)}
                      className="text-right"
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className={`${isBalanced ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-600" />
              )}
              <span className="font-medium">Total Summary</span>
            </div>
            <div className="text-right">
              <div className="font-semibold">
                ${calculatedTotal.toFixed(2)} / ${totalAmount.toFixed(2)}
              </div>
              {!isBalanced && (
                <div className={`text-sm ${calculatedTotal > totalAmount ? 'text-red-600' : 'text-orange-600'}`}>
                  {calculatedTotal > totalAmount ? 'Over' : 'Under'} by ${difference.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {!isBalanced && (
        <Alert className="border-orange-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The individual amounts don't add up to the total bill amount. Please adjust the values to balance the split.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};