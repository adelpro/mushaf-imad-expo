import { useCallback, useEffect, useMemo, useRef } from "react";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const SETTLE_DURATION_MS = 120;

export type UseZoomPanParams = {
  width: number;
  contentHeight: number;
  contentHeightMax: number;
  isViewable: boolean;
};

export type UseZoomPanResult = {
  gesture: ReturnType<typeof Gesture.Simultaneous>;
  animatedStyle: Record<string, unknown>;
  /** Convert touch locationX (view coords) to content X for verse hit detection. Use when zoomed. */
  getContentX: (locationX: number) => number;
};

export function useZoomPan({
  width,
  contentHeight,
  contentHeightMax,
  isViewable,
}: UseZoomPanParams): UseZoomPanResult {
  const zoomScaleRef = useRef(1);
  const zoomTranslateXRef = useRef(0);
  const zoomTranslateYRef = useRef(0);
  const prevViewableRef = useRef(false);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const updateZoomRefs = useCallback((s: number, tx: number, ty: number) => {
    zoomScaleRef.current = s;
    zoomTranslateXRef.current = tx;
    zoomTranslateYRef.current = ty;
  }, []);

  useEffect(() => {
    const leftScreen = !isViewable && prevViewableRef.current;
    prevViewableRef.current = isViewable;
    if (!leftScreen) return;

    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    updateZoomRefs(1, 0, 0);
  }, [
    isViewable,
    scale,
    savedScale,
    translateX,
    translateY,
    savedTranslateX,
    savedTranslateY,
    updateZoomRefs,
  ]);

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onUpdate((e) => {
          const nextScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, savedScale.value * e.scale));
          const dx = e.focalX - width / 2;
          const dy = e.focalY - contentHeight / 2;
          let tx = dx * (1 - nextScale);
          let ty = dy * (1 - nextScale);
          const maxTx = (width * (nextScale - 1)) / 2;
          const maxTy = (contentHeightMax * (nextScale - 1)) / 2;
          tx = Math.max(-maxTx, Math.min(maxTx, tx));
          ty = Math.max(-maxTy, Math.min(maxTy, ty));
          scale.value = nextScale;
          translateX.value = tx;
          translateY.value = ty;
        })
        .onEnd(() => {
          const s = scale.value;
          const tx = translateX.value;
          const ty = translateY.value;
          scale.value = withTiming(s, { duration: SETTLE_DURATION_MS });
          translateX.value = withTiming(tx, { duration: SETTLE_DURATION_MS });
          translateY.value = withTiming(ty, { duration: SETTLE_DURATION_MS });
          savedScale.value = withTiming(s, { duration: SETTLE_DURATION_MS });
          savedTranslateX.value = tx;
          savedTranslateY.value = ty;
          runOnJS(updateZoomRefs)(s, tx, ty);
        }),
    [updateZoomRefs, width, contentHeight, contentHeightMax]
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .failOffsetX([-20, 20])
        .activeOffsetY(10)
        .onUpdate((e) => {
          if (scale.value <= MIN_ZOOM) return;
          const maxTx = (width * (scale.value - 1)) / 2;
          const maxTy = (contentHeightMax * (scale.value - 1)) / 2;
          translateX.value = Math.max(
            -maxTx,
            Math.min(maxTx, savedTranslateX.value + e.translationX)
          );
          translateY.value = Math.max(
            -maxTy,
            Math.min(maxTy, savedTranslateY.value + e.translationY)
          );
        })
        .onEnd(() => {
          const tx = translateX.value;
          const ty = translateY.value;
          translateX.value = withTiming(tx, { duration: SETTLE_DURATION_MS });
          translateY.value = withTiming(ty, { duration: SETTLE_DURATION_MS });
          savedTranslateX.value = tx;
          savedTranslateY.value = ty;
          runOnJS(updateZoomRefs)(scale.value, tx, ty);
        }),
    [updateZoomRefs, width, contentHeightMax]
  );

  const composedGesture = useMemo(
    () => Gesture.Simultaneous(pinchGesture, panGesture),
    [pinchGesture, panGesture]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const getContentX = useCallback((locationX: number) => {
    const s = zoomScaleRef.current;
    const tx = zoomTranslateXRef.current;
    if (s <= 0) return locationX - tx;
    return (locationX - tx) / s;
  }, []);

  return {
    gesture: composedGesture,
    animatedStyle,
    getContentX,
  };
}
