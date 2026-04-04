const fs = require('fs');
let content = fs.readFileSync('src/constants.js', 'utf8');

const labelsStr = `  "PRUNUS JUDDII": "Judd Cherry",
  "PRUNUS AMERICANA": "American Plum",
  "PRUNUS CAROLINIANA": "Carolina Laurelcherry",
  "PRUNUS ILICIFOLIA": "Hollyleaf Cherry",
  "PRUNUS LUSITANICA": "Portugal Laurel",
  "PRUNUS SALICINA": "Japanese Plum",
  "PRUNUS BLIREANA": "Blireiana Plum",
  "PRUNUS PUGETENSIS": "Puget Sound Cherry",
  "PRUNUS YEDEOENSIS": "Yoshino Cherry",`;

content = content.replace(`  "PRUNUS JUDDII": "Judd Cherry",`, labelsStr);
fs.writeFileSync('src/constants.js', content);
