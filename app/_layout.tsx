import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppDataProvider } from "@/contexts/AppDataContext";
import { GoogleSignin } from '@react-native-google-signin/google-signin';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// TODO: Replace with your Web Client ID from Google Cloud Console (OAuth 2.0 > Web application)
// Follow setup: https://react-native-google-signin.github.io/docs/setting-up/get-config-file
const WEB_CLIENT_ID = 'REPLACE_WITH_YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';

function RootLayoutNav() {
  const { isLoggedIn, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments[0] as string) === 'login';

    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/login' as any);
    } else if (isLoggedIn && inAuthGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [isLoggedIn, isLoading, segments, router]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen 
        name="add-farmer" 
        options={{ 
          presentation: 'modal',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="add-work" 
        options={{ 
          presentation: 'modal',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="profile" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="select-farmer-invoice" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="work-detail/[id]" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="generate-invoice/[farmerId]" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="invoice-detail/[id]" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      scopes: ['https://www.googleapis.com/auth/drive.appdata'],
      offlineAccess: true,
    });
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <AppDataProvider>
            <RootLayoutNav />
          </AppDataProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
