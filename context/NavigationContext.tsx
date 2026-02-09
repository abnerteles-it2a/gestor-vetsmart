import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navigationParams: any;
  navigateTo: (tab: string, params?: any) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState('dashboard');
  const [navigationParams, setNavigationParams] = useState<any>(null);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    // Clear params when just switching tabs manually, unless navigating with params
    if (tab !== activeTab) {
      setNavigationParams(null);
    }
  };

  const navigateTo = (tab: string, params?: any) => {
    setNavigationParams(params || null);
    setActiveTabState(tab);
  };

  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab, navigationParams, navigateTo }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
