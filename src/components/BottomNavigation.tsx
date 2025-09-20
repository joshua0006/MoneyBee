import { Home, BarChart2, Plus, Target, Trophy, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

interface BottomNavigationProps {
  onAddExpense: () => void;
}

export const BottomNavigation = ({ onAddExpense }: BottomNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { id: "home", icon: Home, label: "Home", path: "/" },
    { id: "budgets", icon: Target, label: "Budgets", path: "/budgets" },
    { id: "add", icon: Plus, label: "Add", isSpecial: true },
    { id: "analytics", icon: BarChart2, label: "Analytics", path: "/analytics" },
    { id: "growth", icon: TrendingUp, label: "Growth", path: "/growth" },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    console.log('Navigation click:', item.label, item.path);
    if (item.isSpecial) {
      onAddExpense();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border"
      aria-label="Main navigation"
    >
      <div className="w-full max-w-md mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={item.isSpecial ? "default" : "ghost"}
              size="sm"
              onClick={() => handleNavClick(item)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-3",
                item.isSpecial && "h-12 w-12 rounded-full bg-primary text-primary-foreground",
                !item.isSpecial && location.pathname === item.path && "text-primary bg-primary/10",
                !item.isSpecial && location.pathname !== item.path && "text-muted-foreground"
              )}
              aria-label={item.label}
            >
              <item.icon size={item.isSpecial ? 20 : 16} />
              {!item.isSpecial && (
                <span className="text-xs font-medium">
                  {item.label}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};