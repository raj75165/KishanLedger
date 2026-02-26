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

  const loginMutation = useMutation({
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
      if (user) {
        const updatedUser = { ...user, isLoggedIn: false };
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
        return updatedUser;
      }
    },
    onSuccess: (data) => {
      setUser(data || null);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const createUser = (name: string, phone: string, pin: string, businessName?: string) => {
    const userData: User = {
      phone,
      name,
      businessName,
      pin,
      isLoggedIn: true,
    };
    loginMutation.mutate(userData);
  };

  const login = (phone: string, pin: string) => {
    if (user && user.phone === phone && user.pin === pin) {
      const updatedUser = { ...user, isLoggedIn: true };
      loginMutation.mutate(updatedUser);
      return true;
    } else {
      return false;
    }
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updates };
      loginMutation.mutate(updated);
    }
  };

  return {
    user,
    isLoading: isLoading || authQuery.isLoading,
    isLoggedIn: !!user?.isLoggedIn,
    createUser,
    login,
    logout,
    updateProfile,
  };
});
