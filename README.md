# Expense Tracker with AI Parsing

A modern expense tracking application with AI-powered expense parsing using OpenAI.

## Project info

**URL**: https://lovable.dev/projects/48cad12d-4f1c-4233-aae8-dd059f15e20a

## Features

### Core Functionality
- **Quick Add Expenses**: Manual entry with smart suggestions
- **AI-Powered Parsing**: Natural language expense parsing with OpenAI
- **Budget Management**: Track spending against budgets
- **Account Management**: Multiple account support
- **Advanced Analytics**: Detailed expense analysis and charts

### AI Features
- **OpenAI Integration**: Advanced natural language processing for expense parsing
- **Basic Parser Fallback**: Built-in parser when OpenAI is unavailable
- **Smart Categorization**: Automatic category suggestion based on description
- **Merchant Recognition**: Identifies store/merchant names from descriptions
- **Confidence Scoring**: Visual indicators showing parsing accuracy

## Setup

### Prerequisites
- This project uses Supabase for backend services
- OpenAI API key for advanced AI parsing (optional - basic parser available as fallback)

### OpenAI Setup (Optional)
To enable advanced AI parsing with OpenAI:

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/)
2. In your Supabase dashboard, go to Project Settings > Edge Functions > Secrets
3. Add a new secret:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key (starts with `sk-`)

## AI Parsing Examples

The AI parser can understand natural language input like:

- "coffee 5 bucks at starbucks" → Amount: $5, Description: "Coffee at Starbucks", Category: "Food & Dining"
- "uber ride downtown 12.50" → Amount: $12.50, Description: "Uber ride downtown", Category: "Transportation"  
- "grocery shopping 45 dollars walmart" → Amount: $45, Description: "Grocery shopping at Walmart", Category: "Shopping"
- "salary deposit 2500" → Amount: $2500, Description: "Salary deposit", Type: "Income"

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/48cad12d-4f1c-4233-aae8-dd059f15e20a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **AI**: OpenAI GPT-4.1 for natural language processing
- **Build Tool**: Vite
- **UI Components**: Radix UI primitives with custom styling

## Architecture

### Components
- **EnhancedQuickAddExpense**: Main expense input component with AI integration
- **OpenAIExpenseParser**: Handles OpenAI API calls via Supabase Edge Functions
- **AIExpenseParser**: Basic fallback parser using keyword matching

### Edge Functions
- **parse-expense**: Supabase Edge Function that securely calls OpenAI API

## Fallback Behavior

If OpenAI is not configured or fails:
- Automatically falls back to basic parser
- Uses keyword-based categorization
- Still provides smart suggestions and auto-completion
- User experience remains seamless

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/48cad12d-4f1c-4233-aae8-dd059f15e20a) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
