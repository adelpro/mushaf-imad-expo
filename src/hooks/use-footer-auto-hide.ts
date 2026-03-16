import { useEffect, useRef } from "react";
import { useUiStore, FOOTER_AUTO_HIDE_DELAY_MS } from "../store/ui-store";

/**
 * Subscribes to user activity and hides the footer after a period of inactivity.
 * Call reportUserActivity() from screens when the user taps; that shows the
 * footer and resets the auto-hide timer.
 */
export function useFooterAutoHide() {
  const lastActivityAt = useUiStore((s) => s.lastActivityAt);
  const footerVisible = useUiStore((s) => s.footerVisible);
  const setFooterVisible = useUiStore((s) => s.setFooterVisible);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!footerVisible) return;

    const scheduleHide = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        setFooterVisible(false);
      }, FOOTER_AUTO_HIDE_DELAY_MS);
    };

    scheduleHide();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [lastActivityAt, footerVisible, setFooterVisible]);
}
