import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  PanGestureHandler,
  TapGestureHandler,
  State,
} from "react-native-gesture-handler";
import { TOTAL_PAGES } from "../constants/mushaf";
import { colors } from "../theme";

const MIN_PAGE = 1;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("window");
const DRAG_THRESHOLD = 8;

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export type PageJumpInputProps = {
  currentPage: number;
  onJumpToPage: (page: number) => void;
  readCount?: number;
  readPct?: number;
};

export function PageJumpInput({
  currentPage,
  onJumpToPage,
  readCount,
  readPct,
}: PageJumpInputProps) {
  const pct =
    readPct !== undefined
      ? readPct
      : readCount !== undefined
        ? Math.round((readCount / TOTAL_PAGES) * 100)
        : null;

  const [inputValue, setInputValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const offsetRef = useRef({ x: 0, y: 0 });

  const panRef = useRef(null);
  const tapRef = useRef(null);
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const kbH = e.endCoordinates.height;
      const bubbleBottom = 20 - offsetRef.current.y;
      const needed = Math.max(0, kbH + 10 - bubbleBottom);
      Animated.timing(keyboardHeight, {
        toValue: needed,
        duration: Platform.OS === "ios" ? e.duration : 200,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardHeight]);

  const onPanGestureEvent = useCallback(
    (event: {
      nativeEvent: { translationX: number; translationY: number };
    }) => {
      const { translationX: tx, translationY: ty } = event.nativeEvent;
      const halfW = SCREEN_WIDTH / 2;
      translateX.setValue(clamp(offsetRef.current.x + tx, -halfW, halfW));
      translateY.setValue(
        clamp(offsetRef.current.y + ty, -(SCREEN_HEIGHT - 100), 0),
      );
    },
    [translateX, translateY],
  );

  const onPanHandlerStateChange = useCallback(
    (event: {
      nativeEvent: {
        oldState: number;
        translationX: number;
        translationY: number;
      };
    }) => {
      if (event.nativeEvent.oldState === State.ACTIVE) {
        const { translationX: tx, translationY: ty } = event.nativeEvent;
        const halfW = SCREEN_WIDTH / 2;
        offsetRef.current = {
          x: clamp(offsetRef.current.x + tx, -halfW, halfW),
          y: clamp(offsetRef.current.y + ty, -(SCREEN_HEIGHT - 100), 0),
        };
      }
    },
    [],
  );

  const onTapHandlerStateChange = useCallback(
    (event: { nativeEvent: { state: number } }) => {
      if (event.nativeEvent.state === State.END) {
        setIsEditing(true);
      }
    },
    [],
  );

  function handleSubmit() {
    const page = Number.parseInt(inputValue, 10);
    if (!Number.isNaN(page) && page >= MIN_PAGE && page <= TOTAL_PAGES) {
      onJumpToPage(page);
    }
    setInputValue("");
    setIsEditing(false);
    Keyboard.dismiss();
  }

  if (isEditing) {
    return (
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.wrapper,
          {
            bottom: Animated.add(
              20 as unknown as Animated.Value,
              keyboardHeight,
            ),
          },
        ]}
      >
        <Animated.View
          style={[
            styles.bubbleWrap,
            { transform: [{ translateX }, { translateY }] },
          ]}
        >
          <View style={styles.editingBubble}>
            <TextInput
              autoFocus
              keyboardType="number-pad"
              maxLength={3}
              onBlur={() => {
                setIsEditing(false);
                setInputValue("");
              }}
              onChangeText={setInputValue}
              onSubmitEditing={handleSubmit}
              placeholder={`${MIN_PAGE}–${TOTAL_PAGES}`}
              placeholderTextColor={colors.text.tertiary}
              returnKeyType="go"
              style={styles.input}
              value={inputValue}
            />
            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.goButton,
                pressed && styles.goButtonPressed,
              ]}
            >
              <Text style={styles.goButtonText}>انتقال</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <PanGestureHandler
        ref={panRef}
        simultaneousHandlers={tapRef}
        onGestureEvent={onPanGestureEvent}
        onHandlerStateChange={onPanHandlerStateChange}
        activeOffsetX={[-DRAG_THRESHOLD, DRAG_THRESHOLD]}
        activeOffsetY={[-DRAG_THRESHOLD, DRAG_THRESHOLD]}
      >
        <Animated.View
          style={[
            styles.bubbleWrap,
            { transform: [{ translateX }, { translateY }] },
          ]}
        >
          <TapGestureHandler
            ref={tapRef}
            simultaneousHandlers={panRef}
            maxDist={DRAG_THRESHOLD}
            onHandlerStateChange={onTapHandlerStateChange}
          >
            <View style={styles.pageBubble}>
              <Text style={styles.pageLabel}>صفحة</Text>
              <Text style={styles.pageNumber}>{currentPage}</Text>
              <Text style={styles.totalPages}>/ {TOTAL_PAGES}</Text>
              {pct !== null && (
                <>
                  <View style={styles.pctDivider} />
                  <Text style={styles.pctText}>{pct}%</Text>
                </>
              )}
            </View>
          </TapGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
    elevation: 999,
  },
  bubbleWrap: {
    zIndex: 999,
    elevation: 999,
  },
  pageBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 4,
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 999,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  editingBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 999,
    borderWidth: 1,
    borderColor: colors.brand.default,
  },
  pageLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  pageNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.brand.default,
    minWidth: 28,
    textAlign: "center",
  },
  totalPages: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  pctDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border.default,
    marginHorizontal: 4,
  },
  pctText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brand.default,
    opacity: 0.8,
  },
  input: {
    backgroundColor: colors.background.subtle,
    borderRadius: 16,
    fontSize: 16,
    fontWeight: "600",
    minWidth: 64,
    paddingHorizontal: 12,
    paddingVertical: 4,
    textAlign: "center",
    color: colors.text.primary,
  },
  goButton: {
    backgroundColor: colors.brand.default,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  goButtonPressed: {
    opacity: 0.8,
  },
  goButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: "600",
  },
});
