import { useEffect, useState, useCallback, useRef } from 'react';
import { useAudioPlayer } from 'expo-audio';
import {
  getChapterTiming,
  getAudioUrl,
  AyahTiming,
} from '../services/ayah-timing-service';

export type AudioSyncState = {
  isPlaying: boolean;
  isLoaded: boolean;
  currentVerse: number | null;
  currentTimeMs: number;
  durationMs: number;
  verseTiming: AyahTiming | null;
};

type UseAudioSyncOptions = {
  reciterId: number;
  chapterNumber: number;
  onVerseChange?: (verseNumber: number | null) => void;
};

export function useAudioSync({
  reciterId,
  chapterNumber,
  onVerseChange,
}: UseAudioSyncOptions) {
  const audioUrl = getAudioUrl(reciterId, chapterNumber);
  const player = useAudioPlayer(audioUrl ?? '');

  const [state, setState] = useState<AudioSyncState>({
    isPlaying: false,
    isLoaded: false,
    currentVerse: null,
    currentTimeMs: 0,
    durationMs: 0,
    verseTiming: null,
  });

  const lastVerseRef = useRef<number | null>(null);
  const onVerseChangeRef = useRef(onVerseChange);
  onVerseChangeRef.current = onVerseChange;

  const chapterTiming = getChapterTiming(reciterId, chapterNumber);

  useEffect(() => {
    lastVerseRef.current = null;
    setState((prev) => ({
      ...prev,
      currentVerse: null,
      currentTimeMs: 0,
      verseTiming: null,
      isPlaying: false,
    }));
    onVerseChangeRef.current?.(null);
  }, [chapterNumber, reciterId]);

  useEffect(() => {
    if (!chapterTiming) return;

    const interval = setInterval(() => {
      const playing = player.playing;
      const currentTimeMs = (player.currentTime ?? 0) * 1000;
      const durationMs = (player.duration ?? 0) * 1000;

      let currentVerse: number | null = null;
      let verseTiming: AyahTiming | null = null;

      if (chapterTiming) {
        const timing = chapterTiming.aya_timing.find(
          (t) => currentTimeMs >= t.start_time && currentTimeMs < t.end_time,
        );
        if (timing) {
          currentVerse = timing.ayah;
          verseTiming = timing;
        }
      }

      const resolvedVerse = currentVerse ?? lastVerseRef.current;

      setState((prev) => ({
        isPlaying: playing,
        isLoaded: true,
        currentVerse: resolvedVerse,
        currentTimeMs,
        durationMs,
        verseTiming: verseTiming ?? prev.verseTiming,
      }));

      if (currentVerse !== null && currentVerse !== lastVerseRef.current) {
        lastVerseRef.current = currentVerse;
        onVerseChangeRef.current?.(currentVerse);
      } else if (currentVerse === null && lastVerseRef.current !== null) {
        lastVerseRef.current = null;
        onVerseChangeRef.current?.(null);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [player, chapterTiming]);

  const play = useCallback(() => {
    player.play();
  }, [player]);

  const pause = useCallback(() => {
    player.pause();
  }, [player]);

  const togglePlay = useCallback(() => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player]);

  const seekToVerse = useCallback(
    (verseNumber: number) => {
      if (!chapterTiming) return;
      const timing = chapterTiming.aya_timing.find((t) => t.ayah === verseNumber);
      if (timing) {
        player.seekTo(timing.start_time / 1000);
      }
    },
    [player, chapterTiming],
  );

  const seekTo = useCallback(
    (timeMs: number) => {
      player.seekTo(timeMs / 1000);
    },
    [player],
  );

  const nextVerse = useCallback(() => {
    if (!chapterTiming || state.currentVerse === null) return;
    const currentIndex = chapterTiming.aya_timing.findIndex(
      (t) => t.ayah === state.currentVerse,
    );
    if (currentIndex >= 0 && currentIndex < chapterTiming.aya_timing.length - 1) {
      const next = chapterTiming.aya_timing[currentIndex + 1];
      player.seekTo(next.start_time / 1000);
    }
  }, [player, chapterTiming, state.currentVerse]);

  const previousVerse = useCallback(() => {
    if (!chapterTiming || state.currentVerse === null) return;
    const currentIndex = chapterTiming.aya_timing.findIndex(
      (t) => t.ayah === state.currentVerse,
    );
    if (currentIndex > 0) {
      const prev = chapterTiming.aya_timing[currentIndex - 1];
      player.seekTo(prev.start_time / 1000);
    }
  }, [player, chapterTiming, state.currentVerse]);

  return {
    ...state,
    play,
    pause,
    togglePlay,
    seekToVerse,
    seekTo,
    nextVerse,
    previousVerse,
  };
}
