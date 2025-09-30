import { createContext, useContext, ReactNode } from 'react';
import { useAppData as useAppDataHook, AppDataHook } from '@/hooks/useAppData';

const AppDataContext = createContext<AppDataHook | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const appData = useAppDataHook(); // Single instance for entire app
  return <AppDataContext.Provider value={appData}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
};