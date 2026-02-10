const Database = require("better-sqlite3");
const db = new Database("assets/quran.db");

console.log("=== Verse Markers Analysis ===\n");

console.log("1. Verse count with/without markers:");
const versesWithMarkers = db.prepare("SELECT COUNT(*) as count FROM verses WHERE marker1441_line IS NOT NULL").get().count;
const versesWithoutMarkers = db.prepare("SELECT COUNT(*) as count FROM verses WHERE marker1441_line IS NULL").get().count;
console.log("With marker1441_line:", versesWithMarkers);
console.log("Without marker1441_line:", versesWithoutMarkers);

console.log("\n2. Sample verses WITH markers:");
const sampleWith = db.prepare("SELECT verseID, number, chapter_id, marker1441_line, marker1441_centerX, marker1441_centerY FROM verses WHERE marker1441_line IS NOT NULL LIMIT 10").all();
console.log(sampleWith);

console.log("\n3. Sample verses WITHOUT markers:");
const sampleWithout = db.prepare("SELECT verseID, number, chapter_id, marker1441_line FROM verses WHERE marker1441_line IS NULL LIMIT 10").all();
console.log(sampleWithout);

console.log("\n4. Checking if page 1 verses have markers:");
const page1Verses = db.prepare(`
  SELECT v.verseID, v.number, v.marker1441_line, v.marker1441_centerX, v.marker1441_centerY
  FROM verses v
  WHERE v.page1441_id = 0
  ORDER BY v.number
`).all();
console.log("Page 1 verses:", page1Verses);

console.log("\n5. What page_id does page 1 map to?");
const page1 = db.prepare("SELECT * FROM pages WHERE number = 1").get();
console.log("Page 1:", page1);

db.close();
