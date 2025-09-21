import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Trash2,
  User,
  Mail
} from 'lucide-react';
import { BillSplit } from '@/types/app';
import { format } from 'date-fns';

interface BillSplitDetailDialogProps {
  split: BillSplit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdatePayment: (splitId: string, participantId: string, amountPaid: number) => void;
  onDeleteSplit: (splitId: string) => void;
}

export const BillSplitDetailDialog = ({ 
  split, 
  open, 
  onOpenChange, 
  onUpdatePayment,
  onDeleteSplit 
}: BillSplitDetailDialogProps) => {
  const [editingPayments, setEditingPayments] = useState<Record<string, string>>({});

  const totalPaid = split.participants.reduce((sum, p) => sum + p.amountPaid, 0);
  const paymentProgress = (totalPaid / split.totalAmount) * 100;
  const paidParticipants = split.participants.filter(p => p.status === 'paid').length;

  const handlePaymentUpdate = (participantId: string) => {
    const amountStr = editingPayments[participantId];
    if (amountStr !== undefined) {
      const amount = parseFloat(amountStr) || 0;
      onUpdatePayment(split.id, participantId, amount);
      setEditingPayments(prev => {
        const { [participantId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleQuickPay = (participantId: string, amount: number) => {
    onUpdatePayment(split.id, participantId, amount);
  };

  const getStatusBadge = () => {
    switch (split.status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Partial</Badge>;
      default:
        return <Badge variant="outline" className="border-orange-200 text-orange-700">Pending</Badge>;
    }
  };

  const getSplitMethodLabel = () => {
    switch (split.splitMethod) {
      case 'equal': return 'Equal Split';
      case 'manual': return 'Custom Amounts';
      case 'percentage': return 'Percentage Split';
      case 'shares': return 'Share Based';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex-1">{split.title}</DialogTitle>
            {getStatusBadge()}
          </div>
          {split.description && (
            <DialogDescription>{split.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Bill Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Total: <span className="font-semibold">${split.totalAmount.toFixed(2)}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{split.participants.length} participant{split.participants.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(split.date), 'MMM dd, yyyy')}</span>
                </div>
                <div>
                  <Badge variant="outline" className="text-xs">{getSplitMethodLabel()}</Badge>
                </div>
              </div>

              {split.category && (
                <div className="pt-2">
                  <Badge variant="secondary">{split.category}</Badge>
                </div>
              )}

              {/* Payment Progress */}
              {split.status !== 'completed' && (
                <div className="pt-3">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Payment Progress</span>
                    <span>${totalPaid.toFixed(2)} / ${split.totalAmount.toFixed(2)}</span>
                  </div>
                  <Progress value={paymentProgress} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1 text-center">
                    {paidParticipants}/{split.participants.length} participants paid
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Participants */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participants
            </h3>
            
            {split.participants.map((participant) => (
              <Card key={participant.id} className="border-muted">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-muted rounded-full p-2">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{participant.name}</div>
                        {participant.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {participant.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {participant.status === 'paid' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : participant.amountPaid > 0 ? (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                        )}
                        <span className="text-sm font-medium">
                          ${participant.amountPaid.toFixed(2)} / ${participant.amountOwed.toFixed(2)}
                        </span>
                      </div>
                      {participant.status === 'paid' && participant.paidAt && (
                        <div className="text-xs text-muted-foreground">
                          Paid {format(new Date(participant.paidAt), 'MMM dd')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Controls */}
                  {split.status !== 'completed' && participant.status !== 'paid' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickPay(participant.id, participant.amountOwed)}
                          className="flex-1"
                        >
                          Mark as Paid
                        </Button>
                        {participant.amountPaid > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickPay(participant.id, 0)}
                            className="text-muted-foreground"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label className="text-xs">Custom amount</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max={participant.amountOwed}
                            placeholder="0.00"
                            value={editingPayments[participant.id] || ''}
                            onChange={(e) => setEditingPayments(prev => ({
                              ...prev,
                              [participant.id]: e.target.value
                            }))}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handlePaymentUpdate(participant.id);
                              }
                            }}
                            className="text-sm"
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handlePaymentUpdate(participant.id)}
                          disabled={!editingPayments[participant.id]}
                          className="self-end"
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Settlement Info */}
          {split.status === 'completed' && split.settledAt && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Bill Settled</span>
                </div>
                <div className="text-sm text-green-600 mt-1">
                  Completed on {format(new Date(split.settledAt), 'MMM dd, yyyy')}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Bill Split</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{split.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDeleteSplit(split.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};