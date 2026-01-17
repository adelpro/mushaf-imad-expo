export function toArabicDigits(value: number): string {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return value
    .toString(10)
    .split("")
    .map((ch) => (ch >= "0" && ch <= "9" ? map[Number(ch)] : ch))
    .join("");
}

