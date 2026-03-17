import React, { useRef, useState } from "react";
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme";
import { markOnboardingDone } from "../services/onboarding-service";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Step = {
  emoji: string;
  title: string;
  body: string;
  hint?: string;
  /** Animated demo shown below the text */
  demo: React.ReactNode;
};

// ── tiny demo components ──────────────────────────────────────────────────────

function TabsDemo() {
  const [activeTab, setActiveTab] = useState<"mushaf" | "progress">("mushaf");
  const indicatorX = useRef(new Animated.Value(0)).current;

  function switchTab(tab: "mushaf" | "progress") {
    setActiveTab(tab);
    Animated.spring(indicatorX, {
      toValue: tab === "mushaf" ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
    }).start();
  }

  const indicatorLeft = indicatorX.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "50%"],
  });

  return (
    <View style={styles.demoTabsWrapper}>
      {/* Mini screen preview */}
      <View style={styles.demoTabsScreen}>
        {activeTab === "mushaf" ? (
          <View style={styles.demoTabsContent}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.demoTabsLine, i === 1 && { width: "60%" }]} />
            ))}
          </View>
        ) : (
          <View style={styles.demoTabsContent}>
            <View style={styles.demoTabsProgressCard}>
              <View style={styles.demoTabsProgressRow}>
                <View style={[styles.demoTabsLine, { width: "50%", height: 6 }]} />
                <View
                  style={[
                    styles.demoTabsLine,
                    {
                      width: "25%",
                      height: 6,
                      backgroundColor: colors.brand.default,
                      opacity: 0.5,
                    },
                  ]}
                />
              </View>
              <View style={[styles.demoTabsLine, { width: "70%", height: 6, marginTop: 4 }]} />
            </View>
          </View>
        )}

        {/* Tab bar */}
        <View style={styles.demoTabBar}>
          <Animated.View style={[styles.demoTabIndicator, { left: indicatorLeft }]} />
          <Pressable style={styles.demoTab} onPress={() => switchTab("mushaf")}>
            <Text style={[styles.demoTabIcon, activeTab === "mushaf" && styles.demoTabIconActive]}>
              📖
            </Text>
            <Text
              style={[styles.demoTabLabel, activeTab === "mushaf" && styles.demoTabLabelActive]}
            >
              المصحف
            </Text>
          </Pressable>
          <Pressable style={styles.demoTab} onPress={() => switchTab("progress")}>
            <Text
              style={[styles.demoTabIcon, activeTab === "progress" && styles.demoTabIconActive]}
            >
              📊
            </Text>
            <Text
              style={[styles.demoTabLabel, activeTab === "progress" && styles.demoTabLabelActive]}
            >
              التقدم
            </Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.demoHint}>اضغط على التبويبات للتنقل</Text>
    </View>
  );
}

