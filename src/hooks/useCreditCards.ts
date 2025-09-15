import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import type { CreditCard } from '@/types/app';

export const useCreditCards = () => {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  const loadCreditCards = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at');

      if (error) throw error;

      const mappedCards: CreditCard[] = (data || []).map(card => ({
        id: card.id,
        userId: card.user_id,
        name: card.name,
        network: card.network as 'visa' | 'mastercard' | 'amex' | 'other',
        lastFourDigits: card.last_four_digits,
        color: card.color || '#3B82F6',
        isActive: card.is_active
      }));

      setCreditCards(mappedCards);
    } catch (error) {
      console.error('Error loading credit cards:', error);
      toast({
        title: 'Error',
        description: 'Failed to load credit cards',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadCreditCards();
    }
  }, [user?.id]);

  const addCreditCard = async (card: Omit<CreditCard, 'id' | 'userId'>) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('credit_cards')
        .insert([{
          user_id: user.id,
          name: card.name,
          network: card.network,
          last_four_digits: card.lastFourDigits,
          color: card.color,
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

      setCreditCards(prev => [...prev, newCard]);
      
      toast({
        title: 'Card Added',
        description: `${card.name} has been added successfully`,
      });

      return newCard;
    } catch (error) {
      console.error('Error adding credit card:', error);
      toast({
        title: 'Error',
        description: 'Failed to add credit card',
        variant: 'destructive'
      });
      throw error;
    }
  };

  return {
    creditCards,
    isLoading,
    loadCreditCards,
    addCreditCard
  };
};