import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { Amiri_400Regular } from "@expo-google-fonts/amiri";

import { MushafScreen } from "./src/screens/mushaf-screen";
import { ProgressScreen } from "./src/screens/progress-screen";
import { OnboardingScreen } from "./src/screens/onboarding-screen";
import { TabFooter, type TabId } from "./src/components/tab-footer";
import { useMushafStore } from "./src/store/mushaf-store";
import { getLastRead } from "./src/services/last-read-service";
import { hasSeenOnboarding } from "./src/services/onboarding-service";
import { databaseService } from "./src/services/sqlite-service";
import { colors } from "./src/theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions({ fade: true, duration: 1000 });

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("mushaf");
  const [footerVisible, setFooterVisible] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [progressRefreshKey, setProgressRefreshKey] = useState(0);

  const setJumpToPage = useMushafStore((s) => s.setJumpToPage);
  const setCurrentPage = useMushafStore((s) => s.setCurrentPage);

  const handleTabChange = useCallback((tab: TabId) => {
    if (tab === "progress") setProgressRefreshKey((k) => k + 1);
    setActiveTab(tab);
  }, []);

  const handleContinueReading = useCallback(
    (page: number) => {
      setJumpToPage(page);
      setCurrentPage(page);
      setActiveTab("mushaf");
    },
    [setJumpToPage, setCurrentPage]
  );

  const [fontsLoaded, fontError] = useFonts({
    uthmanTn1Bold: require("./assets/fonts/UthmanTN1B-Ver20.ttf"),
    Amiri_400Regular,
  });

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    const prepare = async () => {
      try {
        console.log("[App] Starting preparation...");
        await SplashScreen.hideAsync();
        
        console.log("[App] Initializing database...");
        const dbPromise = databaseService.getDb();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Database initialization timeout")), 30000)
        );
        
        await Promise.race([dbPromise, timeoutPromise]);
        console.log("[App] Database initialized");

        const [lastRead, seenOnboarding] = await Promise.all([
          getLastRead(),
          hasSeenOnboarding(),
        ]);
        
        if (lastRead) {
          useMushafStore.getState().setCurrentPage(lastRead.page);
        }
        setShowOnboarding(!seenOnboarding);
        console.log("[App] Preparation complete");
      } catch (e) {
        console.error("[App] Preparation error:", e);
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
            <View style={{ marginTop: 20 }}>
              <Text style={{ color: colors.text.secondary, textAlign: "center" }}>
                جاري تجهيز المصحف...
              </Text>
              <Text style={{ color: colors.text.secondary, textAlign: "center", marginTop: 5 }}>
                سيكون جاهزاً في لحظات
              </Text>
            </View>
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
        <SafeAreaView style={styles.container}>
          <StatusBar style="dark" />
          <View style={styles.content}>
            {activeTab === "mushaf" && (
              <MushafScreen onContentTap={() => setFooterVisible((v) => !v)} />
            )}
            {activeTab === "progress" && (
              <ProgressScreen key={progressRefreshKey} onContinueReading={handleContinueReading} />
            )}
          </View>
          <TabFooter activeTab={activeTab} onTabChange={handleTabChange} visible={footerVisible} />
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
  onboarding: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