function LongPressDemo() {
  const progress = useRef(new Animated.Value(0)).current;
  const [phase, setPhase] = useState<"idle" | "holding" | "popup">("idle");
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  function startPress() {
    if (phase === "popup") return;
    setPhase("holding");
    progress.setValue(0);
    animRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: 700,
      useNativeDriver: false,
    });
    animRef.current.start(({ finished }) => {
      if (finished) setPhase("popup");
    });
  }

  function endPress() {
    if (phase === "popup") return;
    animRef.current?.stop();
    Animated.timing(progress, { toValue: 0, duration: 200, useNativeDriver: false }).start(() =>
      setPhase("idle")
    );
  }

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <View style={styles.demoLongPressWrapper}>
      {/* Ayah line — hold target */}
      <Pressable onPressIn={startPress} onPressOut={endPress} style={styles.demoTapArea}>
        <View style={styles.demoAyahLine}>
          <Text style={styles.demoAyahText}>بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</Text>
          {phase === "holding" && (
            <View style={styles.demoProgressTrack}>
              <Animated.View style={[styles.demoProgressFill, { width: barWidth }]} />
            </View>
          )}
        </View>
        <Text style={styles.demoHint}>
          {phase === "popup" ? "اضغط إغلاق للعودة" : "اضغط مطولاً لتجربة"}
        </Text>
      </Pressable>

      {/* Mini verse popup overlay */}
      {phase === "popup" && (
        <View style={styles.demoPopupOverlay}>
          <View style={styles.demoPopup}>
            {/* Header */}
            <View style={styles.demoPopupHeader}>
              <Text style={styles.demoPopupChapter}>سورة الفاتحة</Text>
              <Text style={styles.demoPopupVerse}>الآية 1</Text>
            </View>
            {/* Verse text */}
            <View style={styles.demoPopupContent}>
              <Text style={styles.demoPopupArabic}>بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</Text>
            </View>
            {/* Actions */}
            <View style={styles.demoPopupFooter}>
              <View style={styles.demoPopupShareRow}>
                <View style={[styles.demoPopupBtn, styles.demoPopupBtnGreen]}>
                  <Text style={styles.demoPopupBtnText}>📤 مشاركة نص</Text>
                </View>
                <View style={[styles.demoPopupBtn, styles.demoPopupBtnBrown]}>
                  <Text style={styles.demoPopupBtnText}>🖼️ مشاركة صورة</Text>
                </View>
              </View>
              <View style={[styles.demoPopupBtnFull, styles.demoPopupBtnGreen]}>
                <Text style={styles.demoPopupBtnText}>🔖 حفظ التقدم عند هذه الآية</Text>
              </View>
              <View style={styles.demoPopupUtilRow}>
                <Text style={styles.demoPopupUtil}>نسخ</Text>
                <Pressable onPress={() => setPhase("idle")}>
                  <Text style={styles.demoPopupUtil}>إغلاق</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function BubbleDemo() {
  const pan = useRef(new Animated.ValueXY()).current;

  return (
    <View style={styles.demoBubbleArea} pointerEvents="box-none">
      <Animated.View style={[styles.demoBubble, { transform: pan.getTranslateTransform() }]}>
        <Text style={styles.demoBubbleText}>صفحة </Text>
        <Text style={[styles.demoBubbleText, { color: colors.brand.default, fontWeight: "700" }]}>
          ٧٤
        </Text>
        <Text style={styles.demoBubbleText}> / ٦٠٤</Text>
      </Animated.View>
      <Text style={[styles.demoHint, { marginTop: 8 }]}>اسحب الزر لتحريكه</Text>
    </View>
  );
}

// ── steps data ────────────────────────────────────────────────────────────────

const STEPS: Step[] = [
  {
    emoji: "👆",
    title: "ضغطة واحدة على الآية",
    body: "ضغطة واحدة على أي آية تُظهر أو تُخفي شريط التنقل بين المصحف والتقدم.",
    demo: <TabsDemo />,
  },
  {
    emoji: "✋",
    title: "ضغطة طويلة على الآية",
    body: "اضغط مطولاً على أي آية لمشاركتها أو حفظ تقدمك عندها.",
    demo: <LongPressDemo />,
  },
  {
    emoji: "🔢",
    title: "زر الصفحة",
    body: "اضغط على زر الصفحة في الأسفل للانتقال لأي صفحة مباشرةً، واسحبه لتحريكه في أي مكان.",
    demo: <BubbleDemo />,
  },
];

// ── main component ────────────────────────────────────────────────────────────

type OnboardingScreenProps = {
  onDone: () => void;
};

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const isLastStep = step === STEPS.length - 1;
  const current = STEPS[step];

  function animateToStep(next: number) {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  }

  function handleNext() {
    if (!isLastStep) {
      animateToStep(step + 1);
    } else {
      onDone();
    }
  }

  function handleSkip() {
    onDone();
  }

  async function handleDontShowAgain() {
    await markOnboardingDone();
    onDone();
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Skip */}
      <Pressable onPress={handleSkip} style={styles.skipBtn} hitSlop={12}>
        <Text style={styles.skipText}>تخطى</Text>
      </Pressable>

      {/* Step indicators */}
      <View style={styles.dots}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      {/* Content */}
      <Animated.View
        style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        <Text style={styles.emoji}>{current.emoji}</Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.body}>{current.body}</Text>
        <View style={styles.demoContainer}>{current.demo}</View>
      </Animated.View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [styles.nextBtn, pressed && styles.nextBtnPressed]}
        >
          <Text style={styles.nextText}>{isLastStep ? "ابدأ القراءة" : "التالي ←"}</Text>
        </Pressable>

        {isLastStep && (
          <Pressable onPress={handleDontShowAgain} hitSlop={8} style={styles.dontShowBtn}>
            <Text style={styles.dontShowText}>لا تظهر مرة أخرى</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  skipBtn: {
    alignSelf: "flex-start",
  },
  skipText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border.default,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.brand.default,
  },
  card: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 12,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
    writingDirection: "rtl",
  },
  body: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    writingDirection: "rtl",
    maxWidth: SCREEN_WIDTH - 64,
  },
  demoContainer: {
    marginTop: 12,
    width: "100%",
    alignItems: "center",
  },
  actions: {
    width: "100%",
    gap: 12,
    alignItems: "center",
  },
  nextBtn: {
    backgroundColor: colors.brand.default,
    borderRadius: 16,
    paddingHorizontal: 40,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
  },
  nextBtnPressed: {
    opacity: 0.85,
  },
  nextText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: "700",
  },
  dontShowBtn: {
    paddingVertical: 4,
  },
  dontShowText: {
    fontSize: 13,
    color: colors.text.tertiary,
    textDecorationLine: "underline",
  },

  // ── demo shared ──
  demoTapArea: {
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  demoHint: {
    fontSize: 12,
    color: colors.text.tertiary,
  },

  // ── tabs demo ──
  demoTabsWrapper: {
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  demoTabsScreen: {
    width: SCREEN_WIDTH - 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
    overflow: "hidden",
  },
  demoTabsContent: {
    padding: 16,
    gap: 8,
    minHeight: 80,
    justifyContent: "center",
  },
  demoTabsProgressCard: {
    gap: 6,
  },
  demoTabsProgressRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  demoTabBar: {
    height: 48,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    flexDirection: "row",
    position: "relative",
  },
  demoTabIndicator: {
    position: "absolute",
    top: 0,
    width: "50%",
    height: 2,
    backgroundColor: colors.brand.default,
    borderRadius: 1,
  },
  demoTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  demoTabIcon: {
    fontSize: 14,
    opacity: 0.4,
  },
  demoTabIconActive: {
    opacity: 1,
  },
  demoTabLabel: {
    fontSize: 10,
    color: colors.text.tertiary,
  },
  demoTabLabelActive: {
    color: colors.brand.default,
    fontWeight: "700",
  },
  demoTabsLine: {
    height: 8,
    backgroundColor: colors.border.default,
    borderRadius: 4,
    width: "100%",
  },

  // ── ayah line (shared by long press demo) ──
  demoAyahLine: {
    backgroundColor: colors.background.surface,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    width: SCREEN_WIDTH - 64,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: "hidden",
  },
  demoAyahText: {
    fontSize: 18,
    color: colors.text.primary,
    textAlign: "center",
    fontFamily: "uthmanTn1Bold",
  },

  // ── long press demo ──
  demoLongPressWrapper: {
    width: "100%",
    alignItems: "center",
    gap: 10,
    minHeight: 160,
  },
  demoPopupOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 12,
    zIndex: 10,
  },
  demoPopup: {
    backgroundColor: colors.background.surface,
    borderRadius: 14,
    width: "90%",
    overflow: "hidden",
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  demoPopupHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    alignItems: "center",
  },
  demoPopupChapter: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.brand.default,
  },
  demoPopupVerse: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  demoPopupContent: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  demoPopupArabic: {
    fontSize: 16,
    textAlign: "center",
    color: colors.text.primary,
    lineHeight: 28,
  },
  demoPopupFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    padding: 10,
    gap: 6,
    alignItems: "center",
  },
  demoPopupShareRow: {
    flexDirection: "row",
    gap: 6,
    width: "100%",
  },
  demoPopupBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: "center",
  },
  demoPopupBtnFull: {
    alignSelf: "stretch",
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: "center",
  },
  demoPopupBtnGreen: {
    backgroundColor: colors.brand.default,
  },
  demoPopupBtnBrown: {
    backgroundColor: colors.brand.accent,
  },
  demoPopupBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.inverse,
  },
  demoPopupUtilRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 2,
  },
  demoPopupUtil: {
    fontSize: 12,
    color: colors.text.tertiary,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  demoProgressTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.border.default,
    borderRadius: 2,
  },
  demoProgressFill: {
    height: "100%",
    backgroundColor: colors.brand.default,
    borderRadius: 2,
  },

  // ── bubble demo ──
  demoBubbleArea: {
    height: 100,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  demoBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border.default,
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  demoBubbleText: {
    fontSize: 15,
    color: colors.text.secondary,
  },
});
