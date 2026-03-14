import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Amiri_400Regular } from "@expo-google-fonts/amiri";

import { OnboardingScreen } from "../src/screens/onboarding-screen";
import { useMushafStore } from "../src/store/mushaf-store";
import { getLastRead } from "../src/services/last-read-service";
import { hasSeenOnboarding } from "../src/services/onboarding-service";
import { colors } from "../src/theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions({ fade: true, duration: 1000 });

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    uthmanTn1Bold: require("../assets/fonts/UthmanTN1B-Ver20.ttf"),
    Amiri_400Regular,
  });

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    void (async () => {
      const [lastRead, seenOnboarding] = await Promise.all([
        getLastRead(),
        hasSeenOnboarding(),
      ]);
      if (lastRead) {
        useMushafStore.getState().setCurrentPage(lastRead.page);
      }
      setShowOnboarding(!seenOnboarding);
      setAppReady(true);
      await SplashScreen.hideAsync();
    })();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded || !appReady) {
    return (
      <GestureHandlerRootView style={styles.flex1}>
        <SafeAreaProvider>
          <View style={styles.loader}>
            <ActivityIndicator size="large" />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  if (showOnboarding) {
    return (
      <GestureHandlerRootView style={styles.flex1}>
        <SafeAreaProvider>
          <StatusBar style="dark" backgroundColor={colors.background.default} />
          <View style={styles.onboarding}>
            <OnboardingScreen onDone={() => setShowOnboarding(false)} />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex1}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  onboarding: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
});
