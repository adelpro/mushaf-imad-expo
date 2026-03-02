import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from "react-native";
import { toArabicDigits } from "../utils/toArabicDigits";

const MIN_PAGE = 1;
const MAX_PAGE = 604;

interface Props {
  currentPage: number;
  onJumpToPage: (page: number) => void;
}

export const PageJumpHeader: React.FC<Props> = ({
  currentPage,
  onJumpToPage,
}) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<TextInput>(null);

  const handlePageDisplay = () => {
    setInputValue("");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSubmit = () => {
    const pageNum = parseInt(inputValue, 10);
    if (
      !Number.isNaN(pageNum) &&
      pageNum >= MIN_PAGE &&
      pageNum <= MAX_PAGE
    ) {
      onJumpToPage(pageNum);
    }
    setEditing(false);
    setInputValue("");
    Keyboard.dismiss();
  };

  const handleCancel = () => {
    setEditing(false);
    setInputValue("");
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      {editing ? (
        <View style={styles.editRow}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>✕</Text>
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={handleSubmit}
            keyboardType="number-pad"
            placeholder={`١ - ${toArabicDigits(MAX_PAGE)}`}
            placeholderTextColor="#999"
            maxLength={3}
            returnKeyType="go"
            selectTextOnFocus
          />
          <TouchableOpacity onPress={handleSubmit} style={styles.goButton}>
            <Text style={styles.goText}>انتقال</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handlePageDisplay}
          style={styles.pageDisplay}
        >
          <Text style={styles.pageText}>
            صفحة {toArabicDigits(currentPage)}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 44,
    backgroundColor: "#FFF8E1",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#D7CCC8",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  pageDisplay: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  pageText: {
    fontSize: 16,
    color: "#5D4037",
    fontWeight: "600",
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    height: 32,
    width: 80,
    borderWidth: 1,
    borderColor: "#8B4513",
    borderRadius: 6,
    paddingHorizontal: 8,
    textAlign: "center",
    fontSize: 16,
    color: "#333",
    backgroundColor: "#FFF",
  },
  goButton: {
    backgroundColor: "#1B5E20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  goText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  cancelText: {
    fontSize: 16,
    color: "#999",
  },
});
