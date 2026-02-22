import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { User } from '@/types';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

type GoogleUser = {
  user: {
    id: string;
    name: string | null;
    email: string;
    photo: string | null;
    familyName: string | null;
    givenName: string | null;
  };
  idToken: string | null;
  serverAuthCode: string | null;
};

const AUTH_STORAGE_KEY = '@farm_app_auth';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);

  useEffect(() => {
    const checkGoogleSignIn = async () => {
      try {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
          const currentUser = await GoogleSignin.getCurrentUser();
          setGoogleUser(currentUser);
        }
      } catch (error) {
        console.error('Google Sign-In status check failed:', error);
      }
    };
    checkGoogleSignIn();
  }, []);

  const googleSignIn = async (): Promise<GoogleUser | null> => {
    try {
      await GoogleSignin.hasPlayServices();
      const user = await GoogleSignin.signIn();
      setGoogleUser(user);
      return user;
    } catch (error: any) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        console.error('Google Sign-In error:', error);
      }
      return null;
    }
  };

  const googleSignOut = async () => {
    try {
      await GoogleSignin.signOut();
      setGoogleUser(null);
    } catch (error) {
      console.error('Google Sign-Out error:', error);
    }
  };

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

  const saveProfile = (name: string, businessName: string, phone: string = '') => {
    const userData: User = {
      phone,
      name,
      businessName,
      isLoggedIn: true,
    };
    loginMutation.mutate(userData);
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
    googleUser,
    googleSignIn,
    googleSignOut,
    saveProfile,
    updateProfile,
  };
});
