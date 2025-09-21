import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, User, Mail } from 'lucide-react';
import { Participant, SplitMethod } from '@/types/app';

interface ParticipantManagerProps {
  participants: Participant[];
  onParticipantsChange: (participants: Participant[]) => void;
  totalAmount: number;
  splitMethod: SplitMethod;
}

export const ParticipantManager = ({ 
  participants, 
  onParticipantsChange, 
  totalAmount,
  splitMethod 
}: ParticipantManagerProps) => {
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');

  const addParticipant = () => {
    if (!newParticipantName.trim()) return;

    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: newParticipantName.trim(),
      email: newParticipantEmail.trim() || undefined,
      amountOwed: splitMethod === 'equal' ? totalAmount / (participants.length + 1) : 0,
      amountPaid: 0,
      status: 'pending'
    };

    let updatedParticipants = [...participants, newParticipant];

    // If equal split, recalculate amounts for all participants
    if (splitMethod === 'equal') {
      const amountPerPerson = totalAmount / updatedParticipants.length;
      updatedParticipants = updatedParticipants.map(p => ({
        ...p,
        amountOwed: amountPerPerson
      }));
    }

    onParticipantsChange(updatedParticipants);
    setNewParticipantName('');
    setNewParticipantEmail('');
  };

  const removeParticipant = (participantId: string) => {
    let updatedParticipants = participants.filter(p => p.id !== participantId);

    // If equal split, recalculate amounts for remaining participants
    if (splitMethod === 'equal' && updatedParticipants.length > 0) {
      const amountPerPerson = totalAmount / updatedParticipants.length;
      updatedParticipants = updatedParticipants.map(p => ({
        ...p,
        amountOwed: amountPerPerson
      }));
    }

    onParticipantsChange(updatedParticipants);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addParticipant();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Participants</Label>
        <div className="text-sm text-muted-foreground mb-3">
          Add people who will share this bill
        </div>

        {/* Add Participant Form */}
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-1 gap-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Name *"
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email (optional)"
                value={newParticipantEmail}
                onChange={(e) => setNewParticipantEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
          </div>
          <Button 
            onClick={addParticipant}
            disabled={!newParticipantName.trim()}
            className="w-full"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Participant
          </Button>
        </div>

        {/* Participants List */}
        {participants.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">
              {participants.length} participant{participants.length !== 1 ? 's' : ''} added
            </div>
            {participants.map((participant) => (
              <Card key={participant.id} className="border-muted">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{participant.name}</div>
                      {participant.email && (
                        <div className="text-xs text-muted-foreground">{participant.email}</div>
                      )}
                      {splitMethod === 'equal' && (
                        <div className="text-xs text-primary font-medium">
                          ${participant.amountOwed.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParticipant(participant.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {splitMethod === 'equal' && participants.length > 0 && (
          <div className="mt-3 p-3 bg-muted/50 rounded-md text-sm">
            <div className="text-muted-foreground">
              Each person pays: <span className="font-semibold text-foreground">
                ${(totalAmount / participants.length).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};