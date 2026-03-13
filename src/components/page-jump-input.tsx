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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type PageJumpInputProps = {
  currentPage: number;
  onJumpToPage: (page: number) => void;
};

export function PageJumpInput({ currentPage, onJumpToPage }: PageJumpInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Keyboard offset animation
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const kbHeight = e.endCoordinates.height;
      // Effective bottom = base (70) minus translateY (negative Y = higher)
      const effectiveBottom = 70 - lastOffset.current.y;
      const needed = Math.max(0, kbHeight - effectiveBottom + 50); // 50px padding
      Animated.timing(keyboardOffset, {
        toValue: needed,
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

  // Draggable position
  const pan = useRef(new Animated.ValueXY()).current;
  const lastOffset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture drag if moved more than 5px (avoids blocking taps)
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        isDragging.current = false;
        pan.setOffset({
          x: lastOffset.current.x,
          y: lastOffset.current.y,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gestureState) => {
        isDragging.current = true;
        Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        })(_, gestureState);
      },
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();

        // Clamp within screen bounds
        const buttonWidth = 140;
        const buttonHeight = 40;
        const minX = -(SCREEN_WIDTH / 2 - buttonWidth / 2);
        const maxX = SCREEN_WIDTH / 2 - buttonWidth / 2;
        const minY = -(SCREEN_HEIGHT / 2 - buttonHeight);
        const maxY = SCREEN_HEIGHT / 2 - buttonHeight - 80;

        const clampedX = Math.max(minX, Math.min(maxX, lastOffset.current.x + gestureState.dx));
        const clampedY = Math.max(minY, Math.min(maxY, lastOffset.current.y + gestureState.dy));

        lastOffset.current = { x: clampedX, y: clampedY };

        Animated.spring(pan, {
          toValue: { x: clampedX, y: clampedY },
          useNativeDriver: false,
          friction: 7,
        }).start(() => {
          isDragging.current = false;
        });
      },
    }),
  ).current;

  function handleSubmit() {
    const page = Number.parseInt(inputValue, 10);
    if (page >= MIN_PAGE && page <= TOTAL_PAGES) {
      onJumpToPage(page);
    }
    setInputValue("");
    setIsEditing(false);
    Keyboard.dismiss();
  }

  if (isEditing) {
    return (
      <Animated.View
        style={[
          styles.floatingContainer,
          { transform: pan.getTranslateTransform(), bottom: Animated.add(70, keyboardOffset) },
        ]}
        {...panResponder.panHandlers}
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
            placeholder={`${MIN_PAGE}-${TOTAL_PAGES}`}
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
    );
  }

  return (
    <Animated.View
      style={[
        styles.floatingContainer,
        { transform: pan.getTranslateTransform(), bottom: Animated.add(70, keyboardOffset) },
      ]}
      {...panResponder.panHandlers}
    >
      <Pressable
        style={styles.pageBubble}
        onPress={() => {
          if (!isDragging.current) {
            setIsEditing(true);
          }
        }}
      >
        <Text style={styles.pageLabel}>صفحة</Text>
        <Text style={styles.pageNumber}>{currentPage}</Text>
        <Text style={styles.totalPages}>/ {TOTAL_PAGES}</Text>
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
