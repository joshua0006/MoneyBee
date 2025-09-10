export const VALUE_TAGS = [
  "Health",
  "Sustainability", 
  "Learning",
  "Relationships",
  "Creativity",
  "Adventure",
  "Security",
  "Community",
  "Family",
  "Growth"
] as const;

export type ValueTag = typeof VALUE_TAGS[number];

export const VALUE_TAG_DESCRIPTIONS = {
  Health: "Investments in physical and mental wellbeing",
  Sustainability: "Environmentally conscious and ethical choices", 
  Learning: "Education, skills development, and knowledge growth",
  Relationships: "Building and maintaining meaningful connections",
  Creativity: "Artistic expression and creative pursuits",
  Adventure: "Exploration, travel, and new experiences", 
  Security: "Financial stability and risk mitigation",
  Community: "Contributing to and participating in community",
  Family: "Supporting and caring for family members",
  Growth: "Personal development and self-improvement"
} as const;

export const getValueTagColor = (tag: string): string => {
  const colors = {
    Health: "hsl(var(--success))",
    Sustainability: "hsl(var(--success))", 
    Learning: "hsl(var(--primary))",
    Relationships: "hsl(var(--secondary))",
    Creativity: "hsl(var(--accent))",
    Adventure: "hsl(var(--warning))",
    Security: "hsl(var(--muted))",
    Community: "hsl(var(--secondary))",
    Family: "hsl(var(--primary))",
    Growth: "hsl(var(--accent))"
  };
  return colors[tag as keyof typeof colors] || "hsl(var(--muted))";
};

export const suggestValueTags = (category: string, description: string): ValueTag[] => {
  const suggestions: ValueTag[] = [];
  const lowerDesc = description.toLowerCase();
  const lowerCat = category.toLowerCase();

  // Health-related suggestions
  if (lowerCat.includes('health') || lowerCat.includes('medical') || 
      lowerDesc.includes('gym') || lowerDesc.includes('doctor') || 
      lowerDesc.includes('fitness') || lowerDesc.includes('wellness')) {
    suggestions.push('Health');
  }

  // Sustainability suggestions
  if (lowerDesc.includes('organic') || lowerDesc.includes('solar') ||
      lowerDesc.includes('electric') || lowerDesc.includes('sustainable') ||
      lowerDesc.includes('eco') || lowerDesc.includes('recycle')) {
    suggestions.push('Sustainability');
  }

  // Learning suggestions  
  if (lowerCat.includes('education') || lowerDesc.includes('course') ||
      lowerDesc.includes('book') || lowerDesc.includes('training') ||
      lowerDesc.includes('workshop') || lowerDesc.includes('class')) {
    suggestions.push('Learning');
  }

  // Relationships suggestions
  if (lowerDesc.includes('dinner') || lowerDesc.includes('gift') ||
      lowerDesc.includes('date') || lowerDesc.includes('anniversary') ||
      lowerCat.includes('dining') && lowerDesc.includes('with')) {
    suggestions.push('Relationships');
  }

  return suggestions;
};