import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { registerRootComponent } from "expo";
import { useFonts } from "expo-font";
import { MushafScreen } from "./src/screens/MushafScreen";

export default function App() {
  const [fontsLoaded] = useFonts({
    uthman_tn1_bold: require("./assets/fonts/UthmanTN1B Ver20.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MushafScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
});

registerRootComponent(App);
