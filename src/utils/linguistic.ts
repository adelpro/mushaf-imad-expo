/**
 * Linguistic utilities for Arabic text processing.
 */

const ARABIC_DIGIT_MAP = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Converts a number's digits from Western (0-9) to Arabic-Indic (٠-٩).
 */
export function toArabicDigits(value: number): string {
  return value
    .toString()
    .split('')
    .map((ch) => (ch >= '0' && ch <= '9' ? ARABIC_DIGIT_MAP[Number(ch)] : ch))
    .join('');
}
