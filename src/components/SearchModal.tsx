import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVerseSearch } from "../hooks/useVerseSearch";
import { SearchResult } from "../services/SQLiteService";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectResult: (pageNumber: number) => void;
}

export function SearchModal({ visible, onClose, onSelectResult }: Props) {
  const insets = useSafeAreaInsets();
  const { query, setQuery, results, loading, error } = useVerseSearch();

  useEffect(() => {
    if (!visible) {
      setQuery("");
    }
  }, [visible, setQuery]);

  const handleSelect = useCallback(
    (item: SearchResult) => {
      const page = item.page1441_id;
      if (!page || page < 1 || page > 604) {
        Alert.alert("تنبيه", "لا يمكن الانتقال إلى هذه الآية");
        return;
      }
      onSelectResult(page);
      onClose();
    },
    [onSelectResult, onClose],
  );

  const renderItem = useCallback(
    ({ item }: { item: SearchResult }) => (
      <TouchableOpacity
        style={styles.resultRow}
        onPress={() => handleSelect(item)}
        accessibilityLabel={`${item.chapterArabicTitle} الآية ${item.number}`}
        accessibilityRole="button"
      >
        <Text style={styles.resultMeta}>
          {item.chapterArabicTitle} - الآية {item.number}
        </Text>
        <Text style={styles.resultText} numberOfLines={2}>
          {item.searchableText}
        </Text>
      </TouchableOpacity>
    ),
    [handleSelect],
  );

  const trimmed = query.trim();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 12 }]}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="إغلاق البحث"
            accessibilityRole="button"
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="ابحث في القرآن الكريم..."
            placeholderTextColor="#ccc"
            value={query}
            onChangeText={setQuery}
            autoFocus
            textAlign="right"
            returnKeyType="search"
            accessibilityLabel="البحث في القرآن الكريم"
          />
        </View>

        {loading && (
          <ActivityIndicator
            style={styles.center}
            size="large"
            color="#1B5E20"
          />
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {!loading && !error && trimmed !== "" && results.length === 0 && (
          <Text style={styles.emptyText}>لا توجد نتائج</Text>
        )}
        {!loading && results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.verseID.toString()}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </KeyboardAvoidingView>
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
    alignItems: "center",
    backgroundColor: "#1B5E20",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  closeButton: {
    padding: 8,
    marginRight: 8,
  },
  closeText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
  },
  center: {
    marginTop: 40,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
  resultRow: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  resultMeta: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginBottom: 4,
  },
  resultText: {
    fontSize: 16,
    color: "#1B1B1B",
    textAlign: "right",
    lineHeight: 26,
  },
});
