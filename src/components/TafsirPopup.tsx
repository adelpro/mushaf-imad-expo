import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  useWindowDimensions,
} from "react-native";
import { useTafsir } from "../hooks/useTafsir";
import { toArabicDigits } from "../utils/toArabicDigits";

interface TafsirPopupProps {
  visible: boolean;
  chapterId: number | null;
  verseNumber: number | null;
  chapterName?: string;
  onClose: () => void;
}

export function TafsirPopup({
  visible,
  chapterId,
  verseNumber,
  chapterName,
  onClose,
}: TafsirPopupProps) {
  const { height: screenHeight } = useWindowDimensions();
  const sheetHeight = screenHeight * 0.55;

  const { tafsir, loading, error, retry } = useTafsir(
    visible ? chapterId : null,
    visible ? verseNumber : null,
  );

  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      slideAnim.stopAnimation();
      slideAnim.setValue(sheetHeight);
    }
  }, [visible, slideAnim, sheetHeight]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: sheetHeight,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <Animated.View
          style={[
            styles.sheet,
            { maxHeight: sheetHeight, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View onStartShouldSetResponder={() => true}>
            <View style={styles.handleBar} />

            <View style={styles.header}>
              <Text style={styles.title}>التفسير الميسر</Text>
              {chapterName && verseNumber !== null && (
                <Text style={styles.subtitle}>
                  سورة {chapterName} - الآية {toArabicDigits(verseNumber)}
                </Text>
              )}
            </View>

            <ScrollView
              style={[styles.content, { maxHeight: sheetHeight - 150 }]}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator
            >
              {loading && (
                <View style={styles.centerContent}>
                  <ActivityIndicator size="large" color="#1B5E20" />
                  <Text style={styles.loadingText}>جاري تحميل التفسير...</Text>
                </View>
              )}

              {error && !loading && (
                <View style={styles.centerContent}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={retry}>
                    <Text style={styles.retryText}>إعادة المحاولة</Text>
                  </TouchableOpacity>
                </View>
              )}

              {tafsir && !loading && (
                <Text style={styles.tafsirText}>{tafsir.text}</Text>
              )}
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Text style={styles.closeButtonText}>إغلاق</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#D0D0D0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  subtitle: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
  },
  content: {},
  contentContainer: {
    padding: 20,
  },
  centerContent: {
    alignItems: "center",
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#888",
  },
  errorText: {
    fontSize: 14,
    color: "#D32F2F",
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#1B5E20",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  tafsirText: {
    fontSize: 18,
    lineHeight: 32,
    color: "#1B1B1B",
    textAlign: "right",
    writingDirection: "rtl",
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    alignItems: "center",
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
});
