// Quran Component - Chapter Popup Component
import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Chapter } from "./types";
import { useTheme } from "../../theme";

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
  const { colors } = useTheme();

  if (!chapter) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.modal,
            {
              backgroundColor: colors.modalBackground,
              shadowColor: colors.modalShadow,
            },
          ]}
        >
          <View
            style={[
              styles.header,
              { borderBottomColor: colors.modalBorder },
            ]}
          >
            <Text style={[styles.chapterName, { color: colors.accentText }]}>
              سورة {chapter.arabicTitle}
            </Text>
            <Text
              style={[styles.englishName, { color: colors.tertiaryText }]}
            >
              {chapter.englishTitle}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text
                style={[styles.infoLabel, { color: colors.tertiaryText }]}
              >
                رقم السورة
              </Text>
              <Text
                style={[styles.infoValue, { color: colors.accentText }]}
              >
                {chapter.number}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text
                style={[styles.infoLabel, { color: colors.tertiaryText }]}
              >
                نوع
              </Text>
              <Text
                style={[styles.infoValue, { color: colors.accentText }]}
              >
                {chapter.isMeccan ? "مكية" : "مدنية"}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text
                style={[styles.infoLabel, { color: colors.tertiaryText }]}
              >
                الصفحة
              </Text>
              <Text
                style={[styles.infoValue, { color: colors.accentText }]}
              >
                {pageNumber}
              </Text>
            </View>
          </View>

          <View
            style={[styles.footer, { borderTopColor: colors.modalBorder }]}
          >
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text
                style={[
                  styles.buttonText,
                  { color: colors.secondaryButtonText },
                ]}
              >
                إغلاق
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.primaryButton },
              ]}
              onPress={onLongPress}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: colors.primaryButtonText },
                ]}
              >
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
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    borderRadius: 16,
    width: "85%",
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  chapterName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  englishName: {
    fontSize: 14,
    marginTop: 2,
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
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    borderTopWidth: 1,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
  },
});
