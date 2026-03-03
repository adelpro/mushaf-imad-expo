import React from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Bookmark } from "../types/Bookmark";
import { useBookmarks } from "../hooks/useBookmarks";

interface Props {
  visible: boolean;
  onClose: () => void;
  onNavigateToPage: (pageNumber: number) => void;
}

export function BookmarksListModal({
  visible,
  onClose,
  onNavigateToPage,
}: Props) {
  const { bookmarks, removeBookmark } = useBookmarks();
  const insets = useSafeAreaInsets();

  const handleDelete = (bookmark: Bookmark) => {
    Alert.alert("حذف العلامة", "هل تريد حذف هذه العلامة المرجعية؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            await removeBookmark(bookmark.id);
          } catch (error) {
            console.log("Error deleting bookmark:", error);
          }
        },
      },
    ]);
  };

  const handlePress = (bookmark: Bookmark) => {
    onNavigateToPage(bookmark.page_number);
    onClose();
  };

  const renderItem = ({ item }: { item: Bookmark }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handlePress(item)}
      accessibilityLabel={`آية ${item.verse_number}`}
      accessibilityRole="button"
    >
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemVerse}>الآية {item.verse_number}</Text>
          <Text style={styles.itemPage}>صفحة {item.page_number}</Text>
        </View>
        {item.note !== "" && (
          <Text style={styles.itemNote} numberOfLines={2}>
            {item.note}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDelete(item)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel="حذف العلامة"
        accessibilityRole="button"
      >
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>إغلاق</Text>
          </TouchableOpacity>
          <Text style={styles.title}>العلامات المرجعية</Text>
          <View style={{ width: 50 }} />
        </View>

        {bookmarks.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>لا توجد علامات مرجعية</Text>
          </View>
        ) : (
          <FlatList
            data={bookmarks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8E1",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF8E1",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  closeText: {
    fontSize: 16,
    color: "#1B5E20",
    fontWeight: "600",
  },
  list: {
    padding: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  itemVerse: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B5E20",
  },
  itemPage: {
    fontSize: 14,
    color: "#888",
  },
  itemNote: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
    textAlign: "right",
  },
  deleteBtn: {
    marginLeft: 12,
    padding: 8,
  },
  deleteBtnText: {
    fontSize: 16,
    color: "#D32F2F",
    fontWeight: "bold",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
  },
});
