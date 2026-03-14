import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Amiri_400Regular } from "@expo-google-fonts/amiri";

import { MushafScreen } from "./src/screens/mushaf-screen";
import { ProgressScreen } from "./src/screens/progress-screen";
import { TabFooter, type TabId } from "./src/components/tab-footer";
import { useMushafStore } from "./src/store/mushaf-store";
import { getLastRead } from "./src/services/last-read-service";
import { colors } from "./src/theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

SplashScreen.setOptions({ fade: true, duration: 1000 });

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("mushaf");
  const [footerVisible, setFooterVisible] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [progressRefreshKey, setProgressRefreshKey] = useState(0);
  const setJumpToPage = useMushafStore((s) => s.setJumpToPage);
  const setCurrentPage = useMushafStore((s) => s.setCurrentPage);

  const handleTabChange = useCallback(
    (tab: TabId) => {
      if (tab === "progress") {
        // Bump key every time the progress tab is opened so it re-fetches
        setProgressRefreshKey((k) => k + 1);
      }
      setActiveTab(tab);
    },
    [],
  );

  const handleContinueReading = useCallback(
    (page: number) => {
      setJumpToPage(page);
      setCurrentPage(page); // So store doesn't fall back to last scroll position (e.g. 74)
      setActiveTab("mushaf");
    },
    [setJumpToPage, setCurrentPage],
  );
  
  const [fontsLoaded, fontError] = useFonts({
    uthmanTn1Bold: require("./assets/fonts/UthmanTN1B-Ver20.ttf"),
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
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.content}>
          {activeTab === "mushaf" && <MushafScreen onContentTap={() => setFooterVisible(v => !v)} />}
          {activeTab === "progress" && (
            <ProgressScreen
              key={progressRefreshKey}
              onContinueReading={handleContinueReading}
            />
          )}
        </View>
        <TabFooter
          activeTab={activeTab}
          onTabChange={handleTabChange}
          visible={footerVisible}
        />
      </SafeAreaView>
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
  tabContent: {
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
