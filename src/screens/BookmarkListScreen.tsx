import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useBookmarks } from "../hooks/useBookmarks";
import { Bookmark } from "../services/BookmarkService";

interface BookmarkListScreenProps {
  visible: boolean;
  onClose: () => void;
  onNavigateToPage: (pageNumber: number) => void;
}

export const BookmarkListScreen: React.FC<BookmarkListScreenProps> = ({
  visible,
  onClose,
  onNavigateToPage,
}) => {
  const { bookmarks, loading, remove, updateNote } = useBookmarks();
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [noteText, setNoteText] = useState("");

  const handleDelete = (bookmark: Bookmark) => {
    Alert.alert("حذف العلامة", "هل تريد حذف هذه العلامة المرجعية؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => remove(bookmark.verseID),
      },
    ]);
  };

  const handleEditNote = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setNoteText(bookmark.note);
  };

  const handleSaveNote = async () => {
    if (editingBookmark) {
      await updateNote(editingBookmark.verseID, noteText.trim());
      setEditingBookmark(null);
      setNoteText("");
    }
  };

  const handleNavigate = (bookmark: Bookmark) => {
    onNavigateToPage(bookmark.pageNumber);
    onClose();
  };

  const renderBookmark = ({ item }: { item: Bookmark }) => (
    <TouchableOpacity
      style={styles.bookmarkItem}
      onPress={() => handleNavigate(item)}
      onLongPress={() => handleDelete(item)}
    >
      <View style={styles.bookmarkHeader}>
        <Text style={styles.chapterName}>سورة {item.chapterName}</Text>
        <Text style={styles.verseNumber}>الآية {item.verseNumber}</Text>
      </View>

      <View style={styles.bookmarkMeta}>
        <Text style={styles.pageNumber}>صفحة {item.pageNumber}</Text>
      </View>

      {item.note ? (
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>{item.note}</Text>
        </View>
      ) : null}

      <View style={styles.bookmarkActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditNote(item)}
        >
          <Text style={styles.actionButtonText}>
            {item.note ? "تعديل الملاحظة" : "إضافة ملاحظة"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            حذف
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>إغلاق</Text>
          </TouchableOpacity>
          <Text style={styles.title}>العلامات المرجعية</Text>
          <View style={styles.placeholder} />
        </View>

        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>جار التحميل...</Text>
          </View>
        ) : bookmarks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔖</Text>
            <Text style={styles.emptyText}>لا توجد علامات مرجعية</Text>
            <Text style={styles.emptySubtext}>
              اضغط على آية ثم اختر "علامة مرجعية" لإضافتها
            </Text>
          </View>
        ) : (
          <FlatList
            data={bookmarks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderBookmark}
            contentContainerStyle={styles.list}
          />
        )}

        <Modal
          visible={editingBookmark !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setEditingBookmark(null)}
        >
          <TouchableOpacity
            style={styles.noteOverlay}
            activeOpacity={1}
            onPress={() => setEditingBookmark(null)}
          >
            <TouchableOpacity activeOpacity={1} style={styles.noteModal}>
              <Text style={styles.noteModalTitle}>ملاحظة</Text>
              <TextInput
                style={styles.noteInput}
                value={noteText}
                onChangeText={setNoteText}
                placeholder="اكتب ملاحظتك هنا..."
                placeholderTextColor="#999"
                multiline
                textAlign="right"
                autoFocus
              />
              <View style={styles.noteModalFooter}>
                <TouchableOpacity
                  style={styles.noteModalButton}
                  onPress={() => setEditingBookmark(null)}
                >
                  <Text style={styles.noteModalButtonText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.noteModalButton, styles.noteModalSaveButton]}
                  onPress={handleSaveNote}
                >
                  <Text
                    style={[
                      styles.noteModalButtonText,
                      styles.noteModalSaveText,
                    ]}
                  >
                    حفظ
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#1B5E20",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  closeButton: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  placeholder: {
    width: 40,
  },
  list: {
    padding: 16,
  },
  bookmarkItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bookmarkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chapterName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  verseNumber: {
    fontSize: 14,
    color: "#666",
  },
  bookmarkMeta: {
    flexDirection: "row",
    marginBottom: 8,
  },
  pageNumber: {
    fontSize: 12,
    color: "#888",
  },
  noteContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: "#333",
    textAlign: "right",
    lineHeight: 22,
  },
  bookmarkActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: "#E8F5E9",
  },
  actionButtonText: {
    fontSize: 13,
    color: "#1B5E20",
  },
  deleteButton: {
    backgroundColor: "#FFEBEE",
  },
  deleteButtonText: {
    color: "#D32F2F",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
  },
  noteOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  noteModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "85%",
    padding: 20,
  },
  noteModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B5E20",
    textAlign: "center",
    marginBottom: 16,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    color: "#333",
  },
  noteModalFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  noteModalButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  noteModalButtonText: {
    fontSize: 16,
    color: "#666",
  },
  noteModalSaveButton: {
    backgroundColor: "#1B5E20",
  },
  noteModalSaveText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
