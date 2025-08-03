import { Home, BarChart2, Plus, Target, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddExpense: () => void;
}

export const BottomNavigation = ({ activeTab, onTabChange, onAddExpense }: BottomNavigationProps) => {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "stats", icon: BarChart2, label: "Stats" },
    { id: "add", icon: Plus, label: "Add", isSpecial: true },
    { id: "budget", icon: Target, label: "Budget" },
    { id: "more", icon: MoreHorizontal, label: "More" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="max-w-lg mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={item.isSpecial ? "default" : "ghost"}
              size={item.isSpecial ? "lg" : "sm"}
              onClick={item.isSpecial ? onAddExpense : () => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-3",
                item.isSpecial && "h-12 w-12 rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200",
                !item.isSpecial && activeTab === item.id && "text-primary bg-primary/10",
                !item.isSpecial && "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
            >
              <item.icon size={item.isSpecial ? 20 : 18} />
              {!item.isSpecial && (
                <span className="text-xs font-medium">{item.label}</span>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};