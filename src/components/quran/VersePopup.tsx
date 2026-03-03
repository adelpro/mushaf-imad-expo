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
import { useTheme } from "../../theme";

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
  const { colors } = useTheme();

  if (!verse) return null;

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
              سورة {chapter?.arabicTitle || ""}
            </Text>
            <Text
              style={[styles.verseNumber, { color: colors.secondaryText }]}
            >
              الآية {verse.number}
            </Text>
          </View>

          <ScrollView style={styles.content}>
            <Text style={[styles.arabicText, { color: colors.primaryText }]}>
              {verse.text}
            </Text>
            <Text
              style={[
                styles.transliteration,
                { color: colors.secondaryText },
              ]}
            >
              {verse.hafsSmartText || verse.textWithoutTashkil}
            </Text>
          </ScrollView>

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
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    borderRadius: 16,
    width: "85%",
    maxHeight: "70%",
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
  verseNumber: {
    fontSize: 14,
  },
  content: {
    padding: 16,
    maxHeight: 300,
  },
  arabicText: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 40,
  },
  transliteration: {
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
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
