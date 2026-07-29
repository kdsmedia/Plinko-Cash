import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GameProvider, useGame } from '@/contexts/GameContext';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

/** Mounted inside GameProvider so it can read soundEnabled from context */
function BackgroundMusicController() {
  const { settings } = useGame();
  useBackgroundMusic(settings.soundEnabled);
  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <GameProvider>
            <BackgroundMusicController />
            <StatusBar style="light" backgroundColor="#020617" />
            <RootLayoutNav />
          </GameProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
