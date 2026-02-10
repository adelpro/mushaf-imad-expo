const Database = require('better-sqlite3');
const db = new Database('assets/quran.db');

const chapters = db.prepare('SELECT COUNT(*) as count FROM chapters').get();
const pages = db.prepare('SELECT COUNT(*) as count FROM pages').get();
const chapterHeaders = db.prepare('SELECT COUNT(*) as count FROM chapter_headers').get();
const verses = db.prepare('SELECT COUNT(*) as count FROM verses').get();
const versesWithMarkers = db.prepare("SELECT COUNT(*) as count FROM verses WHERE marker1441_line IS NOT NULL").get();

console.log('Database content:');
console.log('- Chapters:', chapters.count);
console.log('- Pages:', pages.count);
console.log('- Chapter headers:', chapterHeaders.count);
console.log('- Verses:', verses.count);
console.log('- Verses with markers:', versesWithMarkers.count);

console.log('\nSample chapter headers (page 1):');
const headers = db.prepare('SELECT * FROM chapter_headers WHERE page_id = 1 LIMIT 5').all();
console.log(headers);

console.log('\nSample verses with markers (page 1):');
const verseMarkers = db.prepare("SELECT verseID, number, chapter_id, marker1441_line, marker1441_centerX, marker1441_centerY FROM verses WHERE page1441_id = 1 AND marker1441_line IS NOT NULL LIMIT 10").all();
console.log(verseMarkers);

db.close();
