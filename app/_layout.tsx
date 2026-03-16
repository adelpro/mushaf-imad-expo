import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { Amiri_400Regular } from "@expo-google-fonts/amiri";
import LottieView from "lottie-react-native";

import { OnboardingScreen } from "../src/screens/onboarding-screen";
import { useMushafStore } from "../src/store/mushaf-store";
import { getLastRead } from "../src/services/last-read-service";
import { hasSeenOnboarding } from "../src/services/onboarding-service";
import { databaseService } from "../src/services/sqlite-service";
import { colors } from "../src/theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions({ fade: true, duration: 1000 });

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    uthmanTn1Bold: require("../assets/fonts/UthmanTN1B-Ver20.ttf"),
    Amiri_400Regular,
  });

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    const prepare = async () => {
      try {
        const firstLaunch = await databaseService.isFirstLaunch();
        if (firstLaunch) setIsFirstLaunch(true);

        await SplashScreen.hideAsync();
        await databaseService.getDb();

        const [lastRead, seenOnboarding] = await Promise.all([
          getLastRead(),
          hasSeenOnboarding(),
        ]);
        if (lastRead) {
          useMushafStore.getState().setCurrentPage(lastRead.page);
        }
        setShowOnboarding(!seenOnboarding);
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
      }
    };

    prepare();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  if (!appReady) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.brand.default} />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  if (isFirstLaunch) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <View style={styles.splash}>
            <LottieView
              source={require("../assets/animations/mushaf.json")}
              autoPlay
              loop
              style={styles.lottie}
            />
            <ActivityIndicator size="large" color={colors.brand.default} style={styles.spinner} />
            <Text style={styles.message}>
              جارٍ تجهيز المصحف…{"\n"}
              سيكون جاهزاً في لحظات
            </Text>
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  if (showOnboarding) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
  splash: {
    flex: 1,
    backgroundColor: colors.background.default,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  lottie: {
    width: 280,
    height: 280,
  },
  spinner: {
    marginTop: 20,
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
    lineHeight: 32,
    textAlign: "center",
    color: colors.text.secondary,
    fontFamily: "uthmanTn1Bold",
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
