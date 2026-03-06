import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";

import { MushafScreen } from "./src/screens/mushaf-screen";
import { ProgressScreen } from "./src/screens/progress-screen";
import { TabFooter, type TabId } from "./src/components/tab-footer";
import { colors } from "./src/theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

SplashScreen.setOptions({ fade: true, duration: 1000 });

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("mushaf");
  const [footerVisible, setFooterVisible] = useState(true);
  const [fontsLoaded, fontError] = useFonts({
    uthmanTn1Bold: require("./assets/fonts/UthmanTN1B-Ver20.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {activeTab === "mushaf" && (
          <View style={styles.tabContent} pointerEvents="auto">
            <MushafScreen
              onContentTap={() => setFooterVisible((v) => !v)}
            />
          </View>
        )}
        {activeTab === "progress" && (
          <View style={styles.tabContent} pointerEvents="auto">
            <ProgressScreen />
          </View>
        )}
      </View>
      <View style={styles.footerOverlay} pointerEvents="box-none">
        <TabFooter
          activeTab={activeTab}
          onTabChange={setActiveTab}
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
