import { useState, useEffect } from 'react';

interface CurrencySettings {
  currency: string;
  symbol: string;
  format: (amount: number) => string;
}

// Singapore-focused currency configurations
const CURRENCY_CONFIGS: Record<string, CurrencySettings> = {
  SGD: {
    currency: 'SGD',
    symbol: 'S$',
    format: (amount: number) => `S$${amount.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  },
  USD: {
    currency: 'USD',
    symbol: '$',
    format: (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  },
  EUR: {
    currency: 'EUR',
    symbol: '€',
    format: (amount: number) => `€${amount.toLocaleString('en-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  },
  GBP: {
    currency: 'GBP',
    symbol: '£',
    format: (amount: number) => `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  },
  MYR: {
    currency: 'MYR',
    symbol: 'RM',
    format: (amount: number) => `RM${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  },
  JPY: {
    currency: 'JPY',
    symbol: '¥',
    format: (amount: number) => `¥${amount.toLocaleString('ja-JP', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }
};

export function useLocaleCurrency() {
  // Default to SGD for Singapore users
  const [currentCurrency, setCurrentCurrency] = useState<string>('SGD');

  useEffect(() => {
    // Load currency preference from localStorage or onboarding data
    const onboardingData = localStorage.getItem('onboarding_data');
    const mobileSettings = localStorage.getItem('mobileSettings');
    
    let savedCurrency = 'SGD'; // Default to SGD
    
    if (onboardingData) {
      try {
        const data = JSON.parse(onboardingData);
        if (data.currency) savedCurrency = data.currency;
      } catch (error) {
        console.error('Failed to parse onboarding data:', error);
      }
    }
    
    if (mobileSettings) {
      try {
        const settings = JSON.parse(mobileSettings);
        if (settings.currency) savedCurrency = settings.currency;
      } catch (error) {
        console.error('Failed to parse mobile settings:', error);
      }
    }
    
    setCurrentCurrency(savedCurrency);
  }, []);

  const formatCurrency = (amount: number): string => {
    const config = CURRENCY_CONFIGS[currentCurrency] || CURRENCY_CONFIGS.SGD;
    return config.format(amount);
  };

  const getCurrencySymbol = (): string => {
    const config = CURRENCY_CONFIGS[currentCurrency] || CURRENCY_CONFIGS.SGD;
    return config.symbol;
  };

  const formatDate = (date: Date): string => {
    // Singapore date format: DD/MM/YYYY
    return date.toLocaleDateString('en-SG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Singapore'
    });
  };

  const formatDateTime = (date: Date): string => {
    // Singapore datetime format
    return date.toLocaleString('en-SG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Singapore'
    });
  };

  return {
    currentCurrency,
    formatCurrency,
    getCurrencySymbol,
    formatDate,
    formatDateTime,
    availableCurrencies: Object.keys(CURRENCY_CONFIGS),
    updateCurrency: setCurrentCurrency
  };
}