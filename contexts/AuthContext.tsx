import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { User } from '@/types';

const AUTH_STORAGE_KEY = '@farm_app_auth';
const USERS_STORAGE_KEY = '@farm_app_users';

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

  const register = async (userData: {
    fullName: string;
    email: string;
    phone?: string;
    farmName?: string;
    farmSize?: string;
    location?: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const stored = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users: User[] = stored ? JSON.parse(stored) : [];
      const exists = users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase());
      if (exists) {
        return { success: false, error: 'An account with this email already exists' };
      }
      const newUser: User = {
        name: userData.fullName,
        email: userData.email.toLowerCase(),
        phone: userData.phone,
        businessName: userData.farmName || 'My Farm',
        farmSize: userData.farmSize,
        location: userData.location,
        password: userData.password,
        isLoggedIn: true,
      };
      users.push(newUser);
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      loginMutation.mutate(newUser);
      return { success: true };
    } catch {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const stored = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users: User[] = stored ? JSON.parse(stored) : [];
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!found) {
        return { success: false, error: 'No account found with this email address' };
      }
      if (found.password !== password) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
      const loggedInUser = { ...found, isLoggedIn: true };
      loginMutation.mutate(loggedInUser);
      return { success: true };
    } catch {
      return { success: false, error: 'Login failed. Please try again.' };
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
    register,
    login,
    logout,
    updateProfile,
  };
});
