const fs = require('fs');
let content = fs.readFileSync('src/constants.js', 'utf8');

const prefixStr = `    "PRUNUS JUDDII",
    "PRUNUS YEDEOENSIS",
    "PRUNUS PUGETENSIS",`;

content = content.replace(`    "PRUNUS JUDDII",`, prefixStr);
fs.writeFileSync('src/constants.js', content);
