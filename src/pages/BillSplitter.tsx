import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Plus, Users, DollarSign, Check, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { BillSplit, Participant, SplitMethod } from '@/types/app';
import { CreateBillSplitDialog } from '@/components/bill-splitter/CreateBillSplitDialog';
import { BillSplitCard } from '@/components/bill-splitter/BillSplitCard';
import { BillSplitDetailDialog } from '@/components/bill-splitter/BillSplitDetailDialog';
import { useToast } from '@/hooks/use-toast';
import { mobileService } from '@/utils/mobileService';
import { EmptyState } from '@/components/EmptyState';

const BillSplitter = () => {
  console.log('BillSplitter page loaded');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedBillSplit, setSelectedBillSplit] = useState<BillSplit | null>(null);

  // Load bill splits from localStorage
  const [billSplits, setBillSplits] = useState<BillSplit[]>(() => {
    const stored = localStorage.getItem('bill_splits');
    return stored ? JSON.parse(stored) : [];
  });

  // Save bill splits to localStorage
  const saveBillSplits = (splits: BillSplit[]) => {
    setBillSplits(splits);
    localStorage.setItem('bill_splits', JSON.stringify(splits));
  };

  const handleCreateBillSplit = (newSplit: Omit<BillSplit, 'id' | 'createdBy' | 'date' | 'status'>) => {
    const billSplit: BillSplit = {
      ...newSplit,
      id: Date.now().toString(),
      createdBy: 'current-user', // In real app, this would be the authenticated user
      date: new Date(),
      status: 'pending'
    };
    
    const updatedSplits = [billSplit, ...billSplits];
    saveBillSplits(updatedSplits);
    setIsCreateDialogOpen(false);
    
    mobileService.successHaptic();
    toast({
      title: "✅ Bill Split Created",
      description: `${billSplit.title} created with ${billSplit.participants.length} participants`,
      duration: 3000
    });
  };

  const handleUpdateParticipantPayment = (splitId: string, participantId: string, amountPaid: number) => {
    const updatedSplits = billSplits.map(split => {
      if (split.id === splitId) {
        const updatedParticipants = split.participants.map(participant => {
          if (participant.id === participantId) {
            const newAmountPaid = Math.min(amountPaid, participant.amountOwed);
            return {
              ...participant,
              amountPaid: newAmountPaid,
              status: (newAmountPaid >= participant.amountOwed ? 'paid' : 'pending') as 'pending' | 'paid',
              paidAt: newAmountPaid >= participant.amountOwed ? new Date() : undefined
            };
          }
          return participant;
        });

        // Check if all participants have paid
        const allPaid = updatedParticipants.every(p => p.status === 'paid');
        const somePaid = updatedParticipants.some(p => p.amountPaid > 0);
        
        return {
          ...split,
          participants: updatedParticipants,
          status: (allPaid ? 'completed' : somePaid ? 'partial' : 'pending') as 'pending' | 'partial' | 'completed',
          settledAt: allPaid ? new Date() : undefined
        };
      }
      return split;
    });
    
    saveBillSplits(updatedSplits);
    mobileService.successHaptic();
    
    toast({
      title: "💰 Payment Updated",
      description: "Participant payment status updated",
      duration: 2000
    });
  };

  const handleDeleteBillSplit = (splitId: string) => {
    const updatedSplits = billSplits.filter(split => split.id !== splitId);
    saveBillSplits(updatedSplits);
    setSelectedBillSplit(null);
    
    mobileService.lightHaptic();
    toast({
      title: "🗑️ Bill Split Deleted",
      description: "Bill split removed successfully",
      duration: 2000
    });
  };

  // Group bills by status
  const activeSplits = billSplits.filter(split => split.status !== 'completed');
  const completedSplits = billSplits.filter(split => split.status === 'completed');

  // Calculate statistics
  const totalActiveAmount = activeSplits.reduce((sum, split) => sum + split.totalAmount, 0);
  const totalParticipants = billSplits.reduce((sum, split) => sum + split.participants.length, 0);

  return (
    <>
      <Helmet>
        <title>Bill Splitter - MoneyBee</title>
        <meta name="description" content="Split bills and expenses with friends and family" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="hover:bg-muted/80"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Bill Splitter</h1>
                <p className="text-sm text-muted-foreground">Split expenses with ease</p>
              </div>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Split
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Statistics Cards */}
          {billSplits.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">${totalActiveAmount.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Active Amount</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-secondary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{totalParticipants}</div>
                  <div className="text-sm text-muted-foreground">Total Participants</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Active Splits */}
          {activeSplits.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Active Splits
              </h2>
              <div className="space-y-3">
                {activeSplits.map(split => (
                  <BillSplitCard
                    key={split.id}
                    split={split}
                    onClick={() => setSelectedBillSplit(split)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Splits */}
          {completedSplits.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Check className="h-5 w-5" />
                Completed Splits
              </h2>
              <div className="space-y-3">
                {completedSplits.map(split => (
                  <BillSplitCard
                    key={split.id}
                    split={split}
                    onClick={() => setSelectedBillSplit(split)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {billSplits.length === 0 && (
            <div className="mt-20">
              <EmptyState
                type="general"
                title="No Bill Splits Yet"
                description="Create your first bill split to start sharing expenses with friends and family"
                actionLabel="Create Bill Split"
                onAction={() => setIsCreateDialogOpen(true)}
                icon={<Users className="h-12 w-12 text-muted-foreground" />}
              />
            </div>
          )}
        </div>

        {/* Create Bill Split Dialog */}
        <CreateBillSplitDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreateSplit={handleCreateBillSplit}
        />

        {/* Bill Split Detail Dialog */}
        {selectedBillSplit && (
          <BillSplitDetailDialog
            split={selectedBillSplit}
            open={!!selectedBillSplit}
            onOpenChange={(open) => !open && setSelectedBillSplit(null)}
            onUpdatePayment={handleUpdateParticipantPayment}
            onDeleteSplit={handleDeleteBillSplit}
          />
        )}
      </div>
    </>
  );
};

export default BillSplitter;