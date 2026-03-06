import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../theme";

/**
 * Placeholder for future Progress tracker.
 * Shown when user taps "التقدم" in the footer.
 */
export function ProgressScreen() {
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
});
