// Quran Component - Popup Component
import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
  Alert,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Verse, Chapter } from "./types";

export function formatVerseForSharing(
  verse: Verse,
  chapter: Chapter | null,
): string {
  const verseText = verse.text || verse.textWithoutTashkil || "";
  const chapterName = chapter?.arabicTitle || "";
  const reference = chapterName
    ? `[سورة ${chapterName}، الآية ${verse.number}]`
    : `[${verse.humanReadableID}]`;
  return `﴿ ${verseText} ﴾\n${reference}`;
}

export async function shareVerse(
  verse: Verse,
  chapter: Chapter | null,
): Promise<void> {
  const message = formatVerseForSharing(verse, chapter);
  try {
    await Share.share({ message });
  } catch {
    Alert.alert("خطأ", "تعذرت المشاركة");
  }
}

export async function copyVerse(
  verse: Verse,
  chapter: Chapter | null,
): Promise<void> {
  const message = formatVerseForSharing(verse, chapter);
  try {
    await Clipboard.setStringAsync(message);
    Alert.alert("تم النسخ", "تم نسخ الآية إلى الحافظة");
  } catch {
    Alert.alert("خطأ", "تعذر النسخ");
  }
}

interface VersePopupProps {
  visible: boolean;
  verse: Verse | null;
  chapter: Chapter | null;
  onClose: () => void;
}

export const VersePopup: React.FC<VersePopupProps> = ({
  visible,
  verse,
  chapter,
  onClose,
}) => {
  if (!verse) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.chapterName}>
              سورة {chapter?.arabicTitle || ""}
            </Text>
            <Text style={styles.verseNumber}>الآية {verse.number}</Text>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.arabicText}>{verse.text}</Text>
            <Text style={styles.transliteration}>
              {verse.hafsSmartText || verse.textWithoutTashkil}
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>إغلاق</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.shareButton]}
              onPress={() => shareVerse(verse, chapter)}
            >
              <Text style={[styles.buttonText, styles.shareButtonText]}>
                مشاركة
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => copyVerse(verse, chapter)}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                نسخ
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "85%",
    maxHeight: "70%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    alignItems: "center",
  },
  chapterName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 4,
  },
  verseNumber: {
    fontSize: 14,
    color: "#666",
  },
  content: {
    padding: 16,
    maxHeight: 300,
  },
  arabicText: {
    fontSize: 24,
    textAlign: "center",
    color: "#1B1B1B",
    marginBottom: 12,
    lineHeight: 40,
  },
  transliteration: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shareButton: {
    backgroundColor: "#0D47A1",
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#1B5E20",
  },
  buttonText: {
    fontSize: 16,
    color: "#666",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
