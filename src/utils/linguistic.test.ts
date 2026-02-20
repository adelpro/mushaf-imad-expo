import { describe, it, expect } from 'vitest';
import { toArabicDigits } from './linguistic';

describe('toArabicDigits', () => {
  describe('single digits', () => {
    it('should convert 0', () => {
      expect(toArabicDigits(0)).toBe('٠');
    });

    it('should convert 1', () => {
      expect(toArabicDigits(1)).toBe('١');
    });

    it('should convert 9', () => {
      expect(toArabicDigits(9)).toBe('٩');
    });
  });

  describe('multi-digit numbers', () => {
    it('should convert 10', () => {
      expect(toArabicDigits(10)).toBe('١٠');
    });

    it('should convert 114 (total surah count)', () => {
      expect(toArabicDigits(114)).toBe('١١٤');
    });

    it('should convert 286 (longest surah verse count)', () => {
      expect(toArabicDigits(286)).toBe('٢٨٦');
    });

    it('should convert 604 (total mushaf pages)', () => {
      expect(toArabicDigits(604)).toBe('٦٠٤');
    });

    it('should convert 6236 (total ayat count)', () => {
      expect(toArabicDigits(6236)).toBe('٦٢٣٦');
    });
  });

  describe('edge cases', () => {
    it('should convert large numbers', () => {
      expect(toArabicDigits(1000000)).toBe('١٠٠٠٠٠٠');
    });

    it('should handle numbers with all unique digits', () => {
      expect(toArabicDigits(1234567890)).toBe('١٢٣٤٥٦٧٨٩٠');
    });

    it('should handle repeated digits', () => {
      expect(toArabicDigits(111)).toBe('١١١');
    });

    it('should handle numbers with leading zeros when stringified', () => {
      // 100 → "100" → "١٠٠"
      expect(toArabicDigits(100)).toBe('١٠٠');
    });
  });

  describe('Quranic context values', () => {
    it('should convert surah Al-Fatiha number (1)', () => {
      expect(toArabicDigits(1)).toBe('١');
    });

    it('should convert surah Al-Baqara number (2)', () => {
      expect(toArabicDigits(2)).toBe('٢');
    });

    it('should convert surah An-Nas number (114)', () => {
      expect(toArabicDigits(114)).toBe('١١٤');
    });

    it('should convert juz count (30)', () => {
      expect(toArabicDigits(30)).toBe('٣٠');
    });

    it('should convert hizb count (60)', () => {
      expect(toArabicDigits(60)).toBe('٦٠');
    });
  });
});
