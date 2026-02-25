import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { User } from '@/types';

const AUTH_STORAGE_KEY = '@farm_app_auth';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authQuery = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    },
  });

  useEffect(() => {
    if (authQuery.data !== undefined) {
      setUser(authQuery.data);
      setIsLoading(false);
    }
  }, [authQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (userData: User) => {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      return userData;
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Keep user record but mark as logged out so PIN is required on next open
      if (user) {
        const updated = { ...user, isLoggedIn: false };
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      }
    },
    onSuccess: () => {
      setUser((prev) => prev ? { ...prev, isLoggedIn: false } : null);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  /** Register a brand-new user (first launch). */
  const register = (name: string, phone: string, pin: string, businessName = '') => {
    const userData: User = { phone, name, businessName, isLoggedIn: true, pin };
    saveMutation.mutate(userData);
  };

  /** Verify PIN and log in an existing user. Returns true on success. */
  const login = (pin: string): boolean => {
    const stored: User | null = authQuery.data;
    if (!stored || stored.pin !== pin) return false;
    saveMutation.mutate({ ...stored, isLoggedIn: true });
    return true;
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updates };
      saveMutation.mutate(updated);
    }
  };

  return {
    user,
    isLoading: isLoading || authQuery.isLoading,
    isLoggedIn: !!user?.isLoggedIn,
    /** True when a user record exists in storage (i.e. user has registered before). */
    isRegistered: !!(authQuery.data as User | null)?.phone,
    register,
    login,
    logout,
    updateProfile,
  };
});
