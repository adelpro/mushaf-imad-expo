import React, { useCallback, useEffect } from "react";
import { StyleSheet } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
  PinchGestureHandlerEventPayload,
  TapGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SNAP_BACK_THRESHOLD = 1.1;
const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 0.4 };

interface ZoomableViewProps {
  children: React.ReactNode;
  pageNumber: number;
  containerWidth: number;
  containerHeight: number;
  onZoomChange?: (isZoomed: boolean) => void;
}

export function ZoomableView({
  children,
  pageNumber,
  containerWidth,
  containerHeight,
  onZoomChange,
}: ZoomableViewProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(scale);
    cancelAnimation(translateX);
    cancelAnimation(translateY);
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    savedTranslateX.value = 0;
    translateY.value = 0;
    savedTranslateY.value = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  const notifyZoomChange = useCallback(
    (isZoomed: boolean) => {
      onZoomChange?.(isZoomed);
    },
    [onZoomChange],
  );

  const resetToMinScale = () => {
    "worklet";
    cancelAnimation(scale);
    cancelAnimation(translateX);
    cancelAnimation(translateY);
    scale.value = withSpring(MIN_SCALE, SPRING_CONFIG);
    translateX.value = withSpring(0, SPRING_CONFIG);
    translateY.value = withSpring(0, SPRING_CONFIG);
    savedScale.value = MIN_SCALE;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    runOnJS(notifyZoomChange)(false);
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate(
      (e: GestureUpdateEvent<PinchGestureHandlerEventPayload>) => {
        "worklet";
        scale.value = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, savedScale.value * e.scale),
        );
      },
    )
    .onEnd(() => {
      "worklet";
      if (scale.value < SNAP_BACK_THRESHOLD) {
        resetToMinScale();
      } else {
        savedScale.value = scale.value;
        runOnJS(notifyZoomChange)(true);
      }
    });

  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .minPointers(1)
    .manualActivation(true)
    .onTouchesMove((_e, stateManager) => {
      "worklet";
      if (scale.value > MIN_SCALE) {
        stateManager.activate();
      } else {
        stateManager.fail();
      }
    })
    .onUpdate(
      (e: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
        "worklet";
        const maxTx = (containerWidth * (scale.value - 1)) / 2;
        const maxTy = (containerHeight * (scale.value - 1)) / 2;

        translateX.value = Math.min(
          maxTx,
          Math.max(-maxTx, savedTranslateX.value + e.translationX),
        );
        translateY.value = Math.min(
          maxTy,
          Math.max(-maxTy, savedTranslateY.value + e.translationY),
        );
      },
    )
    .onEnd(() => {
      "worklet";
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(
      (_e: GestureStateChangeEvent<TapGestureHandlerEventPayload>) => {
        "worklet";
        resetToMinScale();
      },
    );

  const composed = Gesture.Exclusive(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
});
