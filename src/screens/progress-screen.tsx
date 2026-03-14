import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ContinueReadingCard } from "../components/continue-reading-card";
import { OverallProgress } from "../components/overall-progress";
import { getLastRead, clearLastRead, type LastRead } from "../services/last-read-service";
import {
  getReadPages,
  clearReadPages,
} from "../services/read-pages-service";
import { databaseService } from "../services/sqlite-service";
import { useMushafStore } from "../store/mushaf-store";
import { colors } from "../theme";

type ProgressScreenProps = {
  onContinueReading?: (page: number) => void;
};

type LastReadWithChapter = LastRead & {
  surahName: string;
  surahArabicName: string;
};

function ProgressLoading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.brand.default} />
    </View>
  );
}

function ProgressEmpty() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>
        افتح المصحف واقرأ لترى آخر موضع قراءتك هنا
      </Text>
    </View>
  );
}

export function ProgressScreen({ onContinueReading }: ProgressScreenProps) {
  const insets = useSafeAreaInsets();
  const [lastReadData, setLastReadData] = useState<LastReadWithChapter | null>(
    null,
  );
  const [readCount, setReadCount] = useState(0);
  const [verseCount, setVerseCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const setJumpToPage = useMushafStore((s) => s.setJumpToPage);

  const loadLastRead = useCallback(async () => {
    setLoading(true);
    try {
      const [lastRead, readPages] = await Promise.all([
        getLastRead(),
        getReadPages(),
      ]);
      setReadCount(readPages.length);
      const verses =
        readPages.length > 0
          ? await databaseService.getVerseCountForPageNumbers(readPages)
          : 0;
      setVerseCount(verses);
      if (!lastRead) {
        setLastReadData(null);
        return;
      }
      const chapter = await databaseService.getChapterByNumber(
        lastRead.chapterNumber,
      );
      if (!chapter) {
        setLastReadData(null);
        return;
      }
      setLastReadData({
        ...lastRead,
        surahName: chapter.englishTitle,
        surahArabicName: chapter.arabicTitle,
      });
    } catch {
      setLastReadData(null);
      setReadCount(0);
      setVerseCount(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLastRead();
  }, [loadLastRead]);

  const handleContinue = useCallback(() => {
    if (!lastReadData) return;
    setJumpToPage(lastReadData.page);
    onContinueReading?.(lastReadData.page);
  }, [lastReadData, setJumpToPage, onContinueReading]);

  const handleResetProgress = useCallback(() => {
    Alert.alert(
      "إعادة تعيين التقدم",
      "هل أنت متأكد أنك تريد مسح جميع بيانات تقدمك والبدء من الصفر؟ لا يمكن التراجع عن هذا الإجراء.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "مسح التقدم",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            await Promise.all([clearLastRead(), clearReadPages()]);
            await loadLastRead();
          },
        },
      ]
    );
  }, [loadLastRead]);

  const renderContent = () => {
    if (loading) return <ProgressLoading />;
    return (
      <View style={styles.sections}>
        {lastReadData ? (
          <ContinueReadingCard
            data={{
              surahArabicName: lastReadData.surahArabicName,
              ayah: lastReadData.ayah,
              page: lastReadData.page,
            }}
            onContinue={handleContinue}
          />
        ) : (
          <ProgressEmpty />
        )}
        <View style={styles.overallProgressWrapper}>
          <OverallProgress
            readCount={readCount}
            verseCount={verseCount ?? undefined}
          />
        </View>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetProgress}
          activeOpacity={0.7}
        >
          <Text style={styles.resetButtonText}>مسح التقدم والبدء من الصفر</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {renderContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sections: {
    gap: 8,
  },
  overallProgressWrapper: {
    marginTop: 0,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    writingDirection: "rtl",
  },
  resetButton: {
    marginTop: 32,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.text.error,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  resetButtonText: {
    color: colors.text.error,
    fontSize: 15,
    fontFamily: "uthman_tn1_bold",
  },
});
