import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ContinueReadingCard } from "../components/continue-reading-card";
import { getLastRead, type LastRead } from "../services/last-read-service";
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
  const [loading, setLoading] = useState(true);
  const setJumpToPage = useMushafStore((s) => s.setJumpToPage);

  const loadLastRead = useCallback(async () => {
    setLoading(true);
    try {
      const lastRead = await getLastRead();
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

  const renderContent = () => {
    if (loading) return <ProgressLoading />;
    if (!lastReadData) return <ProgressEmpty />;
    return (
      <View style={styles.sections}>
        <ContinueReadingCard
          data={{
            surahArabicName: lastReadData.surahArabicName,
            ayah: lastReadData.ayah,
            page: lastReadData.page,
          }}
          onContinue={handleContinue}
        />
        {/* Add more progress sections here as needed */}
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
    flex: 1,
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
});
