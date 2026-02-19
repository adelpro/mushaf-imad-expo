import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Fasel from "../../assets/images/fasel.svg";
import { toArabicDigits } from "../utils/to-arabic-digits";

const BALANCE = 3.69;
const BASE_WIDTH = 21 * BALANCE;
const BASE_HEIGHT = 27 * BALANCE;
const BASE_FONT_SIZE = 14 * BALANCE;
const BASE_PADDING = 2 * BALANCE;

type Props = {
  number: number;
  scale: number;
};

export function VerseFasel({ number, scale }: Props) {
  const width = BASE_WIDTH * scale;
  const height = BASE_HEIGHT * scale;
  const fontSize = BASE_FONT_SIZE * scale;
  const paddingHorizontal = BASE_PADDING * scale;

  return (
    <View style={[styles.container, { width, height }]}>
      <Fasel width={width} height={height} />
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={[
          styles.text,
          {
            fontSize,
            paddingHorizontal,
            transform: [{ translateX: -1 * scale }, { translateY: 1 * scale }],
          },
        ]}
      >
        {toArabicDigits(number)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  text: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    textAlign: "center",
    textAlignVertical: "center",
    fontFamily: "uthman_tn1_bold",
    color: "#000",
  },
});
