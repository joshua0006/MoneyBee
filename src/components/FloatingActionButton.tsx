import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Camera, Receipt, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { mobileService } from "@/utils/mobileService";

interface FloatingActionButtonProps {
  onAddExpense: () => void;
  onScanReceipt?: () => void;
  onVoiceInput?: () => void;
}

export const FloatingActionButton = ({ 
  onAddExpense, 
  onScanReceipt, 
  onVoiceInput 
}: FloatingActionButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    {
      icon: Keyboard,
      label: "Manual Entry",
      onClick: () => {
        mobileService.lightHaptic();
        onAddExpense();
      },
      color: "bg-primary"
    },
    {
      icon: Receipt,
      label: "Scan Receipt",
      onClick: () => {
        mobileService.lightHaptic();
        onScanReceipt?.();
      },
      color: "bg-accent",
      disabled: !onScanReceipt
    },
    {
      icon: Camera,
      label: "Quick Photo",
      onClick: () => {
        mobileService.lightHaptic();
        onVoiceInput?.();
      },
      color: "bg-secondary",
      disabled: !onVoiceInput
    }
  ].filter(action => !action.disabled);

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {/* Expanded Actions */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-fade-in">
          {actions.map((action, index) => (
            <div 
              key={action.label}
              className="flex items-center gap-3 animate-slide-in-right"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="text-xs font-medium text-foreground bg-card px-2 py-1 rounded-md shadow-md whitespace-nowrap border">
                {action.label}
              </span>
              <Button
                size="sm"
                onClick={() => {
                  mobileService.mediumHaptic();
                  action.onClick();
                  setIsExpanded(false);
                }}
                className={cn(
                  "h-10 w-10 rounded-full shadow-lg hover:scale-110 transition-all duration-200",
                  action.color
                )}
              >
                <action.icon size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <Button
        size="lg"
        onClick={() => {
          mobileService.lightHaptic();
          if (isExpanded) {
            setIsExpanded(false);
          } else if (actions.length === 1) {
            actions[0].onClick();
          } else {
            setIsExpanded(true);
          }
        }}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg gradient-gold bee-button bee-glow",
          "hover:scale-110 active:scale-95 transition-all duration-300",
          isExpanded && "rotate-45"
        )}
      >
        <Plus size={24} className="transition-transform duration-300" />
      </Button>

      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-transparent -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};