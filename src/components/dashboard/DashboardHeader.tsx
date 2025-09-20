import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { LogOut } from "lucide-react";
import moneyBeesLogo from "@/assets/moneybees-logo.png";

interface DashboardHeaderProps {
  expenseCount: number;
  onSignOut: () => void;
}

export const DashboardHeader = ({ expenseCount, onSignOut }: DashboardHeaderProps) => {
  return (
    <header className="bg-background/95 backdrop-blur-xl border-b border-border/30 sticky top-0 z-40 shadow-soft safe-area-top">
      <div className="px-4 xs:px-6">
        <div className="flex items-center justify-between h-14 xs:h-16">
          <HamburgerMenu />
          
          {/* Compact Logo Section */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="bg-gradient-to-br from-bee-gold via-bee-amber to-accent p-1.5 rounded-lg shadow-gold">
                <img 
                  src={moneyBeesLogo} 
                  alt="MoneyBee" 
                  className="w-4 h-4 xs:w-5 xs:h-5 object-contain" 
                />
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-br from-bee-gold/20 to-accent/20 rounded-lg blur-sm -z-10"></div>
            </div>
            <div className="xs:block">
              <h1 className="text-base xs:text-lg font-bold bg-gradient-to-r from-bee-blue via-primary to-bee-amber bg-clip-text text-transparent">
                MoneyBee
              </h1>
            </div>
          </div>
          
          {/* Mobile Actions */}
          <div className="flex items-center gap-2">
            <div className="xs:flex bg-gradient-to-r from-bee-blue/10 to-primary/10 px-2 py-1 rounded-md border border-bee-blue/20">
              <Badge variant="secondary" className="text-[10px] xs:text-xs px-1.5 py-0.5 bg-transparent border-0 text-bee-blue font-medium">
                {expenseCount}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 xs:p-2 touch-target hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={onSignOut}
              aria-label="Sign out"
            >
              <LogOut size={14} className="xs:w-4 xs:h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};