// Quran Component - Popup Component
import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Verse, Chapter } from "./types";

interface VersePopupProps {
  visible: boolean;
  verse: Verse | null;
  chapter: Chapter | null;
  onClose: () => void;
  onLongPress?: () => void;
}

export const VersePopup: React.FC<VersePopupProps> = ({
  visible,
  verse,
  chapter,
  onClose,
  onLongPress,
}) => {
  if (!verse) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.chapterName}>
              سورة {chapter?.arabicTitle || ""}
            </Text>
            <Text style={styles.verseNumber}>
              الآية {verse.number}
            </Text>
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
              style={[styles.button, styles.primaryButton]}
              onPress={onLongPress}
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

interface ChapterPopupProps {
  visible: boolean;
  chapter: Chapter | null;
  pageNumber: number;
  onClose: () => void;
  onLongPress?: () => void;
}

export const ChapterPopup: React.FC<ChapterPopupProps> = ({
  visible,
  chapter,
  pageNumber,
  onClose,
  onLongPress,
}) => {
  if (!chapter) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.chapterName}>
              سورة {chapter.arabicTitle}
            </Text>
            <Text style={styles.englishName}>{chapter.englishTitle}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>رقم السورة</Text>
              <Text style={styles.infoValue}>{chapter.number}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>نوع</Text>
              <Text style={styles.infoValue}>
                {chapter.isMeccan ? "مكية" : "مدنية"}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>الصفحة</Text>
              <Text style={styles.infoValue}>{pageNumber}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>إغلاق</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onLongPress}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                تفاصيل
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
  englishName: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
  },
  infoItem: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B5E20",
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
