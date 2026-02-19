import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";

import { MushafScreen } from "./src/screens/MushafScreen";
import React = require("react");

SplashScreen.preventAutoHideAsync().catch(() => undefined);

SplashScreen.setOptions({ fade: true, duration: 1000 });

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    uthmanTn1Bold: require("./assets/fonts/UthmanTN1B-Ver20.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (fontError) {
    return (
      <View
        style={{
          flex: 1,
          position: "relative",
        }}
      >
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 20,
            zIndex: 10,
            backgroundColor: "#252525",
            borderColor: "white",
            borderStyle: "solid",
            borderWidth: 3,
            width: "90%",
            height: 50,
            bottom: 10,
            position: "absolute",
            left: "50%",
            transform: "translate(-50%)",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {"\u2757"} تعذر تحميل الخط، الرجاء اعادة تشغيل التطبيق
          </Text>
          <Text style={{ color: "#D34E4E", fontWeight: "bold" }}>
            {String(fontError)}
          </Text>
        </View>
        <SafeAreaView style={styles.container}>
          <StatusBar style="dark" />
          <MushafScreen />
        </SafeAreaView>
      </View>
    );
  }

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
      <MushafScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
