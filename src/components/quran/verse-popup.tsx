// Quran Component - Popup Component
import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ToastAndroid,
  Platform,
  Alert,
  Clipboard,
} from "react-native";
import { Verse, Chapter } from "./types";
import { colors } from "../../theme";

interface VersePopupProps {
  visible: boolean;
  verse: Verse | null;
  chapter: Chapter | null;
  onClose: () => void;
  onShareText?: () => void;
  onShareImage?: () => void;
  onSaveProgress?: () => void;
}

export const VersePopup: React.FC<VersePopupProps> = ({
  visible,
  verse,
  chapter,
  onClose,
  onShareText,
  onShareImage,
  onSaveProgress,
}) => {
  if (!verse) return null;

  function handleCopy() {
    const text = `﴿${verse!.text}﴾\n[سورة ${chapter?.arabicTitle ?? ""} - الآية ${verse!.number}]`;
    Clipboard.setString(text);
    if (Platform.OS === "android") {
      ToastAndroid.show("تم النسخ ✓", ToastAndroid.SHORT);
    } else {
      Alert.alert("تم النسخ", "تم نسخ الآية إلى الحافظة.");
    }
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.chapterName}>سورة {chapter?.arabicTitle || ""}</Text>
            <Text style={styles.verseNumber}>الآية {verse.number}</Text>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.arabicText}>{verse.text}</Text>
            <Text style={styles.transliteration}>
              {verse.hafsSmartText || verse.textWithoutTashkil}
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            {/* Share actions row */}
            <View style={styles.shareRow}>
              <TouchableOpacity
                style={[styles.shareActionButton, styles.shareTextButton]}
                onPress={onShareText}
              >
                <Text style={styles.shareActionLabel}>📤 مشاركة نص</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareActionButton, styles.shareImageButton]}
                onPress={onShareImage}
              >
                <Text style={styles.shareActionLabel}>🖼️ مشاركة صورة</Text>
              </TouchableOpacity>
            </View>

            {/* Save progress action */}
            {onSaveProgress && (
              <TouchableOpacity style={styles.saveProgressButton} onPress={onSaveProgress}>
                <Text style={styles.shareActionLabel}>🔖 حفظ التقدم عند هذه الآية</Text>
              </TouchableOpacity>
            )}

            {/* Utility actions row */}
            <View style={styles.utilRow}>
              <TouchableOpacity style={styles.utilButton} onPress={handleCopy}>
                <Text style={styles.utilButtonText}>نسخ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.utilButton} onPress={onClose}>
                <Text style={styles.utilButtonText}>إغلاق</Text>
              </TouchableOpacity>
            </View>
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
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.chapterName}>سورة {chapter.arabicTitle}</Text>
            <Text style={styles.englishName}>{chapter.englishTitle}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>رقم السورة</Text>
              <Text style={styles.infoValue}>{chapter.number}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>نوع</Text>
              <Text style={styles.infoValue}>{chapter.isMeccan ? "مكية" : "مدنية"}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>الصفحة</Text>
              <Text style={styles.infoValue}>{pageNumber}</Text>
            </View>
          </View>

          <View style={styles.chapterFooter}>
            <TouchableOpacity style={styles.utilButton} onPress={onClose}>
              <Text style={styles.utilButtonText}>إغلاق</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chapterDetailButton} onPress={onLongPress}>
              <Text style={styles.chapterDetailText}>تفاصيل</Text>
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
    backgroundColor: colors.background.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: colors.background.surface,
    borderRadius: 16,
    width: "85%",
    maxHeight: "70%",
    overflow: "hidden",
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    alignItems: "center",
  },
  chapterName: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.brand.default,
    marginBottom: 4,
  },
  verseNumber: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  englishName: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  content: {
    padding: 16,
    maxHeight: 300,
  },
  arabicText: {
    fontSize: 24,
    textAlign: "center",
    color: colors.text.primary,
    marginBottom: 12,
    lineHeight: 40,
  },
  transliteration: {
    fontSize: 14,
    textAlign: "center",
    color: colors.text.secondary,
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
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.brand.default,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    padding: 12,
    gap: 8,
  },
  shareRow: {
    flexDirection: "row",
    gap: 8,
  },
  shareActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  shareTextButton: {
    backgroundColor: colors.brand.default,
  },
  shareImageButton: {
    backgroundColor: colors.brand.accent,
  },
  saveProgressButton: {
    backgroundColor: colors.brand.default,
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  shareActionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.inverse,
  },
  utilRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  utilButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  utilButtonText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  chapterFooter: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  chapterDetailButton: {
    backgroundColor: colors.brand.default,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  chapterDetailText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.inverse,
  },
});
