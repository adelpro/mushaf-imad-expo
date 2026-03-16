import { useCallback } from "react";
import { useRouter } from "expo-router";

import { ProgressScreen } from "../../src/screens/progress-screen";
import { useMushafStore } from "../../src/store/mushaf-store";
import { useUiStore } from "../../src/store/ui-store";

export default function ProgressRoute() {
  const router = useRouter();
  const setJumpToPage = useMushafStore((s) => s.setJumpToPage);
  const setCurrentPage = useMushafStore((s) => s.setCurrentPage);
  const footerVisible = useUiStore((s) => s.footerVisible);
  const setFooterVisible = useUiStore((s) => s.setFooterVisible);
  const reportUserActivity = useUiStore((s) => s.reportUserActivity);

  const handleContinueReading = useCallback(
    (page: number) => {
      setJumpToPage(page);
      setCurrentPage(page);
      router.navigate("/(tabs)");
    },
    [router, setCurrentPage, setJumpToPage]
  );

  const handleContentTap = useCallback(() => {
    if (footerVisible) {
      setFooterVisible(false);
    } else {
      reportUserActivity();
    }
  }, [footerVisible, setFooterVisible, reportUserActivity]);

  return (
    <ProgressScreen onContinueReading={handleContinueReading} onContentTap={handleContentTap} />
  );
}
