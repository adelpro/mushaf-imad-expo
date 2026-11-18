import { useCallback } from "react";
import { useRouter } from "expo-router";

import { ProgressScreen } from "../../src/screens/progress-screen";
import { useMushafStore } from "../../src/store/mushaf-store";

export default function ProgressRoute() {
  const router = useRouter();
  const setJumpToPage = useMushafStore((s) => s.setJumpToPage);
  const setCurrentPage = useMushafStore((s) => s.setCurrentPage);

  const handleContinueReading = useCallback(
    (page: number) => {
      setJumpToPage(page);
      setCurrentPage(page);
      router.navigate("/(tabs)");
    },
    [router, setCurrentPage, setJumpToPage]
  );

  return <ProgressScreen onContinueReading={handleContinueReading} />;
}
