import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Fasel from "../../assets/images/fasel.svg";
import { toArabicDigits } from "../utils/linguistic";
import { colors } from "../theme";

const BALANCE = 3.69;
const BASE_WIDTH = 21 * BALANCE;
const BASE_HEIGHT = 27 * BALANCE;
const BASE_FONT_SIZE = 14 * BALANCE;
const BASE_PADDING = 2 * BALANCE;

type Props = {
  number: number;
  scale: number;
  digitsFormat?: boolean;
};

export function VerseFasel({ number, scale, digitsFormat = true }: Props) {
  const width = BASE_WIDTH * scale;
  const height = BASE_HEIGHT * scale;
  const fontSize = BASE_FONT_SIZE * scale;
  const paddingHorizontal = BASE_PADDING * scale;

  return (
    <View style={[styles.container, { width, height }]}>
      <Fasel width={width} height={height} />
      <View style={styles.textContainer}>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.3}
          numberOfLines={1}
          style={[
            styles.text,
            {
              fontSize,
              paddingHorizontal,
              width: "100%",
            },
          ]}
        >
          {digitsFormat ? toArabicDigits(number) : String(number)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  textContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    textAlign: "center",
    fontFamily: "uthman_tn1_bold",
    color: colors.text.primary,
  },
});
