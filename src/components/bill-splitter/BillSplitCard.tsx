import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, DollarSign, Calendar, ChevronRight } from 'lucide-react';
import { BillSplit } from '@/types/app';
import { format } from 'date-fns';

interface BillSplitCardProps {
  split: BillSplit;
  onClick: () => void;
}

export const BillSplitCard = ({ split, onClick }: BillSplitCardProps) => {
  const totalPaid = split.participants.reduce((sum, p) => sum + p.amountPaid, 0);
  const paymentProgress = (totalPaid / split.totalAmount) * 100;
  const paidParticipants = split.participants.filter(p => p.status === 'paid').length;

  const getStatusBadge = () => {
    switch (split.status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
      case 'partial':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">Partial</Badge>;
      default:
        return <Badge variant="outline" className="border-orange-200 text-orange-700">Pending</Badge>;
    }
  };

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">{split.title}</h3>
              {getStatusBadge()}
            </div>
            {split.description && (
              <p className="text-sm text-muted-foreground truncate mb-2">{split.description}</p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
        </div>

        {/* Amount and Date */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="font-semibold text-lg">${split.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(split.date), 'MMM dd')}</span>
          </div>
        </div>

        {/* Progress Bar */}
        {split.status !== 'completed' && (
          <div className="mb-3">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Payment Progress</span>
              <span>${totalPaid.toFixed(2)} / ${split.totalAmount.toFixed(2)}</span>
            </div>
            <Progress value={paymentProgress} className="h-2" />
          </div>
        )}

        {/* Participants Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {split.participants.length} participant{split.participants.length !== 1 ? 's' : ''}
            </span>
          </div>
          {split.status !== 'completed' && (
            <div className="text-muted-foreground">
              {paidParticipants}/{split.participants.length} paid
            </div>
          )}
        </div>

        {/* Split Method */}
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {split.splitMethod === 'equal' ? 'Equal Split' :
             split.splitMethod === 'manual' ? 'Custom Amounts' :
             split.splitMethod === 'percentage' ? 'Percentage Split' : 'Share Based'}
          </Badge>
          {split.category && (
            <Badge variant="outline" className="text-xs">
              {split.category}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};