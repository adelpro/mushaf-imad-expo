import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
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

function TapDemo() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  function pulse() {
    opacity.setValue(0);
    scale.setValue(1);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scale, { toValue: 0.93, duration: 120, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  }

  return (
    <Pressable onPress={pulse} style={styles.demoTapArea}>
      <Animated.View style={[styles.demoTapRipple, { opacity }]} />
      <Animated.View style={[styles.demoAyahLine, { transform: [{ scale }] }]}>
        <Text style={styles.demoAyahText}>
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </Text>
      </Animated.View>
      <Text style={styles.demoHint}>اضغط هنا لتجربة</Text>
    </Pressable>
  );
}

function LongPressDemo() {
  const progress = useRef(new Animated.Value(0)).current;
  const [active, setActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function startPress() {
    setActive(true);
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 600,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) setActive(false);
    });
  }

  function endPress() {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(progress, { toValue: 0, duration: 200, useNativeDriver: false }).start(() =>
      setActive(false),
    );
  }

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <Pressable onPressIn={startPress} onPressOut={endPress} style={styles.demoTapArea}>
      <View style={styles.demoAyahLine}>
        <Text style={styles.demoAyahText}>
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </Text>
        {active && (
          <View style={styles.demoProgressTrack}>
            <Animated.View style={[styles.demoProgressFill, { width: barWidth }]} />
          </View>
        )}
      </View>
      <Text style={styles.demoHint}>اضغط مطولاً لتجربة</Text>
    </Pressable>
  );
}

function BubbleDemo() {
  const pan = useRef(new Animated.ValueXY()).current;
  const lastOffset = useRef({ x: 0, y: 0 });

  return (
    <View style={styles.demoBubbleArea} pointerEvents="box-none">
      <Animated.View
        style={[styles.demoBubble, { transform: pan.getTranslateTransform() }]}
      >
        <Text style={styles.demoBubbleText}>صفحة </Text>
        <Text style={[styles.demoBubbleText, { color: colors.brand.default, fontWeight: "700" }]}>٧٤</Text>
        <Text style={styles.demoBubbleText}> / ٦٠٤</Text>
      </Animated.View>
      <Text style={[styles.demoHint, { marginTop: 8 }]}>اسحب الزر لتحريكه</Text>
    </View>
  );
}

function FooterDemo() {
  const [visible, setVisible] = useState(true);
  const translateY = useRef(new Animated.Value(0)).current;

  function toggle() {
    const toValue = visible ? 80 : 0;
    Animated.spring(translateY, { toValue, useNativeDriver: true, friction: 8 }).start();
    setVisible((v) => !v);
  }

  return (
    <Pressable onPress={toggle} style={styles.demoTapArea}>
      <View style={styles.demoFooterScreen}>
        <View style={styles.demoFooterLines}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.demoFooterLine} />
          ))}
        </View>
        <Animated.View style={[styles.demoFooterBar, { transform: [{ translateY }] }]}>
          <View style={styles.demoFooterTab} />
          <View style={[styles.demoFooterTab, { backgroundColor: colors.brand.default }]} />
        </Animated.View>
      </View>
      <Text style={styles.demoHint}>اضغط لإظهار / إخفاء</Text>
    </Pressable>
  );
}

// ── steps data ────────────────────────────────────────────────────────────────

const STEPS: Step[] = [
  {
    emoji: "👆",
    title: "ضغطة واحدة على الآية",
    body: "ضغطة واحدة على أي آية تُظهر أو تُخفي شريط التنقل السفلي.",
    demo: <FooterDemo />,
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
        style={[
          styles.card,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
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
          <Text style={styles.nextText}>
            {isLastStep ? "ابدأ القراءة" : "التالي ←"}
          </Text>
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

  // ── tap demo ──
  demoTapRipple: {
    position: "absolute",
    width: SCREEN_WIDTH - 64,
    height: 52,
    borderRadius: 8,
    backgroundColor: colors.brand.highlight,
  },
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

  // ── footer demo ──
  demoFooterScreen: {
    width: SCREEN_WIDTH - 64,
    height: 110,
    backgroundColor: colors.background.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  demoFooterLines: {
    flex: 1,
    padding: 12,
    gap: 8,
    justifyContent: "center",
  },
  demoFooterLine: {
    height: 8,
    backgroundColor: colors.border.default,
    borderRadius: 4,
  },
  demoFooterBar: {
    height: 44,
    backgroundColor: colors.background.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
    paddingHorizontal: 16,
  },
  demoFooterTab: {
    width: 32,
    height: 20,
    borderRadius: 6,
    backgroundColor: colors.border.default,
  },
});
