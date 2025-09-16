import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Plus, CreditCard as CreditCardIcon, Trash2, Edit, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import type { CreditCard, CardRewardCategory, MonthlyCardSpending } from '@/types/app';
import { EXPENSE_CATEGORIES } from '@/utils/categories';

export const CreditCardManager = () => {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [rewardCategories, setRewardCategories] = useState<CardRewardCategory[]>([]);
  const [monthlySpending, setMonthlySpending] = useState<MonthlyCardSpending[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  
  // Form states
  const [cardName, setCardName] = useState('');
  const [network, setNetwork] = useState<'visa' | 'mastercard' | 'amex' | 'other'>('visa');
  const [lastFour, setLastFour] = useState('');
  const [cardColor, setCardColor] = useState('#3B82F6');
  
  const { toast } = useToast();
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Load credit cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at');

      if (cardsError) throw cardsError;
      
      const mappedCards: CreditCard[] = (cardsData || []).map(card => ({
        id: card.id,
        userId: card.user_id,
        name: card.name,
        network: card.network as 'visa' | 'mastercard' | 'amex' | 'other',
        lastFourDigits: card.last_four_digits,
        color: card.color || '#3B82F6',
        isActive: card.is_active
      }));
      
      setCards(mappedCards);

      // Load reward categories
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('card_reward_categories')
        .select('*')
        .in('card_id', (cardsData || []).map(c => c.id))
        .eq('is_active', true);

      if (rewardsError) throw rewardsError;
      
      const mappedRewards: CardRewardCategory[] = (rewardsData || []).map(reward => ({
        id: reward.id,
        cardId: reward.card_id,
        category: reward.category,
        milesPerDollar: reward.miles_per_dollar,
        monthlyCapAmount: reward.monthly_cap_amount || undefined,
        capResetDay: reward.cap_reset_day,
        isActive: reward.is_active
      }));
      
      setRewardCategories(mappedRewards);

      // Load current month spending
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const { data: spendingData, error: spendingError } = await supabase
        .from('monthly_card_spending')
        .select('*')
        .in('card_id', (cardsData || []).map(c => c.id))
        .eq('year', currentYear)
        .eq('month', currentMonth);

      if (spendingError) throw spendingError;
      
      const mappedSpending: MonthlyCardSpending[] = (spendingData || []).map(spending => ({
        id: spending.id,
        cardId: spending.card_id,
        category: spending.category,
        year: spending.year,
        month: spending.month,
        totalSpent: spending.total_spent,
        milesEarned: spending.miles_earned,
        capReachedDate: spending.cap_reached_date ? new Date(spending.cap_reached_date) : undefined
      }));
      
      setMonthlySpending(mappedSpending);
      
    } catch (error) {
      console.error('Error loading credit card data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load credit card data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!user?.id || !cardName || !lastFour) return;

    try {
      const { data, error } = await supabase
        .from('credit_cards')
        .insert([{
          user_id: user.id,
          name: cardName,
          network,
          last_four_digits: lastFour,
          color: cardColor,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      const newCard: CreditCard = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        network: data.network as 'visa' | 'mastercard' | 'amex' | 'other',
        lastFourDigits: data.last_four_digits,
        color: data.color || '#3B82F6',
        isActive: data.is_active
      };

      setCards(prev => [...prev, newCard]);
      resetForm();
      setShowAddCard(false);
      
      toast({
        title: 'Card Added',
        description: `${cardName} has been added successfully`,
      });
    } catch (error) {
      console.error('Error adding card:', error);
      toast({
        title: 'Error',
        description: 'Failed to add credit card',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from('credit_cards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;

      setCards(prev => prev.filter(card => card.id !== cardId));
      setRewardCategories(prev => prev.filter(cat => cat.cardId !== cardId));
      setMonthlySpending(prev => prev.filter(spend => spend.cardId !== cardId));
      
      toast({
        title: 'Card Deleted',
        description: 'Credit card has been removed',
      });
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete credit card',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setCardName('');
    setNetwork('visa');
    setLastFour('');
    setCardColor('#3B82F6');
    setEditingCard(null);
  };

  const getCardSpending = (cardId: string, category: string) => {
    return monthlySpending.find(s => s.cardId === cardId && s.category === category);
  };

  const getCardRewards = (cardId: string) => {
    return rewardCategories.filter(r => r.cardId === cardId);
  };

  const formatMiles = (miles: number) => {
    return miles.toLocaleString() + ' miles';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Credit Cards & Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Credit Cards & Rewards
          </div>
          <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Add Credit Card</DialogTitle>
                <DialogDescription>
                  Add your credit card details to track spending and earn rewards
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="flex-1">
              <div className="space-y-4 pr-4">
                <Input
                  placeholder="Card name (e.g., Citi Rewards Card)"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
                <Select value={network} onValueChange={(value: any) => setNetwork(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="mastercard">Mastercard</SelectItem>
                    <SelectItem value="amex">American Express</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Last 4 digits"
                  value={lastFour}
                  onChange={(e) => setLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                />
                <Input
                  type="color"
                  value={cardColor}
                  onChange={(e) => setCardColor(e.target.value)}
                />
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddCard} className="flex-1">
                    Add Card
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddCard(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cards.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCardIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No credit cards added yet</p>
            <p className="text-sm">Add your cards to track miles and spending caps</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map(card => {
              const cardRewards = getCardRewards(card.id);
              return (
                <Card key={card.id} className="border-l-4" style={{ borderLeftColor: card.color }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: card.color }}
                        />
                        <div>
                          <h3 className="font-semibold">{card.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {card.network.toUpperCase()} ••••{card.lastFourDigits}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCard(card)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCard(card.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {cardRewards.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Reward Categories</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {cardRewards.map(reward => {
                            const spending = getCardSpending(card.id, reward.category);
                            const isNearCap = spending && reward.monthlyCapAmount && 
                              (spending.totalSpent / reward.monthlyCapAmount) > 0.8;
                            
                            return (
                              <div key={reward.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">{reward.category}</Badge>
                                  <span className="text-sm">{reward.milesPerDollar}x miles</span>
                                  {reward.monthlyCapAmount && (
                                    <Target className="h-3 w-3 text-orange-500" />
                                  )}
                                </div>
                                {spending && (
                                  <div className="text-right text-xs">
                                    <div className={isNearCap ? 'text-orange-600' : 'text-muted-foreground'}>
                                      ${spending.totalSpent.toLocaleString()}
                                      {reward.monthlyCapAmount && ` / $${reward.monthlyCapAmount.toLocaleString()}`}
                                    </div>
                                    <div className="text-green-600">
                                      {formatMiles(spending.milesEarned)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};