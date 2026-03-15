
import React, { useEffect, useState } from "react";
import { fetch } from 'expo/fetch';

import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  Image,
} from "react-native";
import { Verse } from "../services/SQLiteService";
import { QuranImages } from "../constants/imageMap";

interface TafsirModalProps {
  visible: boolean;
  verse: Verse | null;
  pageNumber: number | null;
  onClose: () => void;
}

const LINE_ASPECT_RATIO = 1440 / 232;

export const TafsirModal: React.FC<TafsirModalProps> = ({
  visible,
  verse,
  pageNumber,
  onClose,
}) => {
  const [tafsirText, setTafsirText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    if (visible && verse && verse.chapter_id) {
      fetchTafsir(verse.chapter_id, verse.number);
    } else {
      setTafsirText(null);
      setError(null);
    }
  }, [visible, verse]);

  const fetchTafsir = async (chapterId: number, verseNumber: number) => {
    setLoading(true);
    setError(null);
    try {
      // Tafsir Muyassar ID is 166 on Quran.com API
      const url = `https://api.quran.com/api/v4/quran/tafsirs/166?verse_key=${chapterId}:${verseNumber}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.tafsirs && data.tafsirs.length > 0) {
        // The API returns HTML in text sometimes, need to strip it or render it
        // Usually for Muyassar it is plain text but let's check
        const text = data.tafsirs[0].text;
        // Simple HTML strip if needed (very basic)
        const cleanText = text.replace(/<[^>]*>?/gm, '');
        setTafsirText(cleanText);
      } else {
        setError("لم يتم العثور على التفسير");
      }
    } catch (err) {
      console.error("Error fetching tafsir:", err);
      setError("حدث خطأ أثناء تحميل التفسير. يرجى التحقق من الاتصال بالإنترنت.");
    } finally {
      setLoading(false);
    }
  };

  const renderVerseLines = () => {
    if (!verse || !pageNumber) return null;
    
    // Get unique lines for this verse
    const lines = Array.from(new Set(verse.highlights1441.map(h => h.line))).sort((a, b) => a - b);
    
    // Calculate line height based on modal width or some ratio
    // The QuranPage uses width of screen. Here we are in a modal which has padding.
    // But we probably want to display the full line width to maintain aspect ratio.
    // The modal content has padding: 20.
    const modalContentWidth = width - 40; // Approximate available width
    const lineHeight = modalContentWidth / LINE_ASPECT_RATIO;
    
    return (
      <View style={styles.verseContainer}>
        {lines.map(lineIndex => {
          const pageImages = QuranImages[pageNumber];
          const imageSource = pageImages ? pageImages[lineIndex] : null;
          
          if (!imageSource) return null;
          
          return (
            <View key={lineIndex} style={{ width: modalContentWidth, height: lineHeight, overflow: 'hidden' }}>
              <Image 
                source={imageSource} 
                style={{ width: modalContentWidth, height: lineHeight }} 
                resizeMode="stretch" 
              />
              {/* Highlight the verse parts */}
              {verse.highlights1441
                .filter(h => h.line === lineIndex)
                .map((h, i) => (
                  <View 
                    key={i} 
                    style={{
                      position: "absolute",
                      left: h.left_position * modalContentWidth,
                      width: (h.right_position - h.left_position) * modalContentWidth,
                      height: "100%",
                      backgroundColor: "rgba(88, 168, 105, 0.2)",
                      borderRadius: 4
                    }} 
                  />
                ))
              }
            </View>
          );
        })}
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: height * 0.7 }]}>
          <View style={styles.header}>
            <Text style={styles.title}>تفسير الميسر</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {renderVerseLines()}
            <View style={styles.separator} />
            {loading ? (
              <ActivityIndicator size="large" color="#8B4513" />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <Text style={styles.tafsirText}>{tafsirText}</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row-reverse", // Arabic layout
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
    fontFamily: "System", 
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: "#333",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  verseText: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 15,
    color: "#000",
    fontFamily: "System", // Should use Uthmanic font if available but system is safer fallback
    lineHeight: 30,
  },
  separator: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  tafsirText: {
    fontSize: 16,
    textAlign: "right", // Arabic
    lineHeight: 24,
    color: "#333",
    fontFamily: "System",
  },
  verseContainer: {
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});
