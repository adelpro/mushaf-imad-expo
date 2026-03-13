import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Tabs, useRouter, useSegments } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { TabFooter, type TabId } from "../../src/components/tab-footer";
import { useUiStore } from "../../src/store/ui-store";
import { colors } from "../../src/theme";

/** Tab route paths: explicit (tabs) routes for reliable tab switching (no remount). */
const ROUTES = {
  mushaf: "/(tabs)",
  progress: "/(tabs)/progress",
} as const;

export default function TabsLayout() {
  const segments = useSegments();
  const router = useRouter();
  const footerVisible = useUiStore((s) => s.footerVisible);

  const activeTab = useMemo<TabId>(() => {
    const tabSegment = segments[segments.length - 1];
    return tabSegment === "progress" ? "progress" : "mushaf";
  }, [segments]);

  const handleTabChange = useCallback(
    (tab: TabId) => {
      if (tab === activeTab) return;
      router.navigate(ROUTES[tab]);
    },
    [activeTab, router],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Keep both tabs mounted so tab switch and Continue Reading are instant (no remount). */}
        <Tabs
          detachInactiveScreens={false}
          screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: "transparent" },
          }}
          tabBar={() => null}
        >
          <Tabs.Screen
            name="index"
            options={{ title: "المصحف" }}
          />
          <Tabs.Screen
            name="progress"
            options={{ title: "التقدم" }}
          />
        </Tabs>
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
});
