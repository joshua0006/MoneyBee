import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Trash2, Bookmark, Edit, MapPin, Camera, Tag } from 'lucide-react';
import type { Expense, Account } from '@/types/app';
import { useToast } from '@/hooks/use-toast';

interface TransactionDetailProps {
  expense: Expense | null;
  account: Account | undefined;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
}

export const TransactionDetail = ({ 
  expense, 
  account, 
  isOpen, 
  onClose, 
  onDelete, 
  onEdit 
}: TransactionDetailProps) => {
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!expense) return null;

  const handleCopy = () => {
    const text = `${expense.description} - $${expense.amount.toFixed(2)} (${expense.category})`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Transaction details copied",
    });
  };

  const handleDelete = () => {
    onDelete(expense.id);
    onClose();
    toast({
      title: "Transaction deleted",
      description: "The transaction has been removed",
    });
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Bookmark removed" : "Bookmarked",
      description: isBookmarked ? "Transaction unbookmarked" : "Transaction bookmarked for quick access",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Transaction Details
            <Badge variant={expense.type === 'expense' ? 'destructive' : 'default'}>
              {expense.type}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount and Description */}
          <div className="text-center space-y-2">
            <div className={`text-3xl font-bold ${
              expense.type === 'expense' ? 'text-destructive' : 'text-green-600'
            }`}>
              {expense.type === 'expense' ? '-' : '+'}${expense.amount.toFixed(2)}
            </div>
            <p className="text-lg font-medium">{expense.description}</p>
            <p className="text-sm text-muted-foreground">
              {expense.date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <Separator />

          {/* Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Category</span>
              <Badge variant="outline">{expense.category}</Badge>
            </div>

            {account && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Account</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: account.color }}
                  />
                  <span className="text-sm">{account.name}</span>
                </div>
              </div>
            )}

            {expense.location && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Location</span>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin size={12} />
                  {expense.location}
                </div>
              </div>
            )}

            {expense.tags && expense.tags.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Tags</span>
                <div className="flex flex-wrap gap-1">
                  {expense.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Tag size={8} className="mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {expense.recurring && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Recurring</span>
                <Badge variant="outline" className="text-xs">Monthly</Badge>
              </div>
            )}
          </div>

          {/* Photos */}
          {expense.photos && expense.photos.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Attachments</span>
              <div className="grid grid-cols-3 gap-2">
                {expense.photos.map((photo, index) => (
                  <div key={index} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <Camera size={20} className="text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy size={16} className="mr-2" />
              Copy
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBookmark}
              className={isBookmarked ? 'bg-yellow-50 border-yellow-200' : ''}
            >
              <Bookmark size={16} className={`mr-2 ${isBookmarked ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              {isBookmarked ? 'Saved' : 'Save'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(expense)}>
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 size={16} className="mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};