import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Wallet, CreditCard, Banknote, PiggyBank } from 'lucide-react';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
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
  { value: 'hsl(var(--primary))', name: 'Primary Blue' },
  { value: 'hsl(var(--secondary))', name: 'Secondary Gray' },
  { value: 'hsl(220, 70%, 60%)', name: 'Sky Blue' },
  { value: 'hsl(260, 70%, 60%)', name: 'Purple' },
  { value: 'hsl(160, 70%, 50%)', name: 'Teal' },
  { value: 'hsl(40, 80%, 60%)', name: 'Gold' },
  { value: 'hsl(340, 70%, 60%)', name: 'Pink' }
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
    color: ACCOUNT_COLORS[0].value
  });
  const { toast } = useToast();
  const dialogTriggerRef = useRef<HTMLButtonElement>(null);
  const [liveRegionMessage, setLiveRegionMessage] = useState('');

  useEffect(() => {
    if (!isDialogOpen && dialogTriggerRef.current) {
      dialogTriggerRef.current.focus();
    }
  }, [isDialogOpen]);

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

    const accountName = newAccount.name;
    setNewAccount({
      name: '',
      type: 'checking',
      balance: '',
      color: ACCOUNT_COLORS[accounts.length % ACCOUNT_COLORS.length].value
    });
    setIsDialogOpen(false);

    setLiveRegionMessage(`Account ${accountName} has been successfully added`);
    toast({
      title: "Account created",
      description: `${accountName} has been added`,
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
      {/* Live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveRegionMessage}
      </div>

      {/* Total Balance */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet size={20} aria-hidden="true" />
              Total Balance
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  ref={dialogTriggerRef}
                  size="sm"
                  aria-label="Add new account"
                >
                  <Plus size={16} className="mr-2" aria-hidden="true" />
                  Add Account
                </Button>
              </DialogTrigger>
                <DialogContent aria-labelledby="add-account-title" aria-describedby="add-account-desc">
                  <DialogHeader>
                    <DialogTitle id="add-account-title">Add New Account</DialogTitle>
                    <DialogDescription id="add-account-desc">Fill out details to add an account.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">
                      Account Name <span className="text-destructive" aria-label="required">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Main Checking"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                      required
                      aria-required="true"
                      aria-describedby="name-description"
                    />
                    <p id="name-description" className="text-xs text-muted-foreground mt-1">
                      Enter a descriptive name for your account
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="type">Account Type</Label>
                    <Select
                      value={newAccount.type}
                      onValueChange={(value: Account['type']) =>
                        setNewAccount(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger id="type" aria-label="Select account type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOUNT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon size={16} aria-hidden="true" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="balance">
                      Initial Balance <span className="text-destructive" aria-label="required">*</span>
                    </Label>
                    <Input
                      id="balance"
                      type="number"
                      placeholder="0.00"
                      value={newAccount.balance}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, balance: e.target.value }))}
                      required
                      aria-required="true"
                      aria-describedby="balance-description"
                      step="0.01"
                      min="0"
                    />
                    <p id="balance-description" className="text-xs text-muted-foreground mt-1">
                      Enter the current balance of your account
                    </p>
                  </div>

                  <fieldset>
                    <legend className="text-sm font-medium mb-2">Account Color</legend>
                    <div className="flex gap-2" role="group" aria-label="Choose account color">
                      {ACCOUNT_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                            newAccount.color === color.value ? 'border-foreground ring-2 ring-primary' : 'border-muted'
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setNewAccount(prev => ({ ...prev, color: color.value }))}
                          aria-label={`${color.name}${newAccount.color === color.value ? ' (selected)' : ''}`}
                          aria-pressed={newAccount.color === color.value}
                        >
                          <VisuallyHidden>{color.name}</VisuallyHidden>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  
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
            <p
              className="text-3xl font-bold"
              role="status"
              aria-label={`Total balance: ${totalBalance.toFixed(2)} dollars`}
            >
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
            <Wallet size={48} className="mx-auto text-muted-foreground mb-4" aria-hidden="true" />
            <h3 className="text-lg font-semibold mb-2">No accounts added</h3>
            <p className="text-muted-foreground mb-4">
              Add your first account to start tracking expenses
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button aria-label="Add your first account">
                  <Plus size={16} className="mr-2" aria-hidden="true" />
                  Add Account
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3" role="list" aria-label="Account list">
          {accounts.map((account) => {
            const Icon = getAccountIcon(account.type);
            const currentBalance = getAccountBalance(account);
            const transactionCount = expenses.filter(e => e.accountId === account.id).length;
            const accountTypeName = ACCOUNT_TYPES.find(t => t.value === account.type)?.label || account.type;

            return (
              <Card
                key={account.id}
                role="listitem"
                tabIndex={0}
                className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label={`${account.name} account, ${accountTypeName}, current balance ${currentBalance.toFixed(2)} dollars`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${account.color}20` }}
                        aria-hidden="true"
                      >
                        <Icon size={20} style={{ color: account.color }} />
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {account.name}
                          <VisuallyHidden>{accountTypeName} account</VisuallyHidden>
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {accountTypeName}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className="font-bold text-lg"
                        aria-label={`Current balance: ${currentBalance.toFixed(2)} dollars`}
                      >
                        ${currentBalance.toFixed(2)}
                      </p>
                      {currentBalance !== account.balance && (
                        <p className="text-xs text-muted-foreground">
                          <VisuallyHidden>Initial balance: </VisuallyHidden>
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