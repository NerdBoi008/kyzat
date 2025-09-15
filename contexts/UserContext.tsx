"use client";

import { useSession } from '@/lib/auth-client';
import { createContext, useContext, ReactNode } from 'react';
import useSWR, { mutate } from 'swr';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  cartCount: number;
  favoritesCount: number;
  savedItemsCount: number;
  ordersCount: number;
  creatorProfile?: {
    id: string;
    isVerified: boolean;
    followers: number;
    sales: number;
    rating: number;
  };
}

interface UserContextType {
  user: UserData | null;
  isLoading: boolean;
  error: Error | undefined;
  refetchUser: () => void;
  updateCartCount: (newCount: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const fetcher = async (url: string): Promise<UserData | null> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data: { success: boolean; data: UserData } = await response.json();
  return data.success ? data.data : null;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const { data: session, isPending } = useSession();

  // Global SWR for user data with immediate availability [web:239][web:242]
  const {
    data: userData,
    error,
    isLoading,
    mutate: refetchUser,
  } = useSWR<UserData | null>(
    session?.user?.id ? `/api/user/quick-data` : null,
    fetcher,
    {
      // Aggressive caching for immediate availability [web:242]
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 5 * 60 * 1000, // 5 minutes for cart sync
      dedupingInterval: 1000,
      
      // Keep data fresh but serve stale immediately [web:21]
      revalidateIfStale: true,
      revalidateOnMount: true,
      
      // Error retry
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      
      // Fallback to prevent loading states
      fallbackData: null,
    }
  );

  // Optimistic cart count updates for immediate UI feedback
  const updateCartCount = (newCount: number) => {
    if (userData) {
      // Optimistic update - immediate UI change
      mutate(
        { ...userData, cartCount: newCount },
        { revalidate: false }
      );
      
      // Background revalidation to sync with server
      setTimeout(() => {
        mutate({});
      }, 100);
    }
  };

  const contextValue: UserContextType = {
    user: userData ?? null,
    isLoading: isPending || (session?.user?.id && isLoading) || isLoading,
    error,
    refetchUser,
    updateCartCount,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
