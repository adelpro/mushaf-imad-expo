import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Amiri_400Regular } from "@expo-google-fonts/amiri";

import { TabFooter, type TabId } from "../src/components/tab-footer";
import { useMushafStore } from "../src/store/mushaf-store";
import { useUiStore } from "../src/store/ui-store";
import { getLastRead } from "../src/services/last-read-service";
import { colors } from "../src/theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions({ fade: true, duration: 1000 });

function AppNavigator() {
  const pathname = usePathname();
  const router = useRouter();
  const footerVisible = useUiStore((s) => s.footerVisible);

  const activeTab = useMemo<TabId>(
    () => (pathname === "/progress" ? "progress" : "mushaf"),
    [pathname],
  );

  const handleTabChange = useCallback(
    (tab: TabId) => {
      if (tab === activeTab) return;
      router.navigate(tab === "progress" ? "/progress" : "/");
    },
    [activeTab, router],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "none",
            contentStyle: { backgroundColor: "transparent" },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="progress" />
        </Stack>
      </View>
      <View style={styles.footerOverlay} pointerEvents="box-none">
        <TabFooter
          activeTab={activeTab}
          onTabChange={handleTabChange}
          visible={footerVisible}
        />
      </View>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    uthmanTn1Bold: require("../assets/fonts/UthmanTN1B-Ver20.ttf"),
    Amiri_400Regular,
  });

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    void (async () => {
      const lastRead = await getLastRead();
      if (lastRead) {
        useMushafStore.getState().setCurrentPage(lastRead.page);
      }
      setAppReady(true);
      await SplashScreen.hideAsync();
    })();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded || !appReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.loader}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.surface,
  },
  content: {
    ...StyleSheet.absoluteFillObject,
  },
  footerOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
