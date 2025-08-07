import { useState, useEffect } from "react";

interface MoneyQuote {
  text: string;
  author: string;
  category: 'mindset' | 'saving' | 'investing' | 'budgeting' | 'success';
}

export const moneyQuotes: MoneyQuote[] = [
  // Mindset
  {
    text: "A budget is telling your money where to go instead of wondering where it went.",
    author: "Dave Ramsey",
    category: 'budgeting'
  },
  {
    text: "It's not how much money you make, but how much money you keep, how hard it works for you, and how many generations you keep it for.",
    author: "Robert Kiyosaki",
    category: 'mindset'
  },
  {
    text: "The real measure of your wealth is how much you'd be worth if you lost all your money.",
    author: "Anonymous",
    category: 'mindset'
  },
  {
    text: "Beware of little expenses. A small leak will sink a great ship.",
    author: "Benjamin Franklin",
    category: 'saving'
  },
  {
    text: "A penny saved is a penny earned.",
    author: "Benjamin Franklin",
    category: 'saving'
  },
  {
    text: "Don't save what is left after spending; spend what is left after saving.",
    author: "Warren Buffett",
    category: 'saving'
  },
  {
    text: "The habit of saving is itself an education; it fosters every virtue, teaches self-denial, cultivates the sense of order, trains to forethought.",
    author: "T.T. Munger",
    category: 'saving'
  },
  {
    text: "Someone's sitting in the shade today because someone planted a tree a long time ago.",
    author: "Warren Buffett",
    category: 'investing'
  },
  {
    text: "The most important investment you can make is in yourself.",
    author: "Warren Buffett",
    category: 'mindset'
  },
  {
    text: "Price is what you pay. Value is what you get.",
    author: "Warren Buffett",
    category: 'investing'
  },
  {
    text: "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make, so you can give money back and have money to invest. You can't win until you do this.",
    author: "Dave Ramsey",
    category: 'mindset'
  },
  {
    text: "Rich people have small TVs and big libraries, and poor people have small libraries and big TVs.",
    author: "Zig Ziglar",
    category: 'mindset'
  },
  {
    text: "The goal isn't more money. The goal is living life on your terms.",
    author: "Chris Brogan",
    category: 'success'
  },
  {
    text: "Wealth consists not in having great possessions, but in having few wants.",
    author: "Epictetus",
    category: 'mindset'
  },
  {
    text: "Every time you borrow money, you're robbing your future self.",
    author: "Nathan W. Morris",
    category: 'budgeting'
  },
  {
    text: "The first step towards getting somewhere is to decide you're not going to stay where you are.",
    author: "J.P. Morgan",
    category: 'success'
  },
  {
    text: "Money is a tool. Used properly it makes something beautiful; used wrong, it makes a mess.",
    author: "Bradley Vinson",
    category: 'mindset'
  },
  {
    text: "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it.",
    author: "Albert Einstein",
    category: 'investing'
  },
  {
    text: "The secret to wealth is simple: Find a way to do more for others than anyone else does.",
    author: "Tony Robbins",
    category: 'success'
  },
  {
    text: "If you live for having it all, what you have is never enough.",
    author: "Vicki Robin",
    category: 'mindset'
  }
];

export const getRandomMoneyQuote = (): MoneyQuote => {
  const randomIndex = Math.floor(Math.random() * moneyQuotes.length);
  return moneyQuotes[randomIndex];
};

export const getQuotesByCategory = (category: MoneyQuote['category']): MoneyQuote[] => {
  return moneyQuotes.filter(quote => quote.category === category);
};

export const useRotatingQuote = (intervalMs: number = 5000) => {
  const [currentQuote, setCurrentQuote] = useState<MoneyQuote>(getRandomMoneyQuote());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(getRandomMoneyQuote());
    }, intervalMs);
    
    return () => clearInterval(interval);
  }, [intervalMs]);
  
  return currentQuote;
};