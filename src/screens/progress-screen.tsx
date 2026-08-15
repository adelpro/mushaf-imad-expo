import React, { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ContinueReadingCard } from "../components/continue-reading-card";
import { OverallProgress } from "../components/overall-progress";
import { ReadingBarChart, type BarDatum } from "../components/reading-bar-chart";
import { getLastRead, clearLastRead, type LastRead } from "../services/last-read-service";
import { getReadPages, clearAllReadProgress } from "../services/read-pages-service";
import {
  getDailyReadCounts,
  getDailyGoal,
  getNinetyDayReadCounts,
  getPagesReadToday,
  getReadingStreaks,
  setDailyGoal,
  MIN_DAILY_GOAL,
  MAX_DAILY_GOAL,
} from "../services/read-history-service";
import { toArabicDigits, weekdayLabel } from "../utils/date-utils";
import Feather from "@expo/vector-icons/Feather";
import { databaseService } from "../services/sqlite-service";
import { useMushafStore } from "../store/mushaf-store";
import { colors } from "../theme";

/**
 * Progress screen — the reading report for the whole app.
 *
 * Loads every data source (last-read position, khatma pages, today's wird,
 * daily goal, weekly/monthly/90-day charts, streaks and average pace) when
 * the tab gains focus, then renders: the header badge, the continue-reading
 * card, the double-ring completion card, the reading-streak card, the three
 * bar charts, and a reset-progress action. Pull-to-refresh reloads all data.
 *
 * Fixes applied on top of the issue #67 work:
 *  - no <Pressable> wrapper (the tap-to-hide-footer behavior leaked from the
 *    mushaf screen and swallowed touches on the +/- buttons and continue CTA)
 *  - daily-goal stepper clamps to [MIN, MAX] so the shown value always
 *    matches the stored value
 *  - charts get a best-day/week callout, a goal line, and today's highlight
 */
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
      <Text style={styles.emptyText}>افتح المصحف واقرأ لترى آخر موضع قراءتك هنا</Text>
    </View>
  );
}

/** Proper Arabic plural form for a day count. */
function dayWord(n: number): string {
  if (n === 1) return "يوم";
  if (n === 2) return "يومين";
  if (n <= 10) return "أيام";
  return "يومًا";
}

function ScreenHeader({ readCount }: { readCount: number }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTextCol}>
        <Text style={styles.headerTitle}>تقرير تقدمك</Text>
        <Text style={styles.headerSubtitle}>تابع رحلتك مع القرآن الكريم</Text>
      </View>
      <View style={styles.headerBadge}>
        <Text style={styles.headerBadgeValue}>{toArabicDigits(readCount)}</Text>
        <Text style={styles.headerBadgeLabel}>صفحة مقروءة</Text>
      </View>
    </View>
  );
}

