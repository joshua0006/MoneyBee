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
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom"
      aria-label="Main navigation"
    >
      <div className="w-full max-w-md mx-auto px-2 xs:px-4 py-1">
        <div className="flex items-center justify-around gap-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={item.isSpecial ? "default" : "ghost"}
              size="sm"
              onClick={() => handleNavClick(item)}
              className={cn(
                "flex flex-col items-center gap-0.5 h-auto py-2 px-1.5 xs:px-2 touch-target transition-all duration-200 will-change-transform cursor-pointer",
                item.isSpecial && "h-11 w-11 xs:h-12 xs:w-12 rounded-full gradient-gold bee-button bee-glow active:scale-95",
                !item.isSpecial && location.pathname === item.path && "text-bee-blue bg-bee-blue/10 font-medium",
                !item.isSpecial && location.pathname !== item.path && "text-muted-foreground active:bg-muted/50 active:scale-95",
                !item.isSpecial && "min-w-[56px] xs:min-w-[60px]"
              )}
              aria-label={item.label}
              type="button"
            >
              <item.icon size={item.isSpecial ? 18 : 16} className="xs:w-[18px] xs:h-[18px]" />
              {!item.isSpecial && (
                <span className="text-[10px] xs:text-xs font-medium leading-tight pointer-events-none">
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