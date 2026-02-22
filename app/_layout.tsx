import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppDataProvider } from "@/contexts/AppDataContext";
import { GoogleSignin } from '@react-native-google-signin/google-signin';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Configure Google Sign-In
const WEB_CLIENT_ID = '594087320964-7pdk3q04ii7h5mo2855f7a1vunns900h.apps.googleusercontent.com';

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
    // Initialize Google Sign-In
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.file'],
      webClientId: WEB_CLIENT_ID,
      offlineAccess: true, // Required for refreshing tokens
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
