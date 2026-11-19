import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AudioController } from '@/components/AudioController';
import { useAudioStore } from '@/store/useAudioStore';
import { useSessionStore } from '@/store/useSessionStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const hydrate = useSessionStore((s) => s.hydrate);
  const isBooted = useSessionStore((s) => s.isBooted);
  const loadTracks = useAudioStore((s) => s.loadTracks);

  useEffect(() => {
    (async () => {
      await hydrate();
      await loadTracks();
    })();
  }, [hydrate, loadTracks]);

  useEffect(() => {
    if ((fontsLoaded || fontError) && isBooted) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isBooted]);

  if ((!fontsLoaded && !fontError) || !isBooted) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AudioController />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
