import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from "expo-audio";
import {
  getChapterTiming,
  getAudioUrl,
  type ChapterTiming,
} from "../services/AyahTimingService";

const DEFAULT_RECITER_ID = 1;
const POLL_INTERVAL_MS = 200;

// Configure audio mode once (iOS silent mode + background playback)
setAudioModeAsync({
  playsInSilentMode: true,
  shouldPlayInBackground: true,
}).catch(() => {});

export interface RecitationState {
  isPlaying: boolean;
  isLoaded: boolean;
  activeVerse: number | null;
  currentTimeMs: number;
  durationMs: number;
  progress: number;
  hasEnded: boolean;
  toggle: () => void;
  seekToVerse: (verseNumber: number) => void;
  reset: () => void;
}

export function useRecitationPlayer(chapterId: number): RecitationState {
  const initialUrl = getAudioUrl(DEFAULT_RECITER_ID, chapterId);
  const player = useAudioPlayer(initialUrl);
  const status = useAudioPlayerStatus(player);

  const [activeVerse, setActiveVerse] = useState<number | null>(null);
  const [hasEnded, setHasEnded] = useState(false);
  const timingRef = useRef<ChapterTiming | null>(null);
  const toggleInProgress = useRef(false);
  const prevChapterRef = useRef(chapterId);

  // On chapter change: pause, replace source, reset state
  useEffect(() => {
    if (prevChapterRef.current === chapterId) {
      // Initial mount — just load timing
      timingRef.current = getChapterTiming(DEFAULT_RECITER_ID, chapterId);
      return;
    }
    prevChapterRef.current = chapterId;

    player.pause();
    const newUrl = getAudioUrl(DEFAULT_RECITER_ID, chapterId);
    if (newUrl) {
      player.replace(newUrl);
    }
    timingRef.current = getChapterTiming(DEFAULT_RECITER_ID, chapterId);
    setActiveVerse(null);
    setHasEnded(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  // Polling loop for verse synchronization — filter ayah=0 (Bismillah)
  useEffect(() => {
    if (!status.playing) return;

    const interval = setInterval(() => {
      const timing = timingRef.current;
      if (!timing) return;

      const timeMs = player.currentTime * 1000;
      const entry = timing.aya_timing.find(
        (t) => timeMs >= t.start_time && timeMs < t.end_time,
      );

      if (entry && entry.ayah > 0) {
        setActiveVerse((prev) =>
          prev !== entry.ayah ? entry.ayah : prev,
        );
      } else if (entry && entry.ayah === 0) {
        setActiveVerse(null);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [status.playing, player]);

  // Detect end of chapter
  useEffect(() => {
    if (status.didJustFinish) {
      setHasEnded(true);
      setActiveVerse(null);
    }
  }, [status.didJustFinish]);

  const toggle = useCallback(async () => {
    if (toggleInProgress.current) return;
    toggleInProgress.current = true;
    try {
      if (hasEnded) {
        await player.seekTo(0);
        setHasEnded(false);
        player.play();
        return;
      }
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
    } finally {
      toggleInProgress.current = false;
    }
  }, [player, hasEnded]);

  const seekToVerse = useCallback(
    async (verseNumber: number) => {
      const timing = timingRef.current;
      if (!timing) return;
      const entry = timing.aya_timing.find((t) => t.ayah === verseNumber);
      if (entry) {
        await player.seekTo(entry.start_time / 1000);
        setHasEnded(false);
      }
    },
    [player],
  );

  const reset = useCallback(async () => {
    player.pause();
    await player.seekTo(0);
    setActiveVerse(null);
    setHasEnded(false);
  }, [player]);

  const currentTimeMs = status.currentTime * 1000;
  const durationMs = status.duration * 1000;
  const progress =
    durationMs > 0 ? Math.min(1, Math.max(0, currentTimeMs / durationMs)) : 0;

  return {
    isPlaying: status.playing,
    isLoaded: status.isLoaded,
    activeVerse,
    currentTimeMs,
    durationMs,
    progress,
    hasEnded,
    toggle,
    seekToVerse,
    reset,
  };
}
