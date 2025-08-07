-- Update any expenses categorized as 'food' to 'Food & Dining'
UPDATE expenses 
SET category = 'Food & Dining' 
WHERE category = 'food' OR category = 'Food';

-- Update any budgets categorized as 'food' to 'Food & Dining'  
UPDATE budgets
SET category = 'Food & Dining'
WHERE category = 'food' OR category = 'Food';

-- Update any recurring transactions categorized as 'food' to 'Food & Dining'
UPDATE recurring_transactions
SET category = 'Food & Dining' 
WHERE category = 'food' OR category = 'Food';