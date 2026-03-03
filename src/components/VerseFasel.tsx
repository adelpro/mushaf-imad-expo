import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Fasel from "../../assets/images/fasel.svg";
import { toArabicDigits } from "../utils/toArabicDigits";

const BALANCE = 3.69;
const BASE_WIDTH = 21 * BALANCE;
const BASE_HEIGHT = 27 * BALANCE;
const BASE_FONT_SIZE = 14 * BALANCE;

type Props = {
  number: number;
  scale: number;
};

export function VerseFasel({ number, scale }: Props) {
  const width = BASE_WIDTH * scale;
  const height = BASE_HEIGHT * scale;
  const fontSize = BASE_FONT_SIZE * scale;

  return (
    <View style={[styles.container, { width, height }]}>
      <Fasel width={width} height={height} />
      <View style={styles.textWrapper}>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          numberOfLines={1}
          style={[styles.text, { fontSize }]}
        >
          {toArabicDigits(number)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  textWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    alignSelf: "stretch",
    textAlign: "center",
    fontFamily: "uthman_tn1_bold",
    color: "#000",
  },
});

