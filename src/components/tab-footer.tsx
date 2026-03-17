import React, { useCallback, useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme";

type IconComponentProps = {
  name: string;
  size?: number;
  color?: string;
};

const FOOTER_HEIGHT = 100;
const SLIDE_DURATION = 250;
const ICON_SIZE = 22;
const BUTTON_PADDING_VERTICAL = 8;
const BUTTON_PADDING_HORIZONTAL = 16;
const BORDER_RADIUS = 8;
const BUTTON_GAP = 4;
const FONT_SIZE = 14;

export type TabId = "mushaf" | "progress";

type TabConfig = {
  id: TabId;
  label: string;
  Icon: React.ComponentType<IconComponentProps>;
  iconName: string;
};

const TABS: TabConfig[] = [
  {
    id: "mushaf",
    label: "المصحف",
    Icon: Feather as React.ComponentType<IconComponentProps>,
    iconName: "book-open",
  },
  {
    id: "progress",
    label: "التقدم",
    Icon: AntDesign as React.ComponentType<IconComponentProps>,
    iconName: "bar-chart",
  },
];

type TabFooterProps = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  visible?: boolean;
};

function useFooterSlide(visible: boolean, height: number) {
  const translateY = useRef(new Animated.Value(visible ? 0 : height)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : height,
      duration: SLIDE_DURATION,
      useNativeDriver: true,
    }).start();
  }, [visible, translateY, height]);

  return translateY;
}

type TabButtonProps = {
  tab: TabConfig;
  isActive: boolean;
  onTabChange: (tab: TabId) => void;
};

const TabButton = React.memo(function TabButton({ tab, isActive, onTabChange }: TabButtonProps) {
  const handlePress = useCallback(() => onTabChange(tab.id), [onTabChange, tab.id]);

  const iconColor = isActive ? colors.brand.default : colors.text.tertiary;
  const { Icon, iconName } = tab;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={tab.label}
      style={({ pressed }) => [styles.footerButton, pressed && styles.footerButtonPressed]}
      onPress={handlePress}
    >
      <View style={styles.iconWrap}>
        <Icon name={iconName} size={ICON_SIZE} color={iconColor} />
      </View>
      <Text style={[styles.footerButtonText, isActive && styles.footerButtonTextActive]}>
        {tab.label}
      </Text>
    </Pressable>
  );
});

export function TabFooter({ activeTab, onTabChange, visible = true }: TabFooterProps) {
  const insets = useSafeAreaInsets();
  const totalHeight = FOOTER_HEIGHT + insets.bottom;
  const translateY = useFooterSlide(visible, totalHeight);

  return (
    <View style={[styles.footerWrapper, { height: totalHeight }]}>
      <Animated.View
        pointerEvents={visible ? "auto" : "none"}
        style={[
          styles.footer,
          {
            height: totalHeight,
            paddingBottom: insets.bottom,
            transform: [{ translateY }],
          },
        ]}
      >
        {TABS.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onTabChange={onTabChange}
          />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerWrapper: {
    overflow: "hidden",
  },
  footer: {
    backgroundColor: colors.background.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  footerButton: {
    paddingVertical: BUTTON_PADDING_VERTICAL,
    paddingHorizontal: BUTTON_PADDING_HORIZONTAL,
    borderRadius: BORDER_RADIUS,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    marginBottom: BUTTON_GAP,
  },
  footerButtonPressed: {
    opacity: 0.7,
  },
  footerButtonText: {
    fontSize: FONT_SIZE,
    color: colors.text.tertiary,
    fontWeight: "600",
  },
  footerButtonTextActive: {
    color: colors.brand.default,
  },
});
