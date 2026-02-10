const Database = require('better-sqlite3');
const db = new Database('assets/quran.db');

console.log('First 5 pages:');
const pages = db.prepare('SELECT * FROM pages ORDER BY identifier LIMIT 5').all();
console.log(pages);

console.log('\nPage 1 (identifier=1) chapter headers:');
const page1Headers = db.prepare('SELECT * FROM chapter_headers WHERE page_id = 1').all();
console.log(page1Headers);

console.log('\nPage with number=1 (if exists):');
const pageNum1 = db.prepare('SELECT * FROM pages WHERE number = 1').get();
console.log(pageNum1);

db.close();
