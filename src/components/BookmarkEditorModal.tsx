import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { Bookmark } from "../types/Bookmark";
import { useBookmarks } from "../hooks/useBookmarks";

interface Props {
  visible: boolean;
  verseId: number | null;
  chapterId: number;
  verseNumber: number;
  pageNumber: number;
  existingBookmark: Bookmark | null;
  onClose: () => void;
}

export function BookmarkEditorModal({
  visible,
  verseId,
  chapterId,
  verseNumber,
  pageNumber,
  existingBookmark,
  onClose,
}: Props) {
  const { addBookmark, updateNote, removeBookmark } = useBookmarks();
  const [note, setNote] = useState("");
  const savingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setNote(existingBookmark?.note ?? "");
      savingRef.current = false;
    }
  }, [visible, existingBookmark]);

  const handleSave = async () => {
    if (verseId === null || savingRef.current) return;
    savingRef.current = true;
    try {
      if (existingBookmark) {
        await updateNote(existingBookmark.id, note.trim());
      } else {
        await addBookmark({
          verse_id: verseId,
          chapter_id: chapterId,
          verse_number: verseNumber,
          page_number: pageNumber,
          note: note.trim(),
        });
      }
      onClose();
    } catch (error) {
      console.log("Error saving bookmark:", error);
    } finally {
      savingRef.current = false;
    }
  };

  const handleDelete = () => {
    if (!existingBookmark || savingRef.current) return;
    Alert.alert("حذف العلامة", "هل تريد حذف هذه العلامة المرجعية؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          if (savingRef.current) return;
          savingRef.current = true;
          try {
            await removeBookmark(existingBookmark.id);
            onClose();
          } catch (error) {
            console.log("Error deleting bookmark:", error);
          } finally {
            savingRef.current = false;
          }
        },
      },
    ]);
  };

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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {existingBookmark ? "تعديل العلامة" : "حفظ علامة"}
              </Text>
              <Text style={styles.verseRef}>
                الآية {verseNumber}
              </Text>
            </View>

            <View style={styles.content}>
              <TextInput
                style={styles.input}
                value={note}
                onChangeText={setNote}
                placeholder="أضف ملاحظة..."
                placeholderTextColor="#999"
                multiline
                textAlignVertical="top"
                maxLength={500}
              />
            </View>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.button} onPress={onClose}>
                <Text style={styles.buttonText}>إلغاء</Text>
              </TouchableOpacity>
              {existingBookmark && (
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={handleDelete}
                >
                  <Text style={[styles.buttonText, styles.deleteButtonText]}>
                    حذف
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  حفظ
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

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
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 4,
  },
  verseRef: {
    fontSize: 14,
    color: "#666",
  },
  content: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlign: "right",
    writingDirection: "rtl",
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
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    color: "#666",
  },
  deleteButton: {
    backgroundColor: "#FFEBEE",
  },
  deleteButtonText: {
    color: "#D32F2F",
  },
  saveButton: {
    backgroundColor: "#1B5E20",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
