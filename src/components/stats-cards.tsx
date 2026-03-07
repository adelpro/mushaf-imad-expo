import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  TOTAL_HIZB,
  TOTAL_JUZ,
  TOTAL_RUB,
} from "../constants/mushaf";
import { colors } from "../theme";

type StatsCardsProps = {
  juzCount: number;
  rubCount: number;
  hizbCount: number;
};

function StatCard({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  return (
    <View style={styles.card}>
      <Text style={[styles.label, { writingDirection: "rtl" }]}>
        {label}
      </Text>
      <View style={styles.countRow}>
        <Text style={styles.count}>{count}</Text>
        <Text style={styles.separator}>/</Text>
        <Text style={styles.total}>{total}</Text>
      </View>
    </View>
  );
}

export function StatsCards({ juzCount, rubCount, hizbCount }: StatsCardsProps) {
  return (
    <View style={styles.container}>
      <StatCard label="الجزء" count={juzCount} total={TOTAL_JUZ} />
      <StatCard label="الربع" count={rubCount} total={TOTAL_RUB} />
      <StatCard label="الحزب" count={hizbCount} total={TOTAL_HIZB} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row-reverse",
    gap: 12,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: colors.background.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.default,
    shadowColor: colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  countRow: {
    flexDirection: "row-reverse",
    alignItems: "baseline",
    gap: 2,
  },
  count: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.brand.default,
  },
  separator: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  total: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
});
