import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { User } from '@/types';

const AUTH_STORAGE_KEY = '@farm_app_auth';
const MAGIC_OTP = '123456'; // For demo purposes

export const [AuthProvider, useAuth] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [pendingPhone, setPendingPhone] = useState('');

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
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    },
    onSuccess: () => {
      setUser(null);
      setOtpSent(false);
      setPendingPhone('');
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const sendOtp = (phone: string) => {
    // In a real app, you would integrate with an SMS service like Firebase here.
    console.log(`Sending OTP to ${phone}. For demo, use: ${MAGIC_OTP}`);
    setPendingPhone(phone);
    setOtpSent(true);
    return true;
  };

  const verifyOtp = (otp: string): boolean => {
    // In a real app, you would send the OTP to your backend for verification.
    if (otp === MAGIC_OTP) {
      return true;
    }
    return false;
  };

  const completeLogin = (name: string, businessName: string) => {
    const userData: User = {
      phone: pendingPhone,
      name,
      businessName,
      isLoggedIn: true,
    };
    loginMutation.mutate(userData);
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
    otpSent,
    pendingPhone,
    sendOtp,
    verifyOtp,
    completeLogin,
    logout,
    updateProfile,
    resetOtpState: () => {
      setOtpSent(false);
      setPendingPhone('');
    },
  };
});
