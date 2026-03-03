import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import Fasel from "../../assets/images/fasel.svg";
import { toArabicDigits } from "../utils/toArabicDigits";

const BALANCE = 3.69;
const BASE_WIDTH = 21 * BALANCE;
const BASE_HEIGHT = 27 * BALANCE;
const BASE_FONT_SIZE = 14 * BALANCE;
const BASE_PADDING = 2 * BALANCE;

export type VerseFaselHandle = {
  pulse: () => void;
};

type Props = {
  number: number;
  scale: number;
};

export const VerseFasel = forwardRef<VerseFaselHandle, Props>(
  function VerseFasel({ number, scale }, ref) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const runningAnim = useRef<Animated.CompositeAnimation | null>(null);

    useImperativeHandle(ref, () => ({
      pulse() {
        runningAnim.current?.stop();
        scaleAnim.setValue(1);
        const anim = Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.25,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]);
        runningAnim.current = anim;
        anim.start(() => {
          runningAnim.current = null;
        });
      },
    }), [scaleAnim]);

    useEffect(() => {
      return () => {
        runningAnim.current?.stop();
      };
    }, []);

    const width = BASE_WIDTH * scale;
    const height = BASE_HEIGHT * scale;
    const fontSize = BASE_FONT_SIZE * scale;
    const paddingHorizontal = BASE_PADDING * scale;

    return (
      <Animated.View
        style={[
          styles.container,
          { width, height, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Fasel width={width} height={height} />
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          style={[
            styles.text,
            {
              fontSize,
              paddingHorizontal,
              transform: [
                { translateX: -1 * scale },
                { translateY: 1 * scale },
              ],
            },
          ]}
        >
          {toArabicDigits(number)}
        </Text>
      </Animated.View>
    );
  },
);

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
