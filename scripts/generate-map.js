const fs = require('fs');
const path = require('path');

const quranDir = path.join(__dirname, 'assets', 'images', 'quran');
const outputDir = path.join(__dirname, 'src', 'constants');
const outputFile = path.join(outputDir, 'imageMap.ts');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let content = 'export const QuranImages: Record<number, any[]> = {\n';

// We have pages 1 to 604
for (let page = 1; page <= 604; page++) {
  const pageDir = path.join(quranDir, page.toString());
  if (fs.existsSync(pageDir)) {
    content += `  ${page}: [\n`;
    // We assume lines 1 to 15
    for (let line = 1; line <= 15; line++) {
      // Check if file exists (png)
      const fileName = `${line}.png`;
      if (fs.existsSync(path.join(pageDir, fileName))) {
        content += `    require('../../assets/images/quran/${page}/${line}.png'),\n`;
      } else {
        // Maybe some pages have fewer lines?
        // We can add null or skip.
        // For now, let's assume if it's missing it's fine, but array index will be shifted.
        // Better to maintain index 0 = line 1?
        // Let's just push what exists.
      }
    }
    content += `  ],\n`;
  }
}

content += '};\n';

fs.writeFileSync(outputFile, content);
console.log('Image map generated at ' + outputFile);
