const fs = require('fs');
let content = fs.readFileSync('src/constants.js', 'utf8');

const colorsStr = `  "PRUNUS JUDDII": "#f0a0c0",
  "PRUNUS ILICIFOLIA": "#f8f8f8",
  "PRUNUS PUGETENSIS": "#f8f0f4",
  "PRUNUS BLIREANA": "#e8628c",
  "PRUNUS YEDEOENSIS": "#f4c8dc",`;

content = content.replace(`  "PRUNUS JUDDII": "#f0a0c0",`, colorsStr);
fs.writeFileSync('src/constants.js', content);
