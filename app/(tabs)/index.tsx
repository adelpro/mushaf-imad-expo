import { useCallback } from "react";

import { MushafScreen } from "../../src/screens/mushaf-screen";
import { useUiStore } from "../../src/store/ui-store";

export default function MushafRoute() {
  const footerVisible = useUiStore((s) => s.footerVisible);
  const setFooterVisible = useUiStore((s) => s.setFooterVisible);
  const reportUserActivity = useUiStore((s) => s.reportUserActivity);

  const handleContentTap = useCallback(() => {
    if (footerVisible) {
      setFooterVisible(false);
    } else {
      reportUserActivity();
    }
  }, [footerVisible, setFooterVisible, reportUserActivity]);

  return <MushafScreen onContentTap={handleContentTap} />;
}
