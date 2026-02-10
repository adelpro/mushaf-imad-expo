const Database = require('better-sqlite3');
const db = new Database('assets/quran.db');

console.log('Pages table schema:');
const pageSchema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='pages'").get();
console.log(pageSchema.sql);

console.log('\nPage 1 data:');
const page1 = db.prepare('SELECT * FROM pages WHERE identifier = 1').get();
console.log(page1);

console.log('\nChapter headers for page 1:');
const headers = db.prepare('SELECT * FROM chapter_headers WHERE page_id = 1').all();
console.log(headers);

db.close();
