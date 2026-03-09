import { useCallback } from "react";

import { MushafScreen } from "../src/screens/mushaf-screen";
import { useUiStore } from "../src/store/ui-store";

export default function MushafRoute() {
  const toggleFooterVisible = useUiStore((s) => s.toggleFooterVisible);

  const handleContentTap = useCallback(() => {
    toggleFooterVisible();
  }, [toggleFooterVisible]);

  return <MushafScreen onContentTap={handleContentTap} />;
}
