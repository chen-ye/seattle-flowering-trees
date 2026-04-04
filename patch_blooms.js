const fs = require('fs');
let content = fs.readFileSync('src/constants.js', 'utf8');

const earlyStr = `  "PRUNUS TOMENTOSA": "early",
  "PRUNUS CAROLINIANA": "early",
  "PRUNUS SALICINA": "early",
  "PRUNUS BLIREANA": "early",`;
content = content.replace(`  "PRUNUS TOMENTOSA": "early",`, earlyStr);

const midStr = `  "PRUNUS BENI-TAMANISHIKI": "mid",
  "PRUNUS AMERICANA": "mid",
  "PRUNUS SERRULA": "mid",
  "PRUNUS DOMESTICA": "mid",
  "PRUNUS PUGETENSIS": "mid",
  "PRUNUS YEDEOENSIS": "mid",`;
content = content.replace(`  "PRUNUS BENI-TAMANISHIKI": "mid",`, midStr);

const lateStr = `  "PRUNUS LAUROCERASUS": "late",
  "PRUNUS ILICIFOLIA": "late",
  "PRUNUS LUSITANICA": "late"`;
content = content.replace(`  "PRUNUS LAUROCERASUS": "late"`, lateStr);

fs.writeFileSync('src/constants.js', content);
