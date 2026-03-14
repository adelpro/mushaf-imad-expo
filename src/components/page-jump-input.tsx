import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { TOTAL_PAGES } from "../constants/mushaf";
import { colors } from "../theme";

const MIN_PAGE = 1;
const BUTTON_WIDTH = 160;
const BUTTON_HEIGHT = 44;

export type PageJumpInputProps = {
  currentPage: number;
  onJumpToPage: (page: number) => void;
  readCount?: number;
  readPct?: number;
};

export function PageJumpInput({ currentPage, onJumpToPage, readCount, readPct }: PageJumpInputProps) {
  const pct =
    readPct !== undefined
      ? readPct
      : readCount !== undefined
        ? Math.round((readCount / TOTAL_PAGES) * 100)
        : null;

  const [inputValue, setInputValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Keep a ref so PanResponder (created once) can read the latest value
  const isEditingRef = useRef(false);
  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);

  // ── Keyboard avoidance ──────────────────────────────────────────────────────
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardOffset, {
        toValue: e.endCoordinates.height,
        duration: Platform.OS === "ios" ? e.duration : 200,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardOffset]);

  // ── Draggable position ──────────────────────────────────────────────────────
  const pan = useRef(new Animated.ValueXY()).current;
  const lastOffset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStarted = useRef(false);

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
  const minX = -(SCREEN_WIDTH / 2 - BUTTON_WIDTH / 2);
  const maxX = SCREEN_WIDTH / 2 - BUTTON_WIDTH / 2;
  const minY = -(SCREEN_HEIGHT / 2 - BUTTON_HEIGHT);
  const maxY = SCREEN_HEIGHT / 2 - BUTTON_HEIGHT - 80;

  const panResponder = useRef(
    PanResponder.create({
      // Never steal the initial touch – let Pressable handle taps
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,

      // Claim the gesture only after a clear drag movement
      onMoveShouldSetPanResponder: (_, gs) => {
        if (isEditingRef.current) return false;
        return Math.abs(gs.dx) > 6 || Math.abs(gs.dy) > 6;
      },
      onMoveShouldSetPanResponderCapture: () => false,

      onPanResponderGrant: () => {
        dragStarted.current = true;
        isDragging.current = false;
        pan.setOffset({ x: lastOffset.current.x, y: lastOffset.current.y });
        pan.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: (_, gs) => {
        if (Math.abs(gs.dx) > 2 || Math.abs(gs.dy) > 2) {
          isDragging.current = true;
        }
        pan.setValue({ x: gs.dx, y: gs.dy });
      },

      onPanResponderRelease: (_, gs) => {
        pan.flattenOffset();

        const newX = lastOffset.current.x + gs.dx;
        const newY = lastOffset.current.y + gs.dy;
        const clampedX = Math.max(minX, Math.min(maxX, newX));
        const clampedY = Math.max(minY, Math.min(maxY, newY));

        lastOffset.current = { x: clampedX, y: clampedY };

        Animated.spring(pan, {
          toValue: { x: clampedX, y: clampedY },
          useNativeDriver: false,
          friction: 7,
        }).start(() => {
          isDragging.current = false;
          dragStarted.current = false;
        });
      },

      onPanResponderTerminate: () => {
        isDragging.current = false;
        dragStarted.current = false;
      },
    }),
  ).current;

  // ── Handlers ────────────────────────────────────────────────────────────────
  function handleSubmit() {
    const page = Number.parseInt(inputValue, 10);
    if (!Number.isNaN(page) && page >= MIN_PAGE && page <= TOTAL_PAGES) {
      onJumpToPage(page);
    }
    setInputValue("");
    setIsEditing(false);
    Keyboard.dismiss();
  }

  function handleBubblePress() {
    if (!isDragging.current) {
      setIsEditing(true);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      // When editing: fixed bottom, moves up with keyboard, NOT draggable
      <Animated.View
        style={[
          styles.floatingContainer,
          { bottom: Animated.add(16, keyboardOffset) },
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
            style={({ pressed }) => [styles.goButton, pressed && styles.goButtonPressed]}
          >
            <Text style={styles.goButtonText}>انتقال</Text>
          </Pressable>
        </View>
      </Animated.View>
    );
  }

  return (
    // When idle: draggable, sits 70px from bottom
    <Animated.View
      style={[
        styles.floatingContainer,
        { transform: pan.getTranslateTransform(), bottom: 70 },
      ]}
      {...panResponder.panHandlers}
    >
      <Pressable style={styles.pageBubble} onPress={handleBubblePress}>
        <Text style={styles.pageLabel}>صفحة</Text>
        <Text style={styles.pageNumber}>{currentPage}</Text>
        <Text style={styles.totalPages}>/ {TOTAL_PAGES}</Text>
        {pct !== null && (
          <>
            <View style={styles.pctDivider} />
            <Text style={styles.pctText}>{pct}%</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 100,
    elevation: 10,
  },
  pageBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border.default,
    minWidth: BUTTON_WIDTH,
    justifyContent: "center",
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
    elevation: 8,
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
