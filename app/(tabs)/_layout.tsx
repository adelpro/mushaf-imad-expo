import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Tabs, useRouter, useSegments } from "expo-router";

import { PageJumpInput } from "../../src/components/page-jump-input";
import { TabFooter, type TabId } from "../../src/components/tab-footer";
import { useMushafStore } from "../../src/store/mushaf-store";
import { useFooterAutoHide } from "../../src/hooks/use-footer-auto-hide";
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
  const currentPage = useMushafStore((s) => s.currentPage);
  const readCount = useMushafStore((s) => s.readCount);
  const setJumpToPage = useMushafStore((s) => s.setJumpToPage);

  useFooterAutoHide();

  const activeTab = useMemo<TabId>(() => {
    const tabSegment = segments[segments.length - 1];
    return tabSegment === "progress" ? "progress" : "mushaf";
  }, [segments]);

  const handleTabChange = useCallback(
    (tab: TabId) => {
      if (tab === activeTab) return;
      router.navigate(ROUTES[tab]);
    },
    [activeTab, router]
  );

  const handleJumpToPage = useCallback((page: number) => setJumpToPage(page), [setJumpToPage]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Tabs
          detachInactiveScreens={false}
          screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: "transparent" },
          }}
          tabBar={() => null}
        >
          <Tabs.Screen name="index" options={{ title: "المصحف" }} />
          <Tabs.Screen name="progress" options={{ title: "التقدم" }} />
        </Tabs>
      </View>
      <View style={styles.footerOverlay} pointerEvents="box-none">
        <TabFooter activeTab={activeTab} onTabChange={handleTabChange} visible={footerVisible} />
      </View>
      {activeTab === "mushaf" && (
        <View pointerEvents="box-none" style={styles.pageJumpOverlay}>
          <PageJumpInput
            currentPage={currentPage}
            onJumpToPage={handleJumpToPage}
            readCount={readCount}
          />
        </View>
      )}
    </View>
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
  pageJumpOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
