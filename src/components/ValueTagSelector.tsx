import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VALUE_TAGS, VALUE_TAG_DESCRIPTIONS, getValueTagColor, type ValueTag } from "@/utils/valueTagging";
import { X } from "lucide-react";

interface ValueTagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  suggestions?: ValueTag[];
}

export const ValueTagSelector = ({ selectedTags, onTagsChange, suggestions = [] }: ValueTagSelectorProps) => {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    onTagsChange(selectedTags.filter(t => t !== tag));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Value Tags</label>
        <span className="text-xs text-muted-foreground">What values does this expense align with?</span>
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge 
              key={tag}
              variant="secondary" 
              className="flex items-center gap-1 pr-1"
              style={{ backgroundColor: `${getValueTagColor(tag)}/10`, borderColor: getValueTagColor(tag) }}
            >
              {tag}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTag(tag)}
                className="h-3 w-3 p-0 hover:bg-destructive/20"
              >
                <X size={10} />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Suggested based on your expense:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((tag) => (
              <Button
                key={tag}
                variant="outline"
                size="sm"
                onClick={() => toggleTag(tag)}
                className={`text-xs ${selectedTags.includes(tag) ? 'bg-primary/10 border-primary' : ''}`}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* All Available Tags */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">All value tags:</p>
        <div className="grid grid-cols-2 gap-2">
          {VALUE_TAGS.map((tag) => (
            <Button
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "ghost"}
              size="sm"
              onClick={() => toggleTag(tag)}
              className="justify-start text-xs"
              title={VALUE_TAG_DESCRIPTIONS[tag]}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};