export function ProgressScreen({ onContinueReading }: ProgressScreenProps) {
  const insets = useSafeAreaInsets();
  const [lastReadData, setLastReadData] = useState<LastReadWithChapter | null>(null);
  const [readCount, setReadCount] = useState(0);
  const [verseCount, setVerseCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [wirdCount, setWirdCount] = useState(0);
  const [dailyGoal, setDailyGoalState] = useState(5);
  const [weeklyData, setWeeklyData] = useState<BarDatum[]>([]);
  const [monthlyData, setMonthlyData] = useState<BarDatum[]>([]);
  const [ninetyDayData, setNinetyDayData] = useState<BarDatum[]>([]);
  const [avgPagesPerDay, setAvgPagesPerDay] = useState(0);
  const [streaks, setStreaks] = useState<{ current: number; best: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const setJumpToPage = useMushafStore((s) => s.setJumpToPage);

  const loadLastRead = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [lastRead, readPages, pagesToday, goal, weekly, monthly, ninetyDay, readingStreaks] =
        await Promise.all([
          getLastRead(),
          getReadPages(),
          getPagesReadToday(),
          getDailyGoal(),
          getDailyReadCounts(7),
          getDailyReadCounts(30),
          getNinetyDayReadCounts(), // last 90 days, bucketed by week
          getReadingStreaks(),
        ]);
      setReadCount(readPages.length);
      setWirdCount(pagesToday);
      setDailyGoalState(goal);
      setWeeklyData(weekly.map((d) => ({ label: weekdayLabel(d.key), count: d.count })));
      setMonthlyData(
        monthly.map((d) => ({ label: toArabicDigits(Number(d.key.slice(8))), count: d.count }))
      );
      setNinetyDayData(ninetyDay);
      // Average pages/day over the last 90 days (used for the completion estimate).
      const total90 = ninetyDay.reduce((acc, d) => acc + d.count, 0);
      const avgPagesPerDay = total90 > 0 ? total90 / 90 : 0;

      const verses =
        readPages.length > 0 ? await databaseService.getVerseCountForPageNumbers(readPages) : 0;
      setVerseCount(verses);
      setAvgPagesPerDay(avgPagesPerDay);
      setStreaks(readingStreaks);
      if (!lastRead) {
        setLastReadData(null);
        return;
      }
      const chapter = await databaseService.getChapterByNumber(lastRead.chapterNumber);
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
      setWirdCount(0);
      setWeeklyData([]);
      setMonthlyData([]);
      setNinetyDayData([]);
      setAvgPagesPerDay(0);
      setStreaks(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLastRead(true);
    setRefreshing(false);
  }, [loadLastRead]);

  useFocusEffect(
    useCallback(() => {
      void loadLastRead();
    }, [loadLastRead])
  );

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
            await Promise.all([clearLastRead(), clearAllReadProgress()]);
            await loadLastRead();
          },
        },
      ]
    );
  }, [loadLastRead]);

  const handleDailyGoalChange = useCallback(async (goal: number) => {
    const clamped = Math.min(MAX_DAILY_GOAL, Math.max(MIN_DAILY_GOAL, Math.round(goal)));
    await setDailyGoal(clamped);
    setDailyGoalState(clamped);
  }, []);

  const bestOf = (data: BarDatum[]) =>
    data.reduce<BarDatum | null>((acc, d) => (d.count > (acc?.count ?? -1) ? d : acc), null);

  const renderContent = () => {
    if (loading) return <ProgressLoading />;
    return (
      <View style={styles.sections}>
        <ScreenHeader readCount={readCount} />
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
            wirdCount={wirdCount}
            dailyGoal={dailyGoal}
            avgPagesPerDay={avgPagesPerDay}
            onDailyGoalChange={handleDailyGoalChange}
          />
        </View>
        {streaks && (streaks.current > 0 || streaks.best > 0) ? (
          <View style={styles.streakCard}>
            <View style={styles.streakIconBox}>
              <Feather name="zap" size={16} color="#F59E0B" />
            </View>
            <View style={styles.streakTextCol}>
              <Text style={styles.streakTitle}>سلسلة القراءة</Text>
              <Text style={styles.streakText}>
                {streaks.current > 0
                  ? `متواصل ${toArabicDigits(streaks.current)} ${dayWord(streaks.current)} 🔥`
                  : "اقرأ اليوم لتبدأ سلسلتك"}
                {streaks.best > 0
                  ? ` · الأفضل ${toArabicDigits(streaks.best)} ${dayWord(streaks.best)}`
                  : ""}
              </Text>
            </View>
          </View>
        ) : null}
        {weeklyData.length > 0 && (
          <View style={styles.chartsSection}>
            <ReadingBarChart
              title="القراءة هذا الأسبوع"
              icon="calendar"
              data={weeklyData}
              unit="صفحة"
              highlightLast
              best={bestOf(weeklyData)}
              bestTitle="أفضل يوم"
              goalLine={dailyGoal}
              goalLabel="الهدف"
            />
            <ReadingBarChart
              title="القراءة هذا الشهر"
              icon="trending-up"
              data={monthlyData}
              labelEvery={5}
              unit="صفحة"
              best={bestOf(monthlyData)}
              bestTitle="أفضل يوم"
            />
            <ReadingBarChart
              title="القراءة خلال 90 يوم"
              icon="pie-chart"
              data={ninetyDayData}
              labelEvery={3}
              unit="صفحة"
              best={bestOf(ninetyDayData)}
              bestTitle="أفضل أسبوع"
            />
          </View>
        )}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetProgress}
          activeOpacity={0.7}
        >
          <Feather name="trash-2" size={15} color={colors.text.error} />
          <Text style={styles.resetButtonText}>مسح التقدم والبدء من الصفر</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.brand.default]}
          tintColor={colors.brand.default}
          title="جارٍ التحديث..."
        />
      }
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
    paddingBottom: 48,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
    marginTop: 4,
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text.primary,
    writingDirection: "rtl",
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 3,
    writingDirection: "rtl",
  },
  headerBadge: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headerBadgeValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.brand.default,
  },
  headerBadgeLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    writingDirection: "rtl",
  },
  sections: {
    gap: 16,
  },
  overallProgressWrapper: {
    marginTop: 4,
  },
  chartsSection: {
    gap: 16,
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
  streakCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  streakIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  streakTextCol: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.primary,
    writingDirection: "rtl",
  },
  streakText: {
    fontSize: 12,
    color: "#B45309",
    marginTop: 2,
    writingDirection: "rtl",
  },
  resetButton: {
    marginTop: 32,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(229, 57, 53, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(229, 57, 53, 0.04)",
  },
  resetButtonText: {
    color: colors.text.error,
    fontSize: 15,
    fontFamily: "uthman_tn1_bold",
  },
});
