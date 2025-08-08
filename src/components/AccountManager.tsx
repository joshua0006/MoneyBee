import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Wallet, CreditCard, Banknote, PiggyBank } from 'lucide-react';
import type { Account, Expense } from '@/types/app';
import { useToast } from '@/hooks/use-toast';

interface AccountManagerProps {
  accounts: Account[];
  expenses: Expense[];
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onUpdateAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => void;
}

const ACCOUNT_TYPES: { value: Account['type']; label: string; icon: any }[] = [
  { value: 'checking', label: 'Checking', icon: Wallet },
  { value: 'savings', label: 'Savings', icon: PiggyBank },
  { value: 'credit', label: 'Credit Card', icon: CreditCard },
  { value: 'cash', label: 'Cash', icon: Banknote }
];

const ACCOUNT_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(220, 70%, 60%)',
  'hsl(260, 70%, 60%)',
  'hsl(160, 70%, 50%)',
  'hsl(40, 80%, 60%)',
  'hsl(340, 70%, 60%)'
];

export const AccountManager = ({ 
  accounts, 
  expenses, 
  onAddAccount, 
  onUpdateAccount, 
  onDeleteAccount 
}: AccountManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'checking' as Account['type'],
    balance: '',
    color: ACCOUNT_COLORS[0]
  });
  const { toast } = useToast();

  const handleAddAccount = () => {
    if (!newAccount.name || !newAccount.balance) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    onAddAccount({
      name: newAccount.name,
      type: newAccount.type,
      balance: parseFloat(newAccount.balance),
      color: newAccount.color
    });

    setNewAccount({ 
      name: '', 
      type: 'checking', 
      balance: '', 
      color: ACCOUNT_COLORS[accounts.length % ACCOUNT_COLORS.length] 
    });
    setIsDialogOpen(false);
    
    toast({
      title: "Account created",
      description: `${newAccount.name} has been added`,
    });
  };

  const getAccountBalance = (account: Account) => {
    const accountTransactions = expenses.filter(e => e.accountId === account.id);
    const transactionTotal = accountTransactions.reduce((sum, expense) => {
      return expense.type === 'income' ? sum + expense.amount : sum - expense.amount;
    }, 0);
    
    return account.balance + transactionTotal;
  };

  const getAccountIcon = (type: Account['type']) => {
    const accountType = ACCOUNT_TYPES.find(t => t.value === type);
    return accountType?.icon || Wallet;
  };

  const totalBalance = accounts.reduce((sum, account) => sum + getAccountBalance(account), 0);

  return (
    <div className="space-y-4">
      {/* Total Balance */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet size={20} />
              Total Balance
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus size={16} className="mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Account</DialogTitle>
                  <DialogDescription>Fill out details to add an account.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Account Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Main Checking"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Account Type</Label>
                    <Select value={newAccount.type} onValueChange={(value: Account['type']) => 
                      setNewAccount(prev => ({ ...prev, type: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOUNT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon size={16} />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="balance">Initial Balance</Label>
                    <Input
                      id="balance"
                      type="number"
                      placeholder="0.00"
                      value={newAccount.balance}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, balance: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Account Color</Label>
                    <div className="flex gap-2 mt-2">
                      {ACCOUNT_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 ${
                            newAccount.color === color ? 'border-foreground' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewAccount(prev => ({ ...prev, color }))}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <Button onClick={handleAddAccount} className="w-full">
                    Add Account
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center">
            <p className="text-3xl font-bold">
              ${totalBalance.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account List */}
      {accounts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Wallet size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No accounts added</h3>
            <p className="text-muted-foreground mb-4">
              Add your first account to start tracking expenses
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => {
            const Icon = getAccountIcon(account.type);
            const currentBalance = getAccountBalance(account);
            const transactionCount = expenses.filter(e => e.accountId === account.id).length;

            return (
              <Card key={account.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${account.color}20` }}
                      >
                        <Icon size={20} style={{ color: account.color }} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{account.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {ACCOUNT_TYPES.find(t => t.value === account.type)?.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {transactionCount} transactions
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        ${currentBalance.toFixed(2)}
                      </p>
                      {currentBalance !== account.balance && (
                        <p className="text-xs text-muted-foreground">
                          Started: ${account.balance.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